import redis from '..';
import { getIp } from '@/lib/helpers';

export async function ipThrottle() {
    const ip = await getIp();
    const ipAttempts = await redis.incr(`ip:attempts:${ip}`);

    if(ipAttempts === 1)
        await redis.expire(`ip:attempts:${ip}`, 1800);

    if(ipAttempts > 30)
        return {
            success: false,
            message: 'Too many attempts. Try again later.'
        }
}
