'use server';
import { redirect } from "next/navigation";
import { validateEmail, validateObjectWithZod } from "@/lib/helpers/zod/functions";
import { captcha } from "@/lib/utils/captcha";
import { ActionResult, NewSignupShape } from "@/types/signup";
import { sendEmailVerificationLink } from "@/lib/utils/mail/verify-email";
import { sendSMSVerificationCode } from "@/lib/utils/sms/verify-phone";
import { capitalizeInitialLetters, hashPassword, signToken, verifyToken } from "@/lib/helpers";
import { newUserSchema } from "@/lib/helpers/zod/user";
import { db } from "@/lib/db";
import schemas from '@/lib/db/schemas';
import { emailVerifyThrottle } from "@/lib/redis/throttle/email";
import { sendOtpThrottle, confirmOtpThrottle } from "@/lib/redis/throttle/sms";
import { ipThrottle } from "@/lib/redis/throttle/ip-address";

export async function handleVerifyEmail(_: ActionResult<null>, formData: FormData) {
    const captchaToken = String(formData.get('token'));
    const email = String(formData.get('email'));

    try {
        await captcha(captchaToken);

        const isValidEmail = validateEmail(email);

        if(!isValidEmail.success)
            throw new Error('Invalid email address');

        await ipThrottle();
        await emailVerifyThrottle(email);

        // const existingUser = await db.query.users.findFirst({
        //     where: (user, { eq }) => eq(user.email, isValidEmail.data)
        // });

        // if(existingUser)
        //     return {
        //         success: false,
        //         message: 'verification mail sent! Check inbox or spam folder to continue.'
        //     }

        const token = signToken(
            { email: isValidEmail.data },
            process.env.EMAIL_VERIFICATION_SECRET!,
            '1h'
        );
        
        
        await sendEmailVerificationLink(isValidEmail.data, token);

        return { success: true, message: 'Check your mail inbox or spam folder to continue.' };
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

        if(phone.length < 10 || phone.length > 11 || !/^\d{10,11}$/.test(phone))
            throw new Error('Invalid phone number');

        await ipThrottle();
        await sendOtpThrottle(phone);

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

        const result = verifyToken(token, process.env.PHONE_VERIFICATION_SECRET!);

        if(!result.success)
            return {
                success: false,
                message: 'Verification failed. Refresh this page to retry.'
            }

        const { phone } = result.data;
        
        await ipThrottle();
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

export async function signup(_: NewSignupShape, formData: FormData) {
    const json = {
        name: formData.get('full-name'),
        userType: formData.get('user-type'),
        gender: formData.get('gender'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirm-password')
    };

    try {
        let result = validateObjectWithZod(json, newUserSchema);

        if(!result.success)
            return {
                success: false,
                errors: result.error
            }

        if(result.success && result.data?.password !== result.data?.confirmPassword) {
            return {
                success: false,
                errors: {
                    message: 'passwords do not match!'
                }
            }
        }

        await ipThrottle();
    
        const name = capitalizeInitialLetters(result.data?.name!);
        const password = await hashPassword(result.data?.password!);
        const signupData = {
            email: String(formData.get('email')),
            phone: String(formData.get('phone')),
            name,
            userType: result.data?.userType!,
            gender: result.data?.gender!,
            password
        }
        
        const existingUser = await db.query.users.findFirst({
            where: (user, { eq, or }) => or(
                eq(user.email, signupData.email),
                eq(user.phone, signupData.phone)
            )
        });

        if(existingUser)
            return {
                success: false,
                errors: {
                    message: 'an account already exists for this user.'
                }
            }

        if(signupData.userType === 'user') {
            const [newSignup] = await db.insert(schemas.users)
                .values(signupData)
                .returning();

            const accessToken = signToken(
                { _: newSignup.id },
                process.env.ACCESS_TOKEN_SECRET!,
                '30m'
            );

            return {
                success: true,
                data: {
                    accessToken,
                    email: newSignup.email,
                    phone: newSignup.phone,
                    name: newSignup.name,
                    photo: newSignup.photo,
                    role: newSignup.role
                }
            };
        }

        const [newSignup] = await db.insert(schemas.drivers)
            .values(signupData)
            .returning();

        const accessToken = signToken(
            { _: newSignup.id },
            process.env.ACCESS_TOKEN_SECRET!,
            '30m'
        );

        return {
            success: true,
            data: {
                accessToken,
                email: newSignup.email,
                name: newSignup.name,
                photo: newSignup.photo,
                role: newSignup.role
            }
        };
    }
    catch(err) {
        return {
            success: false,
            errors: {
                message: err instanceof Error ? err.message : String(err)
            }
        }
    }
}
  
