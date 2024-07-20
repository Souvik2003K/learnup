import { useState } from 'react';
import { auth, firestore } from '../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getDocs, query, where, collection } from "firebase/firestore";
import { Link, useNavigate } from 'react-router-dom';
import logo from '../Images/logo.png';
import logoImg from '../Images/log-img.png';
import ReactLoading from 'react-loading';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [loading, setLoading] = useState(false);

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


    const sign = async (e) => {
        e.preventDefault();
        if (email === '' || password === '') {
            notify('Please fill all the fields');
            return;
        }
        try {
            setLoading(true);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            // localStorage.setItem('user', JSON.stringify(user));
            // localStorage.setItem('roles', JSON.stringify(user));
            
            console.log('signed in');

            // Fetch user role from Firestore
            console.log('email->', email);
            const q = query(collection(firestore, 'users'), where('email', '==', email));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                throw new Error('No user found with this email');
            }
            const userData = querySnapshot.docs[0].data();
            console.log('role', userData?.roles);
            setLoading(false);

            // Navigate to user's role-based route
            navigate(`/${userData?.roles}`);
            setEmail('');
            setPassword('');
        } catch (error) {
            setLoading(false);
            if(error.message.includes('Firebase: Error (auth/invalid-credential)')){
                notify('Invalid Credentials');
            }
        }
    }


    return (
        <>
        <ToastContainer />
        <div className='bg-purple-500 h-screen flex align-middle'>
            <div className='bg-white w-80 md:w-6/6 lg:w-4/6 xl:w-4/6 2xl:w-3/6 mx-auto my-auto px-3 py-5 rounded-xl'>
                <div className="w-30 flex align-middle justify-center">
                    <img src={logo} alt="Logo" className="w-8 h-8 rounded-full mr-2" />
                    <p className='text-center text-purple-500 text-xl font-bold'>Welcome to Learn-Up</p>
                </div>
                <div className='grid-layout'>
                    <div className='py-3 px-4 mx-0 lg:mx-auto'>
                    <p className='text-purple-700 text-lg font-medium my-1'>Sign In</p>
                    <p className='font-normal'>to continue to Learn-Up</p>
                    <form onSubmit={sign}>
                        <label htmlFor="email" className='block text-sm font-bold text-gray-700 mt-4 mb-1'>Email</label>
                        <input type="email" placeholder="you@example.com" value={email} onChange={(e)=>{setEmail(e.target.value)}} className='block border border-gray-300 text-md p-2 rounded w-full lg:w-80' />
                        
                        <label htmlFor="password" className='block text-sm font-bold text-gray-700 mt-4 mb-1'>Password</label>
                        <input type="password" placeholder="enter 6 character or more" value={password} onChange={(e)=>{setPassword(e.target.value)}} className='block border border-gray-300 rounded p-2 text-md w-full lg:w-80' />

                        <div>
                            <button className='bg-purple-500 hover:bg-purple-700 text-white font-bold w-full my-4 py-2 px-4 rounded'>
                                {loading ? <div className='flex justify-center items-center'><ReactLoading type="bubbles" color="#fff " height={30} width={30} /></div> : 'Continue'}
                            </button>
                        </div>

                        <div className='text-center'>
                            <Link to='/signup' className='text-purple-500 underline'>No Account ? Sign up</Link>
                        </div>
                    </form>
                    </div>
                    <div className='to-hide'>
                        <img src={logoImg} style={{width: '400px', maxWidth: '1900px'}} />
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}
