import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/helpers';
import ContinueRegistration from '@/app/components/signup/continue-registration';
import Email from "@/app/components/signup/email";

export default async function ContinueRegistrationPage({ searchParams }: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    // const cookieStore = await cookies();
    // const token = cookieStore.get('crt');

    // if(!token)
    //     return <Email />

    // const validToken = verifyToken(
    //     token.value,
    //     process.env.PHONE_VERIFICATION_SECRET!
    // );

    // if(!validToken.success)
    //     return <Email info="The link you entered might be expired or broken" />

    // const { email, phone } = validToken.data;

    return <ContinueRegistration email={'maestroobika@gmail.com'} phone={'+2349023695126'} />
}
