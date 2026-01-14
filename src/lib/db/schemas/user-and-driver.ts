import * as drizzle from 'drizzle-orm/pg-core';
import { timestamps } from '../helpers/timestamps';

export const genderEnum = drizzle.pgEnum('gender', ['male', 'female', 'other']);

export const users = drizzle.pgTable(
    'users',
    {
        id: drizzle.uuid().defaultRandom().primaryKey(),
        name: drizzle.varchar().notNull(),
        email: drizzle.varchar().unique().notNull(),
        phone: drizzle.varchar().unique(),
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
        userId: drizzle.uuid().references(() => users.id).primaryKey(),
        location: drizzle.geometry({
            type: 'point',
            mode: 'xy'
        }),
        updatedAt: drizzle.timestamp().default(new Date).notNull()
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
        phone: drizzle.varchar().unique().notNull(),
        gender: genderEnum().notNull(),
        password: drizzle.text().notNull(),
        photo: drizzle.text().notNull(),
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
        driverId: drizzle.uuid().references(() => drivers.id).primaryKey(),
        location: drizzle.geometry({
            type: 'point',
            mode: 'xy'
        }),
        updatedAt: drizzle.timestamp().default(new Date).notNull()
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


//_____________________________________________________________________________________________________________

//                EXPORTING TYPE DEFINITIONS
//______________________________________________________________________________________________________________

export type User = typeof users.$inferSelect;
export type AddUser = typeof users.$inferInsert;

export type Driver = typeof drivers.$inferSelect;
export type AddDriver = typeof drivers.$inferInsert;

export type Session = typeof session.$inferSelect;
export type AddSession = typeof session.$inferInsert;