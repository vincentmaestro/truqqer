import * as drizzle from 'drizzle-orm/pg-core';
import { drivers } from './user-and-driver';
import { timestamps } from '../helpers/timestamps';

// export const vehicleTypeEnum = drizzle.pgEnum('vehicle_type', [
//     'flatbed',
//     'boxed',
//     'tow van',
//     'tipper',
//     'car carrier',
//     'mini truck',
//     'pickup truck',
//     'tanker'
// ]);

export const vehicle = drizzle.pgTable(
    'vehicle',
    {
        id: drizzle.uuid().defaultRandom().primaryKey(),
        driverId: drizzle.uuid().references(() => drivers.id, { onDelete: 'cascade' }).notNull(),
        make: drizzle.varchar().notNull(),
        model: drizzle.varchar().notNull(),
        year: drizzle.varchar().notNull(),
        color: drizzle.text().notNull(),
        photo: drizzle.text(),
        type: drizzle.varchar().notNull(),
        plateNumber: drizzle.varchar().notNull().unique(),
        registrationDocument: drizzle.text(),
        insuranceDocument: drizzle.text(),
        capacity: drizzle.varchar(),
        ...timestamps
    },
    (table) => [
        drizzle.index('driver_id_index').on(table.driverId),
        drizzle.index('truck_type_index').on(table.type),
        drizzle.index('truck_photo').on(table.photo),
    ]
);

export type Vehicle = typeof vehicle.$inferSelect;
export type AddVehicle = typeof vehicle.$inferInsert;
