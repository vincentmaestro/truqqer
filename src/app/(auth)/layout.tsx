import Script from "next/script";

export default function AuthLayout({ children }: {
    children: React.ReactNode
}) {
    return(
        <div className="w-full h-screen fixed top-0 overflow-y-scroll bg-[url('/truck1.webp')] bg-no-repeat bg-cover bg-center -z-10">
            <Script
            src='https://www.google.com/recaptcha/api.js?render=6LfYZKUsAAAAAB_0BQnWUfHOjWBjVrOayt4aSZvP'
            strategy='lazyOnload'
            />
            <div className="px-[4%] grid grid-cols-2 gap-x-[8%] mt-20">
                { children }
                <div>
                    <h1 className='text-4xl text-white'>Moving your world with ease.</h1>
                    <br />
                    <p className='text-xl text-white'>Whether you are a logistics expert or just a regular user, TruQQer helps you connect and move things easily, keeping you on the go and your world always spinning.</p>
                </div>
            </div>
            <div className="fixed bottom-4 right-10 max-w-1/2 p-2 rounded-sm bg-background text-foreground">
                <p className="text-center">This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.</p>
            </div>
        </div>
    )
}