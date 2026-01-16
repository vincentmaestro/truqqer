import * as drizzle from 'drizzle-orm/pg-core';
import { timestamps } from '../helpers/timestamps';

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
        phone: drizzle.varchar().unique(),
        role: drizzle.varchar().default('user').notNull(),
        gender: genderEnum().notNull(),
        password: drizzle.text().notNull(),
        photo: drizzle.text(),
        suspended: drizzle.boolean().default(false).notNull(),
        ...timestamps,
    },
    (table) => [
        drizzle.index('email_index').on(table.email),
        drizzle.index('created_at_index').on(table.createdAt),
    ]
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
        drizzle.index('user_id_idx').on(table.userId),
        drizzle.index('user_location_idx').using('gist', table.location)
    ]
);

export const drivers = drizzle.pgTable(
    'drivers',
    {
        id: drizzle.uuid().defaultRandom().primaryKey(),
        name: drizzle.varchar().notNull(),
        email: drizzle.varchar().unique().notNull(),
        phone: drizzle.varchar().unique(),
        role: drizzle.varchar().default('driver').notNull(),
        gender: genderEnum().notNull(),
        password: drizzle.text().notNull(),
        photo: drizzle.text(),
        approved: drizzle.boolean().default(false).notNull(),
        isAvailable: drizzle.boolean().default(false).notNull(),
        rating: drizzle.numeric({ precision: 4, scale: 2 }),
        suspended: drizzle.boolean().default(false).notNull(),
        ...timestamps
    },
    (table) => [
        drizzle.index('approved_index').on(table.approved),
        drizzle.index('is_available_index').on(table.isAvailable)
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
        drizzle.index('driver_id_idx').on(table.driverId),
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
