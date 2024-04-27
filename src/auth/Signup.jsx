import React from 'react';
import { useState } from 'react';
import { auth, firestore } from '../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc } from "firebase/firestore";
import { Link, useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import CheckIcon from '@mui/icons-material/Check';
import Select from 'react-select';
import logo from '../Images/logo.png';
import logoImg from '../Images/log-img.png';

export default function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [role, setRole] = useState('');
    const [username, setUsername] = useState('');

    const [selectedOption, setSelectedOption] = useState(null);
    const options = [
        { value: 'teacher', label: 'teacher' },
        { value: 'student', label: 'student' }
    ];

    const [err, setErr] = useState('');



    const roles = selectedOption?.value;


    const sign = async (e) => {
        e.preventDefault();
        if (email === '' || password === '' || username === '' || roles === '') {
            setErr('Please fill all the fields');
            return;
        }
        try {
            await createUserWithEmailAndPassword(auth, email, password)
            // signInWithEmailAndPassword(auth, email, password)
                .then(async (userCredential) => {
                    // Signed in 
                    const user = userCredential.user;
                    console.log('signed up');
                    // Save additional user info to Firestore
                    await addDoc(collection(firestore, 'users'), {
                        email,
                        username,
                        roles
                    });
                    setEmail('');
                    setUsername('');
                    setPassword('');
                    setRole('');
                    navigate('/login');
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    if(error.message.includes('Firebase: Password should be at least 6 characters (auth/weak-password).')){
                        setErr('Password should be at least 6 characters');
                    }

                    console.log(errorMessage);
                });
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className='bg-purple-500 h-screen flex align-middle'>
            <div className='bg-white w-100 mx-auto my-auto p-3 py-5 rounded-xl'>
                <div className="w-30 flex align-middle justify-center">
                    <img src={logo} alt="Logo" className="w-8 h-8 rounded-full mr-2" />
                    <p className='text-center text-purple-500 text-xl font-bold'>Welcome to Learn-Up</p>
                </div>
                {err &&
                    <div className='w-3/6 mx-auto my-3'>
                        <Alert icon={<CheckIcon fontSize="inherit" />} severity="error">
                            <p className='font-bold' >{err}</p>
                        </Alert>
                    </div>
                }
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr'}}>
                    <div className='mx-auto '>
                    <p className='text-purple-700 text-lg font-medium'>Sign Up</p>
                        <form onSubmit={sign}>
                            <label htmlFor="username" className='block text-sm font-bold text-gray-700 mt-2 mb-1'>Username</label>
                            <input type="text" placeholder="example2003K" value={username} onChange={(e)=>{setUsername(e.target.value)}} className='block border border-gray-300 w-80 rounded p-2 text-sm' />
                            
                            <label htmlFor="email" className='block text-sm font-bold text-gray-700 mt-4 mb-1'>Email</label>
                            <input type="email" placeholder="you@example.com" value={email} onChange={(e)=>{setEmail(e.target.value)}} className='block border border-gray-300 text-sm w-80 p-2 rounded' />
                            
                            <label htmlFor="password" className='block text-sm font-bold text-gray-700 mt-4 mb-1'>Password</label>
                            <input type="password" placeholder="enter 6 character or more" value={password} onChange={(e)=>{setPassword(e.target.value)}} className='block border border-gray-300 w-80 rounded p-2 text-sm' />

                            <label htmlFor="role" className='block text-sm font-bold text-gray-700 mt-4 mb-1'>Role</label>
                            <Select
                                defaultValue={selectedOption}
                                onChange={setSelectedOption}
                                options={options}
                                placeholder='Who are you ?'
                            />

                            <div>
                                <button className='bg-purple-500 hover:bg-purple-700 text-white font-bold w-80 my-4 py-2 px-4 rounded'>Get started</button>
                            </div>

                            <div className='text-center'>
                                <Link to='/login' className='text-purple-500 underline'>Already a user ? Login</Link>
                            </div>
                        </form>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        <img src={logoImg} style={{width: '400px', maxWidth: '1900px'}} />
                    </div>
                </div>
            </div>
        </div>
    )
}
