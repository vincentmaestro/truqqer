
export type ActionResult<T> = {
    success: boolean,
    message: string,
    data?: T
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

export interface Location {
  coords: { latitude: number, longitude: number };
  name: string
}