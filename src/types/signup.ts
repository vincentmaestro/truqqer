
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

export type NewSignupShape = {
    success: boolean;
    data?: NewSignupData;
    errors?: {
        [k: string]: string | undefined
    }
}