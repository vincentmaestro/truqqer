
export async function captcha(token: string) {
    try {
        const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `secret=${process.env.CAPTCHA_SERVER_KEY!}&response=${token}`
        });
        const { success, score } = await response.json();

        if(!success || score < 0.7)
            throw new Error('are you human?');
    }
    catch(err) {
        throw new Error(err instanceof Error ? err.message: String(err));
    }
}
