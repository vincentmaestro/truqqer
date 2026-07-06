import z from "zod";

export const newUserSchema = z.object({
  name: z.string()
    .min(3, 'Full name must be at least 3 characters')
    .regex(/^[A-Za-z -]+$/, 'Full name contains invalid characters'),
  userType: z.enum(['user', 'driver'], 'Must either register to request or offer truck services'),
  gender: z.enum(['male', 'female', 'other'], 'Must be either male, female or other'),
  password: z
    .string()
    .min(8)
    .max(16)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z
    .string()
    .min(8)
    .max(16)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
});

export const newDriverSchema = z.object({
  photo: z.url(),
  licenseNumber: z.string().regex(/^[a-zA-Z]{3}\d{5,6}[a-zA-Z]{3}$/, 'Enter a valid licence number'),
  licensePhoto: z.url()
});

export type NewUserSchema = z.infer<typeof newUserSchema>;
export type NewDriverSchema = z.infer<typeof newDriverSchema>;
