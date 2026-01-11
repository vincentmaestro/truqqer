'use client';
import { useActionState, useReducer } from "react";
import { signup } from "@/actions/signup";
import { EmailVerificationPayload } from "@/types/signup";

type FormField = 
    | { type: 'name', value: string }
    | { type: 'user-type', value: string }
    | { type: 'gender', value: string }
    | { type: 'password', value: string }
    | { type: 'confirm-password', value: string }

const defaultState = {
    name: '',
    userType: '',
    gender: '',
    password: '',
    confirmPassword: ''
}

export const initialState = {
    success: false,
    data: {
        name: '',
        userType: '',
        gender: '',
        password: '',
        confirmPassword: ''
    }
}

function reducer(state: typeof defaultState, action: FormField) {
    switch(action.type) {
        case 'name': return { ...state, name: action.value };
        case 'user-type': return { ...state, userType: action.value };
        case 'gender': return { ...state, gender: action.value };
        case 'password': return { ...state, password: action.value };
        case 'confirm-password': return { ...state, confirmPassword: action.value };

        default: return state;
    }
}

export default function ContinueRegistration({ result }: {
    result: {
        success: boolean;
        data?: EmailVerificationPayload;
        error?: string;
    }
}) {
    const [userData, dispatch] = useReducer(reducer, defaultState);
    const [state, submit, loading] = useActionState(signup, initialState);

    return(
        <div className="bg-white px-10 py-4 rounded-lg mt-2.5">
            {!result.success &&
                <>
                    <div className="border border-gray-300 shadow-2xl shadow-gray-300 rounded-lg text-slate-500 py-10 px-3">
                        You may have entered an incorrect, broken or expired link.
                    </div>
                    <br />
                    <div className="border border-gray-300 shadow-2xl shadow-gray-300 rounded-lg text-slate-500 py-10 px-3">
                        {result.error === 'jwt expired' ?
                            'session expired, kindly restart registration process.' :
                            result.error
                        }
                    </div>
                </>
            }

            {result.success &&
                <form action={submit} className="">
                    <h1 className="text-center text-2xl">Continue Registration</h1>
                    <br />
                    <div className="mb-3">
                        <label>Email:</label>
                        <input
                        type="email" 
                        name="email"
                        value={result.data?.email}
                        disabled
                        className='rounded-sm p-0.5 border border-gray-400 block outline-none'
                        />
                    </div>
                    <div className="mb-3">
                        <label>Enter full name</label>
                        <input
                        type="text" 
                        name="full-name"
                        value={userData.name}
                        onChange={e => dispatch({ type: 'name', value: e.target.value })}
                        className='rounded-sm p-0.5 border border-gray-400 block outline-none'
                        />
                        { state.errors?.name && 
                            <p className='text-lg text-red-200'>{state?.errors.name}</p> 
                        }
                    </div>
                    <div className="mb-3">
                        <label>Registering as:</label>
                        <select
                        name="user-type"
                        value={userData.userType}
                        onChange={e => dispatch({ type: 'user-type', value: e.target.value })}
                        className='rounded-sm py-0.5 px-5 border border-gray-400 block outline-none'
                        >
                            <option>Select</option>
                            <option value="user">User</option>
                            <option value="driver">Driver</option>
                        </select>
                        { state.errors?.userType && 
                            <p className='text-lg text-red-200'>{state?.errors.userType}</p> 
                        }
                    </div>
                    <div className="mb-3">
                        <label>Gender:</label>
                        <select
                        name="gender"
                        value={userData.gender}
                        onChange={e => dispatch({ type: 'gender', value: e.target.value })}
                        className='rounded-sm py-0.5 px-5 border border-gray-400 block outline-none'
                        >
                            <option>Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                        { state.errors?.gender && 
                            <p className='text-lg text-red-200'>{state?.errors.gender}</p> 
                        }
                    </div>
                    <div className="mb-3">
                        <label>Enter Password</label>
                        <input
                        type="password" 
                        name="password"
                        value={userData.password}
                        onChange={e => dispatch({ type: 'password', value: e.target.value })}
                        className='rounded-sm border border-gray-400 block outline-none'
                        />
                        { state.errors?.password && 
                            <p className='text-lg text-red-200'>{state?.errors.password}</p> 
                        }
                    </div>
                    <div className="mb-3">
                        <label>Confirm Password</label>
                        <input
                        type="password" 
                        name="confirm-password"
                        value={userData.confirmPassword}
                        onChange={e => dispatch({ type: 'confirm-password', value: e.target.value })}
                        className='rounded-sm border border-gray-400 block outline-none'
                        />
                        { state.errors?.confirmPassword && 
                            <p className='text-lg text-red-200'>{state?.errors.confirmPassword}</p> 
                        }
                        { state.errors?.message && 
                            <p className='text-lg text-red-200'>{state?.errors.message}</p> 
                        }
                    </div>
                    <div className="flex justify-between items-center">
                        <div className='mt-1'>
                            { loading ? <img src="/marching_ants.gif" alt="Loading..." /> : '' }
                        </div>
                        <button className='border-none px-7 py-1 rounded-sm text-white bg-orange-300'>Next</button>
                    </div>
                </form>
            }
        </div>
    )
}