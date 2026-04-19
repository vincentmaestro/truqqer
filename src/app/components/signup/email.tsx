'use client';
import { useActionState, useState, useTransition } from 'react';
import { handleVerifyEmail } from '@/actions/signup';

export default function Email({ info }: {
    info?: string
}) {
    const [submitEmailResult, submitEmail] = useActionState(handleVerifyEmail, { success: false, message: '' });
    const [loading, startTransition] = useTransition();

    async function handleEmail(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const form = new FormData(e.currentTarget);
        
        startTransition(async () => {
            // const token = await grecaptcha.execute(
            //     '6LfYZKUsAAAAAB_0BQnWUfHOjWBjVrOayt4aSZvP',
            //     { action: 'submit' }
            // );
    
            // form.set('token', token);
    
            submitEmail(form);
        });
    }

    return(
        <form onSubmit={handleEmail} className='bg-white px-10 py-10 rounded-lg'>
            <p className='text-center italic font-semibold text-red-300 mb-4'>{info}</p>
            <h1 className='font-semibold text-2xl'>Get started</h1>
            <br />
            <div>
                <label>Let's start with your email</label>
                <input
                type="email" 
                name="email"
                placeholder='Enter email'
                disabled={submitEmailResult.success ? true : false}
                className='rounded-sm p-0.5 border border-gray-400 block outline-none mt-1'
                />
                <br />
                <div className='h-6 w-full'>{ loading && <img src="/marching_ants.gif" alt="Loading..." /> }</div>
                <p className='text-lg text-red-200'>{submitEmailResult.message}</p>
            </div>
            <br />
            <div className='flex justify-end'>
                <button
                className='border-none px-4 py-1 rounded-sm text-white bg-orange-300 disabled:opacity-50'
                disabled={loading || submitEmailResult.success ? true : false}
                >
                    Next
                </button>
            </div>
        </form>
    )
}