import { timestamp } from "drizzle-orm/pg-core";

export const timestamps = {
    createdAt: timestamp().notNull().$defaultFn(() => new Date()),
    updatedAt: timestamp().notNull().$defaultFn(() => new Date()).$onUpdate(() => new Date())
}
