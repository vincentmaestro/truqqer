'server only';

import { validateEmail, validateObjectWithZod } from "@/lib/helpers/zod/functions";
import loggerFor from "@/lib/utils/logger";
import { NewDriverData, NewUserData, NewVehicleData } from "@/types";
import { sendEmailVerificationLink, sendExistingUserSignupNotification } from "@/lib/services/mail/verify-email";
import { sendSMSVerificationCode } from "@/lib/services/sms/verify-phone";
import { capitalizeInitialLetters, hashPassword, signToken, verifyToken } from "@/lib/helpers";
import { newUserSchema, newDriverSchema, NewDriverSchema } from "@/lib/helpers/zod/user-and-driver";
import { newVehicleSchema, NewVehicleSchema } from "@/lib/helpers/zod/vehicle";
import { db } from "@/db";
import schemas from '@/db/schemas';
import { cookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";
import { compare } from "bcrypt";

export async function verifyEmail(email: string) {
    const logger = loggerFor('Email verification service');
    const isValidEmail = validateEmail(email);
    
    if(!isValidEmail.success)
        throw new Error('Invalid email address');
    
    const existingUser = await db.query.users.findFirst({
        where: (user, { eq }) => eq(user.email, isValidEmail.data)
    });
    
    if(existingUser) {
        await sendExistingUserSignupNotification(email);
        return { success: true, message: 'Check your mail inbox or spam folder for steps to continue.' };
    }
    
    const token = signToken(
        { email: isValidEmail.data },
        process.env.EMAIL_VERIFICATION_SECRET!,
        '1h'
    );
    
    await sendEmailVerificationLink(isValidEmail.data, token);
    logger.info('Sent verification email to ' + isValidEmail.data);
    
    return {
        success: true,
        message: 'Check your mail inbox or spam folder for steps to continue.'
    };
}

export async function verifyPhone(phone: string, email: string) {
    if(phone.length < 10 || phone.length > 11 || !/^\d{10,11}$/.test(phone))
        throw new Error('Invalid phone number');

    const logger = loggerFor('SMS OTP sending service');
    const phoneIntlFormat = phone.length === 11 ?
        `+234${phone.substring(1)}` :
        `+234${phone}`;
    
    const existingUser = await db.query.users.findFirst({
        where: (user, { eq }) => eq(user.phone, phoneIntlFormat)
    });
    
    if(existingUser)
        return {
            success: true,
            message: 'You will receive a verification code if an account was found associated with this number.'
        }
    
    await sendSMSVerificationCode(phoneIntlFormat);
    logger.info('Sent an OTP to ' + phoneIntlFormat);
    
    const token = signToken(
        { email, phone: phoneIntlFormat },
        process.env.PHONE_VERIFICATION_SECRET!,
        '1h'
    );
    
    return {
        success: true,
        message: 'Verification code sent!',
        data: token
    };
}

export async function confirmPhone(continueRegistrationToken: string, phone: string, otpFromClient: string) {
    const logger = loggerFor('SMS OTP verification service');
    const cookieStore = await cookies();

    const otp = await redis.get(`sms-otp:${phone}`);
    if(!otp || otpFromClient !== otp)
        throw new Error('Verification failed');

    logger.info(`OTP sent to ${phone} verified successfully`);

    await redis.del(`sms-otp:${phone}`);
    cookieStore.set('crt', continueRegistrationToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7
    });
}

export async function registerNewUser(
    email: string,
    phone: string,
    newUserData: NewUserData,
    newDriverData: NewDriverData,
    newVehicleData: NewVehicleData
) {
    const cookieStore = await cookies();
    const validNewUser = validateObjectWithZod(newUserData, newUserSchema);
    if(!validNewUser.success)
        return {
            success: false as const,
            errors: validNewUser.error
        }
    
    if(validNewUser.success && validNewUser.data?.password !== validNewUser.data?.confirmPassword) {
        return {
            success: false as const,
            errors: {
                message: 'passwords do not match!'
            }
        }
    }
    
    const newSignupData = {
        email,
        phone,
        name: capitalizeInitialLetters(validNewUser.data?.name!),
        userType: validNewUser.data?.userType!,
        gender: validNewUser.data?.gender!,
        password: await hashPassword(validNewUser.data?.password!)
    };

    const existingUser = await db.query.users.findFirst({
        where: (user, { eq, or }) => or(
            eq(user.email, newSignupData.email),
            eq(user.phone, newSignupData.phone)
        )
    });
    
    if(existingUser)
        return {
            success: false as const,
            errors: {
                message: 'An account already exists for this user. If you are looking to convert to a driver, sign in and find option on your profile.'
            }
        }

    type ValidationResult<T> = {
        success: boolean;
        data?: T;
        error?: any;
    }

    let validNewDriver: ValidationResult<NewDriverSchema>;
    let validNewVehicle: ValidationResult<NewVehicleSchema>;

    if(newSignupData.userType === 'driver') {
        validNewVehicle = validateObjectWithZod(newVehicleData, newVehicleSchema);
        if(!validNewVehicle.success)
            return {
                success: false as const,
                errors: {
                    vehicleError: true,
                    ...validNewVehicle.error
                }
            }
    
        validNewDriver = validateObjectWithZod(newDriverData, newDriverSchema);
        if(!validNewDriver.success)
            return {
                success: false as const,
                errors: {
                    driverError: true,
                    ...validNewDriver.error
                }
            }
    }

    const result = await db.transaction(async tx => {
        const [newUser] = await tx.insert(schemas.users)
        .values(newSignupData)
        .returning();
    
        if(newSignupData.userType === 'driver') {
            const [newDriver] = await tx.insert(schemas.drivers)
                .values({
                    userId: newUser.id,
                    ...validNewDriver.data!
                })
                .returning();
    
            await tx.insert(schemas.vehicle)
                .values({
                    driverId: newDriver.id,
                    ...validNewVehicle.data!
                });
    
            const token = signToken(
                { driverId: newDriver.id },
                process.env.NEW_DRIVER_REG_SECRET!
            );
    
            redirect(`/signup/pending-approval?token=${token}`, RedirectType.replace);
        }
    
        const authToken = signToken(
            { userId: newUser.id },
            process.env.ACCESS_TOKEN_SECRET!,
            '15m'
        );
        const refreshToken = signToken(
            { userId: newUser.id },
            process.env.REFRESH_TOKEN_SECRET!,
            '7d'
        );
        
        cookieStore.set('refT', refreshToken, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7
        });
    
        return {
            success: true as const,
            data: authToken
        }
    });
    return result;
}

export async function checkDriverApproved(token: string) {
    const validToken = verifyToken(token, process.env.NEW_DRIVER_REG_SECRET!);
        if(!validToken.success) 
            return {
                success: false as const, 
                message: 'The link you entered might be incorrect or broken'
            }
        
    const { driverId } = validToken.data!
    const driverRecord = await db.query.drivers.findFirst({
      where: (driver, { eq }) => eq(driver.id, driverId),
      columns: { approved: true }
    });
        
    if (!driverRecord) 
        return { 
            success: false as const,
            message: 'No record found for this entry. The link might be incorrect or broken'
        }

    if (!driverRecord.approved) 
        return { 
            success: true,
            message: 'Application under review. Please watch your inbox for timely updates'
        }
        
    return { 
        success: true,
        message: 'Approved'
    }
}

export async function logUserIn(email: string, password: string) {
    const cookieStore = await cookies();

    const existingUser = await db.query.users.findFirst({
        where: (user, { eq }) => eq(user.email, email)
    }); 
    if(!existingUser) 
        return { 
            success: false, 
            message: 'Invalid email/password combination.' 
        }

    const validPassword = await compare(password, existingUser.password);
    if(!validPassword) 
        return { 
            success: false, 
            message: 'Invalid email/password combination.' 
        }

    if(existingUser.suspended)
        return { 
            success: false, 
            message: 'Account suspended.' 
        }

    const authToken = signToken(
        { userId: existingUser.id },
        process.env.ACCESS_TOKEN_SECRET!,
        '15m'
    );
    const refreshToken = signToken(
        { userId: existingUser.id },
        process.env.REFRESH_TOKEN_SECRET!,
        '7d'
    );
    
    cookieStore.set('refT', refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7
    });

    if(existingUser.role === 'driver') {
        const driver = await db.query.drivers.findFirst({
            where: (driver, { eq }) => eq(driver.userId, existingUser.id)
        });

        if(!driver?.approved) {
            const token = signToken(
                { driverId: driver?.id },
                process.env.NEW_DRIVER_REG_SECRET!
            );
                
            redirect(`/signup/pending-approval?token=${token}`, RedirectType.replace);
        }
    }

    return {
        success: true,
        data: authToken
    }
}

