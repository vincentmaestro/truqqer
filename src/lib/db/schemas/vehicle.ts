import * as drizzle from 'drizzle-orm/pg-core';
import { driver } from './user-and-driver';
import { timestamps } from '../helpers/timestamps';


export const vehicleTypeEnum = drizzle.pgEnum('vehicle_type', [
    'flatbed',
    'boxed',
    'tow van',
    'tipper',
    'car carrier',
    'mini truck',
    'tanker'
]);

export const vehicle = drizzle.pgTable(
    'vehicle',
    {
        id: drizzle.uuid().defaultRandom().primaryKey(),
        driverId: drizzle.uuid().references(() => driver.id, { onDelete: 'cascade' }).notNull(),
        make: drizzle.varchar().notNull(),
        model: drizzle.varchar().notNull(),
        year: drizzle.integer().notNull(),
        color: drizzle.text().notNull(),
        image: drizzle.text(),
        truckType: vehicleTypeEnum().notNull(),
        plateNumber: drizzle.varchar().notNull().unique(),
        capacityKg: drizzle.integer(),
        ...timestamps
    },
    (table) => [
        drizzle.index('driver_id_index').on(table.driverId),
        drizzle.index('truck_type_index').on(table.truckType),
        drizzle.index('truck_image').on(table.image),
    ]
);

export type Vehicle = typeof vehicle.$inferSelect;
export type AddVehicle = typeof vehicle.$inferInsert;
