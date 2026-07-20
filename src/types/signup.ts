
export type ActionResult<T> = {
    success: boolean,
    message: string,
    data?: T
}

type NewSignupData = {
    accessToken: string;
    email: string;
    name: string;
    photo: string | null;
    role: string;
}

export type SignupResponse = {
    success: boolean;
    errors?: {
        [k: string]: string
    }
    data?: {
        role: string;
        token: string;
    }
}