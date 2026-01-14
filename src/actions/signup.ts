'use server';
import { capitalizeInitialLetters, hashPassword, signJwt } from "@/lib/helpers";
import { GetStartedResult, UserSignupShape } from "@/types/signup";
import { newUserSchema } from "../lib/helpers/zod/user";
import { validateWithZod } from "@/lib/helpers/zod/functions";
import { sendVerificationMail } from "@/lib/utils/mail/verify-email";
import { db } from "@/lib/db";
import schemas from '@/lib/db/schemas';
import z from "zod";

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
            gender: formData.get('gender'),
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
    
        const name = capitalizeInitialLetters(result.data?.name!);
        const password = await hashPassword(result.data?.password!);
        const newUserData = {
            email: String(formData.get('email')),
            name,
            userType: result.data?.userType!,
            gender: result.data?.gender!,
            password
        }
        
        const existingUser = await db.query.users.findFirst({
            where: (user, { eq }) => eq(user.email, newUserData.email)
        });

        if(existingUser)
            return {
                success: false,
                errors: {
                    message: 'an account already exists for this user.'
                }
            }

        // const newUser = await db.insert(schemas.users)
        //     .values(newUserData)
        //     .returning();
    
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
        console.log('firstly', err);
        return {
            success: false,
            errors: {
                message: err instanceof Error ? err.message : String(err)
            }
        }
    }
}
  
