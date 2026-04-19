'use client';
import { useActionState } from "react";
import { signup } from "@/actions/signup";

export default function ContinueRegistration({ email, phone }: {
    email: string,
    phone: string
}) {
    const initialActionState = {
        success: false,
        data: {
            accessToken: '',
            email: '',
            phone: '',
            name: '',
            photo: '',
            role: ''
        }
    }
    const [state, submit, loading] = useActionState(signup, initialActionState);

    return(
        <form action={submit} className="bg-white px-10 py-4 rounded-lg mt-2.5">
            <h1 className="text-center text-2xl">Continue Registration</h1>
            <br />
            <div className="mb-3">
                <label>Email:</label>
                <input
                type="email"
                name="email"
                defaultValue={email}
                readOnly
                className='rounded-sm p-0.5 border border-gray-400 block outline-none'
                />
            </div>
            <div className="mb-3">
                <label>Phone:</label>
                <input
                type="text"
                name="phone"
                defaultValue={phone}
                readOnly
                className='rounded-sm p-0.5 border border-gray-400 block outline-none'
                />
            </div>
            <div className="mb-3">
                <label>Enter full name</label>
                <input
                type="text" 
                name="full-name"
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
                className='rounded-sm border border-gray-400 block outline-none'
                />
                { state.errors?.confirmPassword && 
                    <p className='text-lg text-red-200'>{state?.errors.confirmPassword}</p> 
                }
                { state.errors?.message && 
                    <p className='text-lg text-red-200'>{state?.errors.message}</p> 
                }
            </div>
            <br />
            <div className='h-6 w-full'>{ loading && <img src="/marching_ants.gif" alt="Loading..." /> }</div>
            <div className="flex justify-between items-center">
                <button className='border-none px-7 py-1 rounded-sm text-white bg-orange-300 cursor-pointer'>Next</button>
            </div>
        </form>
    )
}