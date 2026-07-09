import z from 'zod';

const truckTypes = [
    'crane',
    'flatbed',
    'boxed',
    'tow van',
    'tipper',
    'car carrier',
    'mini truck',
    'pickup truck',
    'tanker',
];

export const newVehicleSchema = z.object({
    make: z.string()
    .min(3, 'Enter a valid vehicle brand name')
    .regex(/^[A-Za-z0-9.-]+$/, 'Can contain only alphabets, "-" and "."'),
    model: z.string()
    .min(3, 'Enter a valid vehicle brand name')
    .regex(/^[A-Za-z0-9.-]+$/, 'Enter a valid car model'),
    year: z.string().regex(/^\d{4}$/, 'Enter a valid year'),
    color: z.string().min(3, 'Color name must be at least 3 letters'),
    type: z.enum(truckTypes, 'Select a truck type from the options'),
    plateNumber: z.string().regex(/^[A-Za-z0-9-]{8,9}$/),
    capacity: z.string().regex(/^\d+(\.\d+)?\s?(Kg|kg|L|Litres)$/i, 'Enter vehicle capacity in Kg/kg or L/Litres. e.g: 1000kg or 6000L').optional(),
    photo: z.url('Provide a photo of the vehicle'),
    registrationDocument: z.url('Provide the registration document of the vehicle'),
    insuranceDocument: z.url('Provide the insurance document of the vehicle')
});

export type NewVehicleSchema = z.infer<typeof newVehicleSchema>;
