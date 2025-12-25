import { JwtPayload } from 'jsonwebtoken'
import { verifyToken } from '@/lib/helpers';
import ContinueRegistration from "@/app/components/continue-registration";
import { EmailVerificationPayload } from "@/types/signup";

function isEmailVerificationPayload(
    payload: JwtPayload
): payload is EmailVerificationPayload {
    return(
        typeof payload === 'object' &&
        typeof payload.email === 'string'
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
        isEmailVerificationPayload
    );

    return <ContinueRegistration result={result} />
}