import * as drizzle from 'drizzle-orm/pg-core';
import { timestamps } from '../helpers/timestamps';

export const userTypeEnum = drizzle.pgEnum('user_type', [
    'user',
    'driver',
    'admin'
]);

export const user = drizzle.pgTable(
    'user',
    {
        id: drizzle.uuid().defaultRandom().primaryKey(),
        name: drizzle.varchar().notNull(),
        email: drizzle.varchar().unique().notNull(),
        phone: drizzle.varchar().unique(),
        emailVerified: drizzle.boolean().$defaultFn(() => false),
        phoneVerified: drizzle.boolean().$defaultFn(() => false),
        password: drizzle.text(),
        userType: userTypeEnum().$defaultFn(() => 'user').notNull(),
        profilePicture: drizzle.text(),
        ...timestamps,
        lastLogin: drizzle.timestamp().notNull().$defaultFn(() => new Date())
    },
    (table) => [
        drizzle.index('email_index').on(table.email),
        drizzle.index('created_at_index').on(table.createdAt),
        drizzle.index('last_login_index').on(table.lastLogin)
    ]
);

export const driver = drizzle.pgTable(
    'driver',
    {
        id: drizzle.uuid().defaultRandom().primaryKey(),
        userId: drizzle.uuid().references(() => user.id, { onDelete: 'cascade' }).notNull(),
        licenceNumber: drizzle.varchar().notNull(),
        licenseImage: drizzle.text().notNull(),
        insuranceDocument: drizzle.text(),
        profilePicture: drizzle.text().notNull(),
        approved: drizzle.boolean().$defaultFn(() => false).notNull(),
        isAvailable: drizzle.boolean().$defaultFn(() => false).notNull(),
        rating: drizzle.numeric({ precision: 4, scale: 2 }),
        ...timestamps
    },
    (table) => [
        drizzle.index('user_id_index').on(table.userId),
        drizzle.index('approved_index').on(table.approved),
        drizzle.index('is_available_index').on(table.isAvailable)
    ]
);

export const session = drizzle.pgTable(
    'session',
    {
        id: drizzle.uuid().defaultRandom().primaryKey(),
        userId: drizzle.uuid().references(() => user.id, { onDelete: 'cascade' }).notNull(),
        token: drizzle.text().notNull().unique(),
        ipAddress: drizzle.varchar('ip_address'),
		userAgent: drizzle.text('user_agent'),
        createdAt: drizzle.timestamp().$defaultFn(() => new Date()).notNull(),
        expiresAt: drizzle.timestamp().notNull(),
    },
    (table) => [
        drizzle.index('user_id_index').on(table.userId),
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