import { createClient } from "redis";
import logger from "@/lib/utils/logger";

const redis = 
    globalThis.redis ??
    createClient({
        url: process.env.REDIS_URL!
    });

if(!globalThis.redis) {
    try{
        await redis.connect();
        logger('redis')
            .log('info', 'successfully connected to redis!');
    }
    catch(err) {
        logger('redis')
            .log('error',  err instanceof Error ? err.message: String(err));

        process.exit(1);
    }
}

if (process.env.NODE_ENV !== "production") {
    globalThis.redis = redis;
}

export default redis;
