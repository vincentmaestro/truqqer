import Nav from "@/app/components/nav"

export default function AuthLayout({ children }: {
    children: React.ReactNode
}) {
    return(
        <div className="w-full h-screen overflow-y-scroll bg-[url('/truck1.webp')] bg-no-repeat bg-cover bg-center">
            <Nav />
            <div className="px-[4%] grid grid-cols-2 gap-x-[8%] items-center">
                { children }
                <div className="-translate-y-1/6">
                    <h1 className='text-4xl text-white'>Moving your world with ease.</h1>
                    <br />
                    <p className='text-xl text-white'>Whether you are a logistics expert or just a regular user, TruQQer helps connect and move things easily, keeping you on the go and your world steadily spinning.</p>
                </div>
            </div>
        </div>
    )
}