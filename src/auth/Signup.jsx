import React from 'react';
import { useState } from 'react';
import { auth, firestore } from '../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc } from "firebase/firestore";
import { Link, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import logo from '../Images/logo.png';
import logoImg from '../Images/log-img.png';

import ReactLoading from 'react-loading';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    // const [role, setRole] = useState('');
    const [username, setUsername] = useState('');

    const [loading, setLoading] = useState(false);

    const [selectedOption, setSelectedOption] = useState(null);
    const options = [
        { value: 'teacher', label: 'teacher' },
        { value: 'student', label: 'student' }
    ];

    // const [err, setErr] = useState('');

    const notify = (msg) => toast.error(msg, {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        theme: "light"
    });


    const roles = selectedOption?.value;


    const sign = async (e) => {
        e.preventDefault();
        if (email === '' || password === '' || username === '' || roles === '') {
            notify('Please fill all the fields');
            return;
        }
        try {
            setLoading(true);
            // Create user with email and password
            // const userCredential = 
            await createUserWithEmailAndPassword(auth, email, password);
            // const user = userCredential.user;
            console.log('signed up');

            // Save additional user info to Firestore
            await addDoc(collection(firestore, 'users'), {
                email,
                username,
                roles
            });

            // Clear the input fields and navigate to login page
            setLoading(false);
            setEmail('');
            setUsername('');
            setPassword('');
            // setRole('');
            navigate('/login');
        } catch (error) {
            setLoading(false);
            console.error(error);

            if (error.message.includes('Firebase: Password should be at least 6 characters (auth/weak-password).')) {
                notify('Password should be at least 6 characters');
            } else if (error.message.includes('Firebase: Error (auth/email-already-in-use)')) {
                notify('Email already in use');
            } else if (error.message.includes('Firebase: Error (auth/invalid-email)')) {
                notify('Invalid email');
            } else if (error.code === 'permission-denied') {
                notify('Insufficient permissions to create user data.');
            } else {
                notify('An error occurred. Please try again later.');
            }
        }
    }

    return (
        <>
        <ToastContainer />
        
        <div className='bg-purple-500 h-screen flex align-middle'>
            <div className='bg-white w-80 md:w-6/6 lg:w-4/6 xl:w-4/6 2xl:w-3/6 mx-auto my-auto py-5 px-3 rounded-xl'>
                <div className="w-30 my-2 flex align-middle justify-center">
                    <img src={logo} alt="Logo" className="w-8 h-8 rounded-full mr-2" />
                    <p className='text-center text-purple-500 text-xl font-bold'>Welcome to Learn-Up</p>
                </div>
                <div className='grid-layout'>
                    <div className='py-3 px-4 mx-0 lg:mx-auto'>
                    <p className='text-purple-700 text-lg font-medium'>Sign Up</p>
                        <form onSubmit={sign}>
                            <label htmlFor="username" className='block text-sm font-bold text-gray-700 mt-2 mb-1'>Username</label>
                            <input type="text" placeholder="example2003K" value={username} onChange={(e)=>{setUsername(e.target.value)}} className='block border border-gray-300 rounded p-2 text-md w-full lg:w-80' />
                            
                            <label htmlFor="email" className='block text-sm font-bold text-gray-700 mt-4 mb-1'>Email</label>
                            <input type="email" placeholder="you@example.com" value={email} onChange={(e)=>{setEmail(e.target.value)}} className='block border border-gray-300 rounded p-2 text-md w-full lg:w-80' />
                            
                            <label htmlFor="password" className='block text-sm font-bold text-gray-700 mt-4 mb-1'>Password</label>
                            <input type="password" placeholder="enter 6 character or more" value={password} onChange={(e)=>{setPassword(e.target.value)}} className='block border border-gray-300 rounded p-2 text-md w-full lg:w-80' />

                            <label htmlFor="role" className='block text-md font-bold text-gray-700 mt-4 mb-1'>Role</label>
                            <Select
                                className='w-full lg:w-80'
                                defaultValue={selectedOption}
                                onChange={setSelectedOption}
                                options={options}
                                placeholder='Who are you ?'
                            />

                            <div>
                                <button className='bg-purple-500 hover:bg-purple-700 text-white font-bold w-full my-4 py-2 px-4 rounded'>
                                    {loading ? <div className='flex justify-center items-center'><ReactLoading type="bubbles" color="#fff " height={30} width={30} /></div> : 'Get started'}
                                    </button>
                            </div>

                            <div className='text-center'>
                                <Link to='/login' className='text-purple-500 underline'>Already a user ? Login</Link>
                            </div>
                        </form>
                    </div>
                    <div className='hidden lg:flex justify-center items-center'>
                        <img src={logoImg} style={{width: '400px', maxWidth: '1900px'}} />
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}
