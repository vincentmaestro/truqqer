
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import schemas from './schemas';
import loggerFor from "@/lib/utils/logger";
import { captureException } from '@sentry/nextjs';

const logger = loggerFor('Postgres DB');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL!
});

pool.on('error', (err) => {
    logger.error('Unexpected error on idle client', err);
    captureException(err, {
        tags: {
            service: 'Postgres DB',
            context: 'connection failed'
        },
        level: 'error'
    });

    process.exit(1);
});

logger.info('successfully connected to Postgres DB');

export const db = drizzle({
    client: pool,
    schema: schemas,
});
