import drizzle from 'drizzle-orm/pg-core';
import { user, driver } from './user-and-driver';

export const userCurrentLocation = drizzle.pgTable(
    'user_current_location',
    {
        userId: drizzle.uuid().references(() => user.id).primaryKey(),
        location: drizzle.geometry({
            type: 'point',
            mode: 'xy'
        }),
        updatedAt: drizzle.timestamp().default(new Date).notNull()
            .$onUpdate(() => new Date())
    },
    (table) => [
        drizzle.index('user_id').on(table.userId),
        drizzle.index('location').using('gist', table.location)
    ]
);

export const driverCurrentLocation = drizzle.pgTable(
    'driver_current_location',
    {
        driverId: drizzle.uuid().references(() => driver.id).primaryKey(),
        location: drizzle.geometry({
            type: 'point',
            mode: 'xy'
        }),
        updatedAt: drizzle.timestamp().default(new Date).notNull()
            .$onUpdate(() => new Date())
    },
    (table) => [
        drizzle.index('driver_id').on(table.driverId),
        drizzle.index('location').using('gist', table.location)
    ]
);
