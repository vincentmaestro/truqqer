'use server';
import { redirect } from "next/navigation";
import { validateEmail, validateObjectWithZod } from "@/lib/helpers/zod/functions";
import { captcha } from "@/lib/utils/captcha";
import { ActionResult, SignupErrorShape } from "@/types/signup";
import { sendEmailVerificationLink } from "@/lib/utils/mail/verify-email";
import { sendSMSVerificationCode } from "@/lib/utils/sms/verify-phone";
import { capitalizeInitialLetters, hashPassword, signToken, verifyToken } from "@/lib/helpers";
import { newUserSchema } from "@/lib/helpers/zod/user";
import { db } from "@/lib/db";
import schemas from '@/lib/db/schemas';
import { emailVerifyThrottle } from "@/lib/redis/throttle/email";
import { smsOtpThrottle, confirmOtpThrottle } from "@/lib/redis/throttle/sms";
import { ipThrottle } from "@/lib/redis/throttle/ip-address";
import { cookies } from "next/headers";

export async function handleVerifyEmail(_: ActionResult<null>, formData: FormData) {
    const captchaToken = String(formData.get('captcha-token'));
    const email = String(formData.get('email'));

    try {
        await captcha(captchaToken);
        await ipThrottle();

        const isValidEmail = validateEmail(email);

        if(!isValidEmail.success)
            throw new Error('Invalid email address');

        await emailVerifyThrottle(email);

        // const existingUser = await db.query.users.findFirst({
        //     where: (user, { eq }) => eq(user.email, isValidEmail.data)
        // });

        // if(existingUser)
        //     return {
        //         success: false,
        //         message: 'Check inbox or spam folder for steps to continue.'
        //     }

        const token = signToken(
            { email: isValidEmail.data },
            process.env.EMAIL_VERIFICATION_SECRET!,
            '1h'
        );
        
        await sendEmailVerificationLink(isValidEmail.data, token);

        return { success: true, message: 'Check your mail inbox or spam folder for steps to continue.' };
    }
    catch(err) {
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

    try{
        await captcha(captchaToken);
        await ipThrottle();

        if(phone.length < 10 || phone.length > 11 || !/^\d{10,11}$/.test(phone))
            throw new Error('Invalid phone number');

        await smsOtpThrottle(phone);

        const phoneIntlFormat = phone.length === 11 ?
            `+234${phone.substring(1)}` :
            `+234${phone}`;

        await sendSMSVerificationCode(phoneIntlFormat);

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
        return {
            success: false,
            message: err instanceof Error ? err.message : String(err)
        }
    }
}

export async function handleConfirmationCode(_: ActionResult<null>, formData: FormData) {
    const captchaToken = String(formData.get('captcha-token'));
    const token = String(formData.get('token'));
    const otpFromClient = String(formData.get('code'));
    let continueRegistration = false;
    
    try {
        await captcha(captchaToken);
        await ipThrottle();

        const result = verifyToken(token, process.env.PHONE_VERIFICATION_SECRET!);

        if(!result.success)
            return {
                success: false,
                message: 'Verification failed. Refresh this page to retry.'
            }

   
            const { phone } = result.data;
        
        await confirmOtpThrottle(phone);

        const otp = await redis.get(`sms-otp:${phone}`);

        if(!otp || otpFromClient !== otp)
            return {
                success: false,
                message: 'Verification failed'
            }

        await redis.del(`sms-otp:${phone}`);
        continueRegistration = true;
    }
    catch(err) {
        return {
            success: false,
            message: err instanceof Error ? err.message : String(err)
        }
    }

    if(continueRegistration) 
        redirect(`/signup/continue-registration?token=${token}`);

    return {
        success: true,
        message: 'Verification succeded'
    }
}

export async function signup(_: SignupErrorShape, formData: FormData) {
    const json = {
        name: formData.get('full-name'),
        userType: formData.get('user-type'),
        gender: formData.get('gender'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirm-password')
    };
    const captchaToken = String(formData.get('captcha-token'));
    const cookieStore = await cookies();

    try {
        await captcha(captchaToken);
        // await ipThrottle();

        const result = validateObjectWithZod(json, newUserSchema);
        if(!result.success)
            return {
                success: false as const,
                errors: result.error
            }

        if(result.success && result.data?.password !== result.data?.confirmPassword) {
            return {
                success: false as const,
                errors: {
                    message: 'passwords do not match!'
                }
            }
        }

        const signupData = {
            email: String(formData.get('email')),
            phone: String(formData.get('phone')),
            name: capitalizeInitialLetters(result.data?.name!),
            userType: result.data?.userType!,
            gender: result.data?.gender!,
            password: await hashPassword(result.data?.password!)
        };
        const existingUser = await db.query.users.findFirst({
            where: (user, { eq, or }) => or(
                eq(user.email, signupData.email),
                eq(user.phone, signupData.phone)
            )
        });

        if(existingUser)
            return {
                success: false as const,
                errors: {
                    message: 'an account already exists for this user.'
                }
            }

        const [newSignup] = await db.insert(schemas.users)
            .values(signupData)
            .returning();

        if(newSignup.role === 'driver') {
            await db.insert(schemas.drivers)
                .values({ userId: newSignup.id })
                .returning();
        }

        const accessToken = signToken(
            { _: newSignup.id },
            process.env.ACCESS_TOKEN_SECRET!,
            '15m'
        );
        const refreshToken = signToken(
            { _: newSignup.id },
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
        return {
            success: false as const,
            errors: {
                message: err instanceof Error ? err.message : String(err)
            }
        }
    }

    redirect('/landing');
}
  
