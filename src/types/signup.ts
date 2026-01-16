
export type GetStartedResult = {
    success: boolean,
    data?: string,
    error?: string
}

export interface EmailVerificationPayload {
    email: string
}

type NewSignupData = {
    accessToken: string;
    email: string;
    name: string;
    photo: string | null;
    role: string;
}

export type NewSignupShape = {
    success: boolean;
    data?: NewSignupData;
    errors?: {
        [k: string]: string | undefined
    }
}