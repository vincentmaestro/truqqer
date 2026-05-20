import { verifyToken } from '@/lib/helpers';
import ContinueRegistration from '@/app/components/signup/continue-registration';
import Email from "@/app/components/signup/email";

export default async function ContinueRegistrationPage({ searchParams }: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    // const { token } = await searchParams;

    // if(!token)
    //     return <Email />

    // if(Array.isArray(token))
    //     return <Email info="The link you entered might be incorrect or broken" />

    // const validToken = verifyToken(
    //     token,
    //     process.env.PHONE_VERIFICATION_SECRET!
    // );

    // if(!validToken.success)
    //     return <Email info="The link you entered might be expired or broken" />

    // const { email, phone } = validToken.data;

    return <ContinueRegistration email={'maestroobika@gmail.com'} phone={'+2349023695126'} />
}
