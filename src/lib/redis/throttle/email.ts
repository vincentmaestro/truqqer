import redis from '..';

export async function emailVerifyThrottle(email: string) {
    if(await redis.exists(`email-verify:block:${email}`))
        throw new Error('Too many attempts. Try again later.');

    const emailAttempts = await redis.incr(`email-verify:attempts:${email}`);

    if(emailAttempts === 1) {
        await redis.expire(`email-verify:attempts:${email}`, 600);
    }

    if(emailAttempts > 5) {
        await redis.set(`email-verify:block:${email}`, 1, {
            expiration: { type: 'EX', value: 1800 }
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
