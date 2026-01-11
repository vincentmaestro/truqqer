import z from "zod";

export const newUserSchema = z.object({
  name: z.string({ error: 'Enter your name to continue' }).min(3),
  userType: z.enum(['user', 'driver'], {error: 'must be either User or Driver'}),
  gender: z.enum(['male', 'female', 'other'], {error: 'must be either male, female or other'}),
  password: z
    .string()
    .min(8)
    .max(16)
    .regex(/[A-Z]/, 'password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'must contain at least one number'),
    confirmPassword: z
    .string()
    .min(8)
    .max(16)
    .regex(/[A-Z]/, 'password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'must contain at least one number'),
});

export const completeRegistraton = z.object({
  phone: z.string().min(3).max(15).optional()
});


