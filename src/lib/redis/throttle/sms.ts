import redis from '..';

export async function sendOtpThrottle(phone: string) {
    if(await redis.exists(`sms-otp:block:${phone}`))
        throw new Error('Too many attempts. Try again later.');

    const otpAttempts = await redis.incr(`sms-otp:attempts:${phone}`);

    if(otpAttempts === 1) {
        await redis.expire(`sms-otp:attempts:${phone}`, 600);
    }

    if(otpAttempts > 5) {
        await redis.set(`sms-otp:block:${phone}`, 1, {
            expiration: { type: 'EX', value: 1800 }
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
    if(await redis.exists(`confirm-sms-otp:block:${phone}`))
        throw new Error('Too many attempts. Try again later.');

    const confirmOtpAttempts = await redis.incr(`confirm-sms-otp:attempts:${phone}`);

    if(confirmOtpAttempts === 1) {
        await redis.expire(`confirm-sms-otp:attempts:${phone}`, 600);
    }

    if(confirmOtpAttempts > 10) {
        await redis.set(`confirm-sms-otp:block:${phone}`, 1, {
            expiration: { type: 'EX', value: 1800 }
        });

        throw new Error('Too many attempts. Try again later.');
    }

    const cooldownSet = await redis.set(`confirm-sms-otp:cooldown:${phone}`, 1, {
        expiration: { type: 'EX', value: 60 },
        condition: 'NX'
    });

    if (!cooldownSet) {
        throw new Error('Wait before retrying...');
    }
}
