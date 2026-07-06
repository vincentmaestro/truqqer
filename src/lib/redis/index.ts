import { createClient } from "redis";
import loggerFor from "@/lib/utils/logger";
import { captureException } from '@sentry/nextjs';

const logger = loggerFor('Redis service');
const redis = 
    globalThis.redis ??
    createClient({
        url: process.env.REDIS_URL!
    });

if(!globalThis.redis) {
    try{
        await redis.connect();
        logger.info('successfully connected to Redis.');
    }
    catch(err) {
        logger.error(err instanceof Error ? err.message: String(err), err);
        captureException(err, {
            tags: {
                service: 'Redis',
                context: 'startup/connection failed'
            },
            level: 'error'
        });

        process.exit(1);
    }
}

if (process.env.NODE_ENV !== "production") {
    globalThis.redis = redis;
}

export default redis;
