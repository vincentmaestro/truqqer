'use server';
import { validateEmail, validateObjectWithZod } from "@/lib/helpers/zod/functions";
import { captcha } from "@/lib/utils/captcha";
import { captureException } from '@sentry/nextjs';
import loggerFor from "@/lib/utils/logger";
import { ActionResult, SignupErrorShape } from "@/types/signup";
import { sendEmailVerificationLink, sendExistingUserSignupNotification } from "@/lib/utils/mail/verify-email";
import { sendSMSVerificationCode } from "@/lib/utils/sms/verify-phone";
import { capitalizeInitialLetters, hashPassword, signToken, verifyToken } from "@/lib/helpers";
import { newUserSchema, newDriverSchema, NewDriverSchema } from "@/lib/helpers/zod/user-and-driver";
import { newVehicleSchema, NewVehicleSchema } from "@/lib/helpers/zod/vehicle";
import { db } from "@/lib/db";
import schemas from '@/lib/db/schemas';
import { emailThrottle } from "@/lib/redis/throttle/email";
import { smsOtpThrottle, confirmOtpThrottle } from "@/lib/redis/throttle/sms";
import { ipThrottle } from "@/lib/redis/throttle/ip-address";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function handleVerifyEmail(_: ActionResult<null>, formData: FormData) {
    const captchaToken = String(formData.get('captcha-token'));
    const email = String(formData.get('email'));
    const logger = loggerFor('Email verification service');

    try {
        const captchaError =  await captcha(captchaToken);
        if(captchaError) return captchaError;

        const ipThrottleError = await ipThrottle();
        if(ipThrottleError) return ipThrottleError;

        const isValidEmail = validateEmail(email);

        if(!isValidEmail.success)
            return {
                success: false,
                message: 'Invalid email address'
            }

        const emailThrottleError = await emailThrottle(email);
        if(emailThrottleError) return emailThrottleError;

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

        return { success: true, message: 'Check your mail inbox or spam folder for steps to continue.' };
    }
    catch(err) {
        logger.error('Error encountered in email verification pipeline', err);
        process.env.NODE_ENV === 'production' && captureException(err, {
            tags: {
              endpoint: 'Email verification service',
              note: 'Error encountered in email verification pipeline' 
            },
            level: 'error'
        });
        
        return {
            success: false,
            message: err instanceof Error ? err.message : String(err)
        }
    }
}

export async function handleVerifyPhone(_: ActionResult<string>, formData: FormData) {
    const phone = String(formData.get('phone'));
    const email = String(formData.get('email'));
    const captchaToken = String(formData.get('captcha-token'));
    const logger = loggerFor('SMS OTP sending service');

    try{
        const captchaError =  await captcha(captchaToken);
        if(captchaError) return captchaError;

        const ipThrottleError = await ipThrottle();
        if(ipThrottleError) return ipThrottleError;

        if(phone.length < 10 || phone.length > 11 || !/^\d{10,11}$/.test(phone))
            throw new Error('Invalid phone number');

        const smsOtpThrottleError = await smsOtpThrottle(phone);
        if(smsOtpThrottleError) return smsOtpThrottleError;

        const phoneIntlFormat = phone.length === 11 ?
            `+234${phone.substring(1)}` :
            `+234${phone}`;

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
        }
    }
    catch(err) {
        logger.error('Error encountered trying to send OTP via SMS', err);
        process.env.NODE_ENV === 'production' && captureException(err, {
            tags: {
              endpoint: 'OTP sending service',
              note: 'Error encountered in SMS sending pipeline' 
            },
            level: 'error'
        });

        return {
            success: false,
            message: err instanceof Error ? err.message : String(err)
        }
    }
}

export async function handleConfirmationCode(_: ActionResult<null>, formData: FormData) {
    const logger = loggerFor('SMS OTP verification service');
    const captchaToken = String(formData.get('captcha-token'));
    const continueRegistrationToken = String(formData.get('token'));
    const otpFromClient = String(formData.get('code'));
    const cookieStore = await cookies();
    let continueRegistration = false;
    
    try {
        const captchaError =  await captcha(captchaToken);
        if(captchaError) return captchaError;

        const ipThrottleError = await ipThrottle();
        if(ipThrottleError) return ipThrottleError;

        const validNewUser = verifyToken(continueRegistrationToken, process.env.PHONE_VERIFICATION_SECRET!);

        if(!validNewUser.success)
            return {
                success: false,
                message: 'Verification failed. Refresh this page to retry.'
            }

        const { phone } = validNewUser.data;
        
        const confirmOtpThrottleError = await confirmOtpThrottle(phone);
        if(confirmOtpThrottleError) return confirmOtpThrottleError;

        const otp = await redis.get(`sms-otp:${phone}`);
        if(!otp || otpFromClient !== otp)
            return {
                success: false,
                message: 'Verification failed'
            }

        logger.info(`OTP sent to ${phone} was verified successfully`);

        await redis.del(`sms-otp:${phone}`);
        cookieStore.set('crt', continueRegistrationToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60
        });

        continueRegistration = true;
    }
    catch(err) {
        logger.error('Error encountered while verifying the OTP', err);
        process.env.NODE_ENV === 'production' && captureException(err, {
            tags: {
              endpoint: 'OTP verification service',
              note: 'Error encountered during OTP verification' 
            },
            level: 'error'
        });

        return {
            success: false,
            message: err instanceof Error ? err.message : String(err)
        }
    }

    if(continueRegistration) 
        redirect('/signup/continue-registration');

    return {
        success: true,
        message: 'Verification succeded'
    }
}

export async function signup(_: SignupErrorShape, formData: FormData) {
    const newUserData = {
        name: formData.get('full-name'),
        userType: formData.get('user-type'),
        gender: formData.get('gender'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirm-password')
    };
    const newDriverData = {
        photo: formData.get('driver-photo'),
        licenseNumber: formData.get('driver-license-number')?.toString().toLocaleUpperCase(),
        licensePhoto: formData.get('driver-license-photo')
    };
    const newVehicleData = {
        make: formData.get('vehicle-make'),
        model: formData.get('vehicle-model'),
        year: formData.get('vehicle-year'),
        color: formData.get('vehicle-color'),
        type: formData.get('vehicle-type'),
        plateNumber: formData.get('plate-number'),
        capacity: formData.get('vehicle-capacity'),
        photo: formData.get('vehicle-photo'),
        insuranceDocument: formData.get('vehicle-insurance-document'),
        registrationDocument: formData.get('vehicle-registration-document')
    };
    
    const captchaToken = String(formData.get('captcha-token'));
    const cookieStore = await cookies();
    const logger = loggerFor('New user signup');

    try {
        const captchaError = await captcha(captchaToken);
        if(captchaError) return {
            success: false,
            errors: {
                message: captchaError.message
            }
        };

        const ipThrottleError = await ipThrottle();
        if(ipThrottleError) return {
            success: false,
            errors: {
                message: ipThrottleError.message
            }
        };

        const validNewUser = validateObjectWithZod(newUserData, newUserSchema);
        if(!validNewUser.success)
            return {
                success: false,
                errors: validNewUser.error
            }

        if(validNewUser.success && validNewUser.data?.password !== validNewUser.data?.confirmPassword) {
            return {
                success: false,
                errors: {
                    message: 'passwords do not match!'
                }
            }
        }

        const newSignupData = {
            email: String(formData.get('email')),
            phone: String(formData.get('phone')),
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
                success: false,
                errors: {
                    message: 'An account already exists for this user.'
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
            validNewDriver = validateObjectWithZod(newDriverData, newDriverSchema);
            if(!validNewDriver.success)
                return {
                    success: false,
                    errors: {
                        errorOn: 'driver-vehicle-screen',
                        ...validNewDriver.error
                    }
                }

            validNewVehicle = validateObjectWithZod(newVehicleData, newVehicleSchema);
            if(!validNewVehicle.success)
                return {
                    success: false,
                    errors: {
                        errorOn: 'driver-vehicle-screen',
                        ...validNewVehicle.error
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
                    })
            }

            return newUser;
        });

        const accessToken = signToken(
            { _: result.id },
            process.env.ACCESS_TOKEN_SECRET!,
            '15m'
        );
        const refreshToken = signToken(
            { _: result.id },
            process.env.REFRESH_TOKEN_SECRET!,
            '30d'
        );

        cookieStore.set('x-auth-token', accessToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 15
        });
        cookieStore.set('refT', refreshToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 30
        });
    }
    catch(err) {
        logger.error('Error encountered during account creation', err);
        process.env.NODE_ENV === 'production' && captureException(err, {
            tags: {
              endpoint: 'New user signup',
              note: 'Error encountered when trying to create an account' 
            },
            level: 'error'
        });

        return {
            success: false,
            errors: {
                errorOn: 'driver-vehicle-screen',
                message: err instanceof Error ? err.message : String(err)
            }
        }
    }

    redirect('/landing');
}
  
