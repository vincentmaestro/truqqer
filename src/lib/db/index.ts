
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import schemas from './schemas';
import logger from '../utils/logger';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

pool.on('error', (err, client) => {
    logger.error(`Unexpected error on idle client: ${err}`);
    process.exit(-1);
});

export const db = drizzle({
    client: pool,
    schema: schemas,
});
