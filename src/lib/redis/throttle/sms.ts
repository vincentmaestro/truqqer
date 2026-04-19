import redis from '..';
import { getIp } from '@/lib/helpers';

export async function sendOtpThrottle(phone: string) {
    const ip = await getIp();

    const ipAttempts = await redis.incr(`ip:attempts:${ip}`);

    if(ipAttempts === 1) {
        await redis.expire(`ip:attempts:${ip}`, 10800);
    }

    if(ipAttempts > 9)
        throw new Error('Too many attempts. Try again later.');

    if(await redis.exists(`sms-otp:block:${phone}`))
        throw new Error('Too many attempts. Try again later.');

    const confirmOtpAttempts = await redis.incr(`sms-otp:attempts:${phone}`);

    if(confirmOtpAttempts === 1) {
        await redis.expire(`sms-otp:attempts:${phone}`, 600);
    }

    if(confirmOtpAttempts > 3) {
        await redis.set(`sms-otp:block:${phone}`, 1, {
            expiration: { type: 'EX', value: 3600 }
        });

        throw new Error('Too many attempts. Try again later.');
    }
    
    const cooldownSet = await redis.set(`sms-otp:cooldown:${phone}`, 1, {
        expiration: { type: 'EX', value: 60 },
        condition: 'NX'
    });
    
    if (!cooldownSet) {
        throw new Error('Wait before retrying...');
    }
}

export async function confirmOtpThrottle(phone: string) {
    const ip = await getIp();

    const ipAttempts = await redis.incr(`ip:attempts:${ip}`);

    if(ipAttempts === 1) {
        await redis.expire(`ip:attempts:${ip}`, 10800);
    }

    if(ipAttempts > 9)
        throw new Error('Too many attempts. Try again later.');

    if(await redis.exists(`confirm-otp:block:${phone}`))
        throw new Error('Too many attempts. Try again later.');

    const confirmOtpAttempts = await redis.incr(`confirm-otp:attempts:${phone}`);

    if(confirmOtpAttempts === 1) {
        await redis.expire(`confirm-otp:attempts:${phone}`, 600);
    }

    if(confirmOtpAttempts > 3) {
        await redis.set(`confirm-otp:block:${phone}`, 1, {
            expiration: { type: 'EX', value: 3600 }
        });

        throw new Error('Too many attempts. Try again later.');
    }
    
    const cooldownSet = await redis.set(`confirm-otp:cooldown:${phone}`, 1, {
        expiration: { type: 'EX', value: 60 },
        condition: 'NX'
    });
    
    if (!cooldownSet) {
        throw new Error('Wait before retrying...');
    }
}
