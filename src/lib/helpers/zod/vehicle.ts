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
    .min(3, 'Enter a valid vehicle brand name'),
    model: z.string()
    .min(3, 'Enter valid data')
    .regex(/^[A-Za-z0-9.-]+$/, 'Enter valid data'),
    year: z.string().regex(/^\d{4}$/, 'Enter a valid year'),
    color: z.string().min(3, 'Vehicle color required'),
    type: z.enum(truckTypes, 'Select a type from the options'),
    plateNumber: z.string().regex(/^[A-Za-z0-9-]{8,9}$/, 'Enter a valid licence plate number'),
    capacity: z.preprocess(
        value => value === null || value === '' ? undefined : value,
        z.string().regex(/^\d+(\.\d+)?\s?(Kg|kg|L|Litres)$/i, 'Enter vehicle capacity in Kg/kg or L/Litres. e.g: 1000kg or 6000L')
        .optional()
    ),
    photo: z.url('Provide a photo of the vehicle'),
    registrationDocument: z.url('Provide the registration document of the vehicle'),
    insuranceDocument: z.url('Provide the insurance document of the vehicle')
});

export type NewVehicleSchema = z.infer<typeof newVehicleSchema>;

