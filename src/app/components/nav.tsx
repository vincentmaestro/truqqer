import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export default function Nav() {
    return(
        <div className="flex items-center justify-between px-[4%] bg-black/30 h-16">
            <Link href='/' className="text-2xl text-white">
                <h1>TruQQer</h1>
            </Link>

            <div className="flex gap-x-10 items-center">
                <Link href='/' className="text-lg text-white">
                    <h1>Login</h1>
                </Link>
                <Link href='/signup' className="text-lg text-white">
                    <h1>Register</h1>
                </Link>
                <ThemeToggle />
            </div>
        </div>
    )
}