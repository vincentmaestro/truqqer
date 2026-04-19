import { verifyToken } from "@/lib/helpers";
import { JwtPayload } from 'jsonwebtoken';
import { validateEmail } from '@/lib/helpers/zod/functions';
import Email from "@/app/components/signup/email";
import Phone from "@/app/components/signup/phone";

export default async function ContinueRegistrationPage({ searchParams }: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { tab, token } = await searchParams;

    if(!token)
        return <Email />

    if(Array.isArray(token))
        return <Email info="The link you entered might be incorrect or broken" />

    const validToken = verifyToken(
        token,
        process.env.EMAIL_VERIFICATION_SECRET!,
        function(payload: JwtPayload): payload is { email: string } {
            const { email } = payload;
            const { success } = validateEmail(email);
            return(
                typeof payload === 'object' &&
                success
            )
        }
    );

    if(tab === 'phone') {
        if(!validToken.success)
            return <Email info="The link you entered might be expired or broken" />

        return <Phone email={validToken.data.email} />
    }

    return <Email />
}
