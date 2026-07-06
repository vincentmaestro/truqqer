import * as Sentry from '@sentry/nextjs';
import loggerFor from '@/lib/utils/logger';

const logger = loggerFor('Google reCaptcha service');

export async function captcha(token: string) {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${process.env.CAPTCHA_SERVER_KEY!}&response=${token}`
    });

    if(!response.ok) {
        logger.error(response);
        Sentry.captureException(response, {
            tags: {
                endpoint: 'https://www.google.com/recaptcha/api/siteverify'
            },
            level: 'error'
        });

        return {
            success: false,
            message: 'Something went wrong, please retry action'
        }
    }

    const { success, score } = await response.json();
    logger.info(`Passed captcha with score of ${score}`, response);

    if(!success || score < 0.7)
        // throw new Error('Failed Captcha, are you human?');
        return {
            success: false,
            message: 'Failed Captcha, are you human?'
        }
}
