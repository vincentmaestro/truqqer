import { doublePrecision, geometry, index, integer, pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { drivers, users } from "./user-and-driver";
import { timestamps } from "../helpers/timestamps";

export const tripStatus = pgEnum('trip_status', [
    'open', 'matched', 'in-progress', 'completed', 'cancelled'
]);

export const trip = pgTable(
    'trip',
    {
        id: uuid().defaultRandom().primaryKey(),
        initiator: uuid().notNull().references(() => users.id, { onDelete: 'restrict' }),
        handler: uuid().references(() => drivers.id, { onDelete: 'restrict' }),
        status: tripStatus().notNull().default('open'),
        vehicleType: varchar().notNull(),
        minCapacityInTonnes: doublePrecision(),
        minVolumeInLitres: integer(),
        fromName: varchar({ length: 255 }).notNull(),
        fromLocation: geometry({ type: 'point', mode: 'xy', srid: 4326 }).notNull(),
        toName: varchar({ length: 255 }).notNull(),
        toLocation: geometry({ type: 'point', mode: 'xy', srid: 4326 }).notNull(),
        scheduledAt: timestamp({ withTimezone: true }),
        priceInKobo: integer().notNull(),
        distanceInMeters: integer(),
        matchedAt: timestamp('matched_at', { withTimezone: true }),
        ...timestamps
    },
    (table) => [
        index('trip_status_idx').on(table.status),
        index('trip_from_location_idx').using('gist', table.fromLocation),
        index('trip_to_location_idx').using('gist', table.toLocation),
    ]
);