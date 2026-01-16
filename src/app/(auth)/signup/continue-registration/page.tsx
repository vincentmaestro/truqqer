import { JwtPayload } from 'jsonwebtoken';
import { EmailVerificationPayload } from "@/types/signup";
import { validateEmail } from '@/lib/helpers/zod/functions';
import { verifyToken } from '@/lib/helpers';
import ContinueRegistration from "@/app/components/continue-registration";

function isValidEmail(
    payload: JwtPayload
): payload is EmailVerificationPayload {
    const { email } = payload;
    const { success } = validateEmail(email);
    return(
        typeof payload === 'object' &&
        success
    )
}

export default async function ContinueRegistrationPage({ searchParams }: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { token } = await searchParams;
    if(!token) {
        return <ContinueRegistration result={{ success: false, error: 'no token provided.' }} />
    }

    if(Array.isArray(token)) {
        return <ContinueRegistration result={{ success: false, error: 'invalid url. make sure to click the link from mailbox or paste correctly.' }} />
    }

    const result = verifyToken(
        token,
        process.env.EMAIL_VERIFICATION_SECRET!,
        isValidEmail
    );

    return <ContinueRegistration result={result} />
}
