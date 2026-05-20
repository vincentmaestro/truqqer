import { cookies } from "next/headers";

export default async function Landing() {
    const cookieStore = await cookies();
    console.log(cookieStore.get('x-auth-token'));
    
    return(
        <>
            <h1 className="my-4 text-center italic font-semibold text-green-400 text-2xl">Registration Successful!</h1>
        </>
    )
}