'use server';
import { validateEmail, validateObjectWithZod } from "@/lib/helpers/zod/functions";
import { captcha } from "@/lib/utils/captcha";
import { captureException } from '@sentry/nextjs';
import loggerFor from "@/lib/utils/logger";
import { ActionResult, AuthResponse } from "@/types";
import { sendEmailVerificationLink, sendExistingUserSignupNotification } from "@/lib/services/mail/verify-email";
import { sendSMSVerificationCode } from "@/lib/services/sms/verify-phone";
import { capitalizeInitialLetters, hashPassword, signToken, verifyToken } from "@/lib/helpers";
import { db } from "@/db";
import schemas from '@/db/schemas';
import { emailThrottle } from "@/lib/redis/throttle/email";
import { smsOtpThrottle, confirmOtpThrottle } from "@/lib/redis/throttle/sms";
import { ipThrottle } from "@/lib/redis/throttle/ip-address";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { checkDriverApproved, confirmPhone, registerNewUser, verifyEmail, verifyPhone } from "@/lib/auth";
import { email } from "zod";
import { compare } from "bcrypt";

export async function handleVerifyEmail(_: ActionResult<null>, formData: FormData) {
    const captchaToken = String(formData.get('captcha-token'));
    const email = String(formData.get('email'));
    const logger = loggerFor('Email verification service');

    try {
        const captchaError =  await captcha(captchaToken);
        if(captchaError) return captchaError;

        const emailThrottleError = await emailThrottle(email);
        if(emailThrottleError) return emailThrottleError;

        const ipThrottleError = await ipThrottle();
        if(ipThrottleError) return ipThrottleError;

        const response = await verifyEmail(email);
        return response;
    }
    catch(err) {
        logger.error('Error encountered in email verification pipeline', err);
        captureException(err, {
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

    try {
        const captchaError =  await captcha(captchaToken);
        if(captchaError) return captchaError;

        const ipThrottleError = await ipThrottle();
        if(ipThrottleError) return ipThrottleError;

        const smsOtpThrottleError = await smsOtpThrottle(phone);
        if(smsOtpThrottleError) return smsOtpThrottleError;

        const response = await verifyPhone(phone, email);
        return response;
    }
    catch(err) {
        logger.error('Error encountered trying to send OTP via SMS', err);
        captureException(err, {
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

        confirmPhone(continueRegistrationToken, phone, otpFromClient);
        continueRegistration = true;
    }
    catch(err) {
        logger.error('Error encountered while verifying the OTP', err);
        process.env.NODE_ENV === 'production' ? captureException(err, {
            tags: {
              endpoint: 'OTP verification service',
              note: 'Error encountered during OTP verification' 
            },
            level: 'error'
        }) : null;

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

export async function signup(_: AuthResponse, formData: FormData) {
    const newUserData = {
        name: String(formData.get('full-name')),
        userType: String(formData.get('user-type')),
        gender: String(formData.get('gender')),
        password: String(formData.get('password')),
        confirmPassword: String(formData.get('confirm-password'))
    };
    const newDriverData = {
        photo: String(formData.get('driver-photo')),
        licenseNumber: String(formData.get('driver-license-number')),
        licensePhoto: String(formData.get('driver-license-photo'))
    };
    const newVehicleData = {
        make: String(formData.get('vehicle-make')),
        model: String(formData.get('vehicle-model')),
        year: String(formData.get('vehicle-year')),
        color: String(formData.get('vehicle-color')),
        type: String(formData.get('vehicle-type')),
        plateNumber: String(formData.get('plate-number')),
        capacity: String(formData.get('vehicle-capacity')),
        photo: String(formData.get('vehicle-photo')),
        insuranceDocument: String(formData.get('vehicle-insurance-document')),
        registrationDocument: String(formData.get('vehicle-registration-document'))
    };
    
    const captchaToken = String(formData.get('captcha-token'));
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

        const email = String(formData.get('email'));
        const phone = String(formData.get('phone'));
        const response = await registerNewUser(
            email,
            phone,
            newUserData,
            newDriverData,
            newVehicleData
        );

        return response;
    }
    catch(err) {
        logger.error('Error encountered during account creation', err);
        captureException(err, {
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
            },
            data: undefined
        }
    }
}

export async function checkDriverApprovalStatus(token: string) {
    try {
        const ipThrottleError = await ipThrottle();
        if(ipThrottleError) return ipThrottleError;
        
        const response = await checkDriverApproved(token);
        return response;
    }
    catch(err) {
        return { 
            success: false,
            message: err instanceof Error ? err.message : String(err)
        }
    }
}

export async function login(_: ActionResult<null>, formData: FormData) {
    const email = String(formData.get('email'));
    const password = String(formData.get('passord'));
    const captchaToken = String(formData.get('captcha-token'));
    const logger = loggerFor('User login');
    const cookieStore = await cookies();
    let token = '';
    let driverApproved = true;
    let loginSuccessful = false;

    try {
        const captchaError =  await captcha(captchaToken);
        if(captchaError) return captchaError;

        const emailThrottleError = await emailThrottle(email);
        if(emailThrottleError) return emailThrottleError;

        const ipThrottleError = await ipThrottle();
        if(ipThrottleError) return ipThrottleError;

        const validEmail = validateEmail(email);
        if(!validEmail.success)
            return { 
                success: false, 
                message: 'Invalid email address.' 
            }
        
        const existingUser = await db.query.users.findFirst({
            where: (user, { eq }) => eq(user.email, validEmail.data)
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
            '30d'
        );
    
        cookieStore.set('auth-token', authToken, {
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

        if(existingUser.role === 'driver') {
            const driver = await db.query.drivers.findFirst({
                where: (driver, { eq }) => eq(driver.userId, existingUser.id)
            });

            if(!driver?.approved) {
                token = signToken(
                    { driverId: driver?.id },
                    process.env.NEW_DRIVER_REG_SECRET!
                );
                driverApproved = false;
            }
        }
    }
    catch(err) {
        return { 
            success: false,
            message: err instanceof Error ? err.message : String(err)
        }
    }

    if(!driverApproved) {  
        redirect(`/signup/pending-approval?token=${token}`);
    }

    if(loginSuccessful) {
        redirect('/explore');
    }
}
