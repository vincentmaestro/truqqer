
export type ActionResult<T> = {
    success: boolean,
    message: string,
    data?: T
}

export type NewUserData = {
    name: string;
    userType: string;
    gender: string;
    password: string;
    confirmPassword: string;
}

export type NewDriverData = {
    photo: string;
    licenseNumber: string;
    licensePhoto: string;
}

export type NewVehicleData = {
    make: string;
    model: string;
    year: string;
    color: string;
    type: string;
    plateNumber: string;
    capacity: string;
    photo: string;
    insuranceDocument: string;
    registrationDocument: string;
}

export type NewUserResponse = {
    success: false;
    errors: {
        [k: string]: string
    }
} | {
    success: true;
    data: string;
}

export type NewLoginResponse = {
    success: boolean;
    message: string;
} | {
    success: boolean;
    data: string;
}

export interface Location {
  coords: { latitude: number, longitude: number };
  name: string
}