import drizzle from 'drizzle-orm/pg-core';
import { timestamps } from '../helpers/timestamps';

const genderEnum = drizzle.pgEnum('gender', ['male', 'female', 'other']);

export const user = drizzle.pgTable(
    'user',
    {
        id: drizzle.uuid().defaultRandom().primaryKey(),
        name: drizzle.varchar().notNull(),
        email: drizzle.varchar().unique().notNull(),
        phone: drizzle.varchar().unique(),
        gender: genderEnum().notNull(),
        password: drizzle.text().notNull(),
        photo: drizzle.text(),
        searchingForDriver: drizzle.boolean().default(false).notNull(),
        suspended: drizzle.boolean().default(false).notNull(),
        ...timestamps,
    },
    (table) => [
        drizzle.index('email_index').on(table.email),
        drizzle.index('created_at_index').on(table.createdAt),
    ]
);

export const driver = drizzle.pgTable(
    'driver',
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

export type User = typeof user.$inferSelect;
export type AddUser = typeof user.$inferInsert;

export type Driver = typeof driver.$inferSelect;
export type AddDriver = typeof driver.$inferInsert;

export type Session = typeof session.$inferSelect;
export type AddSession = typeof session.$inferInsert;