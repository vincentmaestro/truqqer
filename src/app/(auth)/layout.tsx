import Script from "next/script";

export default function AuthLayout({ children }: {
    children: React.ReactNode
}) {
    const captchaKey = process.env.NEXT_PUBLIC_CAPTCHA_CLIENT_KEY!

    return(
        <div className="fixed inset-0 overflow-y-auto bg-[url('/truck1.webp')] bg-no-repeat bg-cover bg-center -z-10">
            <div className="fixed inset-0 bg-black/40 pointer-events-none" />
            <Script
            src={`https://www.google.com/recaptcha/api.js?render=${captchaKey}`}
            strategy='lazyOnload'
            />
            <div className="relative min-h-full flex items-center px-[4%] pt-24 pb-24">
                <div className="mx-auto w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                    <div className="order-2 lg:order-1 space-y-6 text-white">
                        <h1 className="text-4xl lg:text-6xl font-semibold leading-tight">Moving your world with ease.</h1>
                        <p className="text-lg lg:text-xl text-white/90 leading-relaxed max-w-xl">
                            Whether you are a logistics expert or just a regular user, TruQQer helps you connect and move things easily, keeping you on the go and your world always spinning.
                        </p>
                    </div>
                    <div className="order-1 lg:order-2 w-full flex justify-center lg:justify-end">
                        { children }
                    </div>
                </div>
            </div>
            <div className="fixed bottom-4 inset-x-0 flex justify-center px-4 pointer-events-none">
                <p className="text-xs text-white/80 text-center bg-black/50 backdrop-blur-sm px-3 py-2 rounded-md max-w-md">
                    This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.
                </p>
            </div>
        </div>
    )
}
