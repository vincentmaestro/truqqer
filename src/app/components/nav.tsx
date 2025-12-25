import Link from "next/link"

export default function Nav() {
    return(
        <div className="flex justify-between px-[10%] py-5 bg-black/30">
            <Link href='/' className="text-2xl text-white">
                <h1>TruQQer</h1>
            </Link>

            <div className="flex gap-x-10">
                <Link href='/' className="text-lg text-white">
                    <h1>Login</h1>
                </Link>
                <Link href='/signup' className="text-lg text-white">
                    <h1>Register</h1>
                </Link>
            </div>
        </div>
    )
}