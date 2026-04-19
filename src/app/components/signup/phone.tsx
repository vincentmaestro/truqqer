'use client';
import { useActionState, useEffect, useRef, useState, useTransition } from 'react';
import { handleVerifyPhone, handleConfirmationCode } from '@/actions/signup';

export default function Phone({ email }: {
    email: string
}) {
    const [loading, startTransition] = useTransition();

    const [verifyPhoneStage, setVerifyPhoneStage] = useState(1);
    const [verificationCodeResult, sendVerificationCode] = useActionState(handleVerifyPhone, { success: false, message: '' });

    const [digits, setDigits] = useState(['', '', '', '', '', '']);
    const digitRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [confirmCodeResult, confirmCode] = useActionState(handleConfirmationCode, { success: false, message: '' });

    async function handlePhone(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const form = new FormData(e.currentTarget);
        
        startTransition(async () => {
            // const captchaToken = await grecaptcha.execute(
            //     '6LfYZKUsAAAAAB_0BQnWUfHOjWBjVrOayt4aSZvP',
            //     { action: 'submit' }
            // );
            // form.set('captcha-token', captchaToken);

            form.set('email', email);
    
            sendVerificationCode(form);
        });
    }

    useEffect(() => {
        if(verificationCodeResult.success)
            setVerifyPhoneStage(2);
    }, [verificationCodeResult.success]);

    function enterDigit(e: React.ChangeEvent<HTMLInputElement>, index: number) {
        if(!/^\d+?$/.test(e.target.value) || digits[index])
            return;

        const x = [...digits];

        if(e.target.value.length > 1) {
            for(let i = 0; i < 6; i++) {
                /^\d+?$/.test(e.target.value[i]) ?
                x[i] = e.target.value[i] :
                x[i] = '';
            }
            setDigits(x);
            digitRefs.current[5]?.focus();
        }
        else {
            x[index] = e.target.value;
            setDigits(x);
            digitRefs.current[index + 1]?.focus();
        }
    }

    function removeDigit(e: React.KeyboardEvent<HTMLInputElement>, index: number) {
        if(e.key === 'Backspace') {
            const x = [...digits];

            x[index] = '';
            setDigits(x);

            digitRefs.current[index - 1]?.focus();
        }
    }

    async function handleVerification(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const form = new FormData(e.currentTarget);
        
        startTransition(async () => {
            // const captchaToken = await grecaptcha.execute(
            //     '6LfYZKUsAAAAAB_0BQnWUfHOjWBjVrOayt4aSZvP',
            //     { action: 'submit' }
            // );
            // form.set('captcha-token', captchaToken);

            const code = digits.join('');
            form.set('code', code);

            const token = verificationCodeResult.data!
            form.set('token', token);
    
            confirmCode(form);
        });
    }

    return(
        <>
            {verifyPhoneStage === 1 && (
                <form onSubmit={handlePhone} className='bg-white px-10 py-10 rounded-lg'>
                    <h1 className='font-semibold text-2xl'>Get started</h1>
                    <label className='block'>Let's verify your phone number</label>
                    <br />
                    <div className="flex items-center gap-x-3">
                        <span className='border border-gray-500/50 shadow-lg shadow-gray-500 rounded-md py-0.5 px-2 cursor-default'>+234</span>
                        <input
                        name='phone'
                        type="number"
                        className="rounded-sm py-0.5 px-2 border-2 border-gray-400 outline-none"
                        />
                    </div>
                    <br />
                    <div className='h-6 w-full'>{ loading && <img src="/marching_ants.gif" alt="Loading..." /> }</div>
                    <p className='text-lg text-red-200'>{verificationCodeResult.message}</p>
                    <div className='flex justify-end'>
                        <button
                        className='border-none px-4 py-1 rounded-sm text-white bg-orange-300 disabled:opacity-50'
                        disabled={loading ? true : false}
                        >
                            Next
                        </button>
                    </div>
                </form>
            )}
            
            {verifyPhoneStage === 2 && (
                <form onSubmit={handleVerification} className='bg-white px-10 py-10 rounded-lg'>
                    <h1 className='font-semibold text-2xl'>Get started</h1>
                    <label className='block'>Input the code that was sent to the phone number you provided</label>
                    <br />
                    <div className="grid grid-cols-6 gap-x-3 mt-2 w-[60%]">
                        {digits.map((digit, index) => (
                            <input
                            key={index}
                            type="text"
                            value={digit}
                            ref={el => {digitRefs.current[index] = el}}
                            onChange={e => enterDigit(e, index)}
                            onKeyDown={e => removeDigit(e, index)}
                            className="w-10 h-10 text-center rounded-sm p-1 border-2 border-gray-400 outline-none"
                            />
                        ))}
                    </div>
                    <br />
                    { loading && <img src="/marching_ants.gif" alt="Loading..." /> }
                    <p className='text-lg text-red-200'>{confirmCodeResult.message}</p>
                    <div className='flex justify-end'>
                        <button
                        className='border-none px-4 py-1 rounded-sm text-white bg-orange-300 disabled:opacity-50'
                        disabled={loading ? true : false}
                        >
                            Next
                        </button>
                    </div>
                </form>
            )}
        </>
    )
}