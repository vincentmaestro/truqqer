'use server';
import { GetStartedResult, UserSignupShape } from "@/types/signup";
import { newUserSchema } from "../lib/helpers/zod/user";
import z from "zod";
import { validateWithZod } from "@/lib/helpers/zod/functions";
import { sendVerificationMail } from "@/lib/utils/mail/verify-email";
import { capitalizeInitialLetters, hashPassword, signJwt } from "@/lib/helpers";
import { db } from "@/lib/db";

export async function getStarted(_: GetStartedResult, formData: FormData) {
    try {
        const email = formData.get('email');

        if (typeof email !== 'string') 
            return { success: false, error: 'Invalid email' };

        const isValidEmail = z.email().safeParse(email);

        if(!isValidEmail.success)
            return { success: false, error: isValidEmail.error.message };

        const token = signJwt(
            { email: isValidEmail.data },
            process.env.EMAIL_VERIFICATION_SECRET!,
            '1d'
        );

        const mailResult = await sendVerificationMail(isValidEmail.data, token);

        if(!mailResult.success)
            return { success: false, error: 'please try that action again. (an error occured.)' };

        return { success: true, data: 'verification mail sent!' };
    }
    catch(err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : String(err)
        }
    }
}

export async function signup(_: UserSignupShape, formData: FormData) {
    try {
        const json = {
            name: formData.get('full-name'),
            userType: formData.get('user-type'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirm-password')
        };
    
        let result = validateWithZod(json, newUserSchema);
    
        if(result.success && result.data?.password !== result.data?.confirmPassword) {
            return {
                success: false,
                errors: {
                    message: 'passwords do not match!'
                }
            }
        }
    
        if(!result.success)
            return {
                success: false,
                errors: result.errors
            }
    
        const name = capitalizeInitialLetters(String(formData.get('full-name')));
        const password = await hashPassword(result.data?.password!);
        const userData = {
            email: formData.get('email'),
            name,
            userType: formData.get('user-type'),
            password
        }
    
        return {
            success: true,
            data: {
                name: 'Umeh',
                userType: "Driver",
                password: 'tjekhlefe',
                confirmPassword: 'ejfkrrg'
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
  
