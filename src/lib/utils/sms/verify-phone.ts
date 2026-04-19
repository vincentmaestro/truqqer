'use server'
import twilio from 'twilio';
import { generate6RandomDigits } from '@/lib/helpers';
import redis from '@/lib/redis';

export async function sendSMSVerificationCode(phone: string) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID!;
    const authToken = process.env.TWILIO_AUTH_TOKEN!;
    const client = twilio(accountSid, authToken);
    const code = generate6RandomDigits();

    try{
        const verification = await client.messages.create({
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_PHONE!}`,
            contentSid: 'HX229f5a04fd0510ce1b071852155d3e75',
            contentVariables: `{"1":"${code}"}`,
            to: `whatsapp:${phone}`
        });

        // const verification = await client.messages.create({
        //     body: "This is the ship that made the Kessel Run in fourteen parsecs?",
        //     from: "+2349023695126",
        //     to: "+18777804236",
        // });
        // console.log(verification);

        const { status, errorCode, errorMessage } = verification;

        if(status !== 'queued' || errorCode !== null || errorMessage !== null)
            throw new Error(`code: ${errorCode}, message: ${errorMessage}, status: ${status}`);

        await redis.set(`sms-otp:${phone}`, code, {
            expiration: { type: 'EX', value: 600 }
        });
    }
    catch(err) {
        console.log(err);
        throw new Error(err instanceof Error ? err.message: String(err));
    }
}
