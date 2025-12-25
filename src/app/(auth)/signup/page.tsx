'use client';
import { useActionState, useState } from 'react';
import { getStarted } from '@/actions/signup';

export default function GetStarted() {
    const [email, setEmail] = useState('');
    const [state, submit, loading] = useActionState(getStarted, { success: false, error: '' });

    return(
        <form action={submit} className='bg-white px-10 py-10 rounded-lg'>
            <h1 className='font-semibold text-2xl'>Get started</h1>
            <br />
            <div className="">
                <label>Let's start with your email</label>
                <input
                type="email" 
                name="email"
                placeholder='Enter email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={state.success ? true : false}
                className='rounded-sm p-0.5 border border-gray-400 block outline-none mt-1'
                />
                <div className='mt-3'>
                    { loading ? <img src="/marching_ants.gif" alt="Loading..." /> : '' }
                </div>
                { !state.success ?
                    <p className='text-lg text-red-200'>{state.error}</p> :
                    <p className='text-lg'>
                        <span>{state.data}</span> 
                        <br /> 
                        <span className='text-sm'>Check inbox or spam folder to continue with registration.</span>
                    </p>
                }
            </div>
            <br />
            <div className='flex justify-end'>
                <button
                className='border-none px-4 py-1 rounded-sm text-white bg-orange-300 disabled:opacity-50'
                disabled={loading || state.success ? true : false}
                >
                    Next
                </button>
            </div>
        </form>
    )
}