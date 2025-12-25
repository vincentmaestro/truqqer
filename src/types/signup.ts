import { JwtPayload } from 'jsonwebtoken';

export type GetStartedResult = {
    success: boolean,
    data?: string,
    error?: string
}

export interface EmailVerificationPayload {
    email: string
}

export type UserSignupShape = {
    success: boolean;
    data?: {
        name: string;
        userType: string;
        password: string;
        confirmPassword: string;
    };
    errors?: {
        [k: string]: string | undefined
    }
}