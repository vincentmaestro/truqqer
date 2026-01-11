import { timestamp } from "drizzle-orm/pg-core";

export const timestamps = {
    createdAt: timestamp().notNull().default(new Date),
    updatedAt: timestamp().notNull().default(new Date).$onUpdate(() => new Date())
}
