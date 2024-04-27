import React from 'react';
import { useState, useEffect } from 'react';
import { auth, firestore } from '../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection } from "firebase/firestore";
import { getDocs, query, where } from "firebase/firestore";
import { Link, useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import CheckIcon from '@mui/icons-material/Check';
import logo from '../Images/logo.png';
import logoImg from '../Images/log-img.png';


export default function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [err, setErr] = useState('');

    const sign = async (e) => {
        e.preventDefault();
        if (email === '' || password === '') {
            setErr('Please fill all the fields');
            return;
        }
        try {
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    // Signed in 
                    const user = userCredential.user;
                    console.log('signed in');
                    console.log(querySnapshot.docs[0].data().roles);
                    navigate(`/${querySnapshot.docs[0].data().roles}`);
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    // console.log(errorMessage);
                    if (error.message.includes('Firebase: Error (auth/invalid-credential)')) {
                        setErr('Invalid Credentials');
                    }
                    else{
                        console.log(errorMessage);
                    }
                });
                const q = query(collection(firestore, 'users'), where('email', '==', email));
                const querySnapshot = await getDocs(q);
                console.log(querySnapshot.docs[0].data().roles);
                navigate(`/${querySnapshot.docs[0].data().roles}`);
                setEmail('');
                setPassword('');
                
            
        } catch (error) {
            console.error('err in login',error);
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
                    <div className='w-60 mx-auto my-3'>
                        <Alert icon={<CheckIcon fontSize="inherit" />} severity="error">
                            <p className='font-bold' >{err}</p>
                        </Alert>
                    </div>
                }
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr'}}>
                    <div className='mx-auto '>
                    <p className='text-purple-700 text-lg font-medium'>Sign In</p>
                    <p className='font-normal'>to continue to Learn-Up</p>
                        <form onSubmit={sign}>
                            <label htmlFor="email" className='block text-sm font-bold text-gray-700 mt-4 mb-1'>Email</label>
                            <input type="email" placeholder="you@example.com" value={email} onChange={(e)=>{setEmail(e.target.value)}} className='block border border-gray-300 text-sm w-80 p-2 rounded' />
                            
                            <label htmlFor="password" className='block text-sm font-bold text-gray-700 mt-4 mb-1'>Password</label>
                            <input type="password" placeholder="enter 6 character or more" value={password} onChange={(e)=>{setPassword(e.target.value)}} className='block border border-gray-300 w-80 rounded p-2 text-sm' />

                            <div>
                                <button className='bg-purple-500 hover:bg-purple-700 text-white font-bold w-80 my-4 py-2 px-4 rounded'>Continue</button>
                            </div>

                            <div className='text-center'>
                                <Link to='/signup' className='text-purple-500 underline'>No Account ? Sign up</Link>
                            </div>
                        </form>
                    </div>
                    <div>
                        <img src={logoImg} style={{width: '400px', maxWidth: '1900px'}} />
                    </div>
                </div>
            </div>
        </div>
    )
}
