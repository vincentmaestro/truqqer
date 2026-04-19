import redis from '..';
import { getIp } from '@/lib/helpers';

export async function emailVerifyThrottle(email: string) {
    const ip = await getIp();

    const ipAttempts = await redis.incr(`ip:attempts:${ip}`);

    if(ipAttempts === 1) {
        await redis.expire(`ip:attempts:${ip}`, 10800);
    }

    if(ipAttempts > 9)
        throw new Error('Too many attempts. Try again later.');

    if(await redis.exists(`email-verify:block:${email}`))
        throw new Error('Too many attempts. Try again later.');

    const emailAttempts = await redis.incr(`email-verify:attempts:${email}`);

    if(emailAttempts === 1) {
        await redis.expire(`email-verify:attempts:${email}`, 600);
    }

    if(emailAttempts > 3) {
        await redis.set(`email-verify:block:${email}`, 1, {
            expiration: { type: 'EX', value: 3600 }
        });

        throw new Error('Too many attempts. Try again later.');
    }
    
    const cooldownSet = await redis.set(`email-verify:cooldown:${email}`, 1, {
        expiration: { type: 'EX', value: 60 },
        condition: 'NX'
    });
    
    if (!cooldownSet) {
        throw new Error('Wait before retrying...');
    }
}
