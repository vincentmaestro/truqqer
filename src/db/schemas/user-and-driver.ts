import * as drizzle from 'drizzle-orm/pg-core';
import { timestamps } from '../helpers/timestamps';

export const roleEnum = drizzle.pgEnum('role', [
    'user',
    'driver',
    'admin'
]);

export const genderEnum = drizzle.pgEnum('gender', [
    'male',
    'female',
    'other'
]);

export const users = drizzle.pgTable(
    'users',
    {
        id: drizzle.uuid().defaultRandom().primaryKey(),
        name: drizzle.varchar().notNull(),
        email: drizzle.varchar().unique().notNull(),
        phone: drizzle.varchar().unique().notNull(),
        role: roleEnum().default('user').notNull(),
        gender: genderEnum().notNull(),
        password: drizzle.text().notNull(),
        photo: drizzle.text(),
        suspended: drizzle.boolean().default(false).notNull(),
        ...timestamps,
    }
);

export const userLocations = drizzle.pgTable(
    'user_locations',
    {
        userId: drizzle.uuid().references(() => users.id, { onDelete: 'cascade' }).primaryKey(),
        location: drizzle.geometry({
            type: 'point',
            mode: 'xy'
        }),
        updatedAt: drizzle.timestamp().defaultNow().notNull()
            .$onUpdate(() => new Date())
    },
    (table) => [
        drizzle.index('user_location_idx').using('gist', table.location)
    ]
);

export const drivers = drizzle.pgTable(
    'drivers',
    {
        id: drizzle.uuid().defaultRandom().primaryKey(),
        userId: drizzle.uuid().references(() => users.id, { onDelete: 'cascade' }).notNull(),
        photo: drizzle.text().notNull(),
        licenseNumber: drizzle.varchar().notNull(),
        licensePhoto: drizzle.text().notNull(),
        approved: drizzle.boolean().default(false).notNull(),
        isAvailable: drizzle.boolean().default(false).notNull(),
        rating: drizzle.numeric({ precision: 4, scale: 2 }),
        ...timestamps
    },
    (table) => [
        drizzle.index('driver_approved_idx').on(table.approved),
        drizzle.index('driver_available_idx').on(table.isAvailable)
    ]
);

export const driverLocations = drizzle.pgTable(
    'driver_locations',
    {
        driverId: drizzle.uuid().references(() => drivers.id, { onDelete: 'cascade' }).primaryKey(),
        location: drizzle.geometry({
            type: 'point',
            mode: 'xy'
        }),
        updatedAt: drizzle.timestamp().defaultNow().notNull()
            .$onUpdate(() => new Date())
    },
    (table) => [
        drizzle.index('driver_location_idx').using('gist', table.location)
    ]
);

export const session = drizzle.pgTable(
    'session',
    {
        id: drizzle.uuid().defaultRandom().primaryKey(),
        token: drizzle.text().notNull().unique(),
        ipAddress: drizzle.varchar('ip_address'),
		userAgent: drizzle.text('user_agent'),
        createdAt: drizzle.timestamp().default(new Date()).notNull(),
        expiresAt: drizzle.timestamp().notNull(),
    },
    (table) => [
        drizzle.index('token_index').on(table.token)
    ]
);


//===================================================================================
// --------------------------EXPORTING TYPE DEFINITIONS------------------------------
//===================================================================================

export type User = typeof users.$inferSelect;
export type Driver = typeof drivers.$inferSelect;
export type Session = typeof session.$inferSelect;
