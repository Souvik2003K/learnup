import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth, firestore } from './config/firebase';
import { collection, getDocs, query, where } from "firebase/firestore";
import { signOut } from 'firebase/auth';
import logo from './Images/logo.png';

export default function Home() {
    const navigate = useNavigate();
    const location = useLocation();

    const [userData, setUserData] = useState([]);
    // const [currentUser, setCurrentUser] = useState(null);


    // useEffect(() => {
    //     const unsubscribe = auth.onAuthStateChanged(user => {
    //         setCurrentUser(user);
    //     });
    //     // console.log(unsubscribe);
    //     return unsubscribe;
    // }, []);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                const QuerySnapshot = await getDocs(query(collection(firestore, "users"), where("email", "==", auth?.currentUser?.email)));
                const d = [];
                QuerySnapshot.forEach((doc) => {
                    d.push(doc.data());
                });
                setUserData(d);
            }
        });
        return unsubscribe;
    }, []);
    
    // console.log('curr',currentUser?.email);
    // console.log('userdata',userData[0]?.roles);   

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleProfile = () => {
        setIsProfileOpen(!isProfileOpen);
    };

    const toggleModal = () => {
        setIsProfileOpen(false);
        setIsModalOpen(!isModalOpen);
    };


// console.log(user);

    const clear = async () => {
        try {
            await signOut(auth);
            // localStorage.removeItem('user');
            navigate('/login');
        } catch (error) {
            console.error('err in logout',error);
        }
    }
    return (
        <>
            <div>
                <nav className="flex justify-between items-center bg-white shadow-md p-4">
                    <div className="w-30 flex align-middle justify-center">
                        <img src={logo} alt="Logo" className="w-8 h-8 rounded-full mr-2" />
                        <p className='text-2xl text-purple-500 font-extrabold'>Learn-Up</p>
                    </div>
                    
                    <div className="flex items-center">
                        
                        <div className="flex justify-center items-center cursor-pointer" onClick={toggleProfile}>
                            <div className="flex items-center">
                                <img src="https://freesvg.org/img/abstract-user-flat-4.png" alt="Profile Picture" className="w-10 h-10 rounded-full mr-2" />
                            </div>
                        </div>
                    </div>
                </nav>
                
                {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
                        <div className="p-4">
                        <p className="text-gray-800 font-semibold">Hello, {userData[0]?.username[0].toUpperCase() + userData[0]?.username.slice(1)}</p>
                        <div className="border-t my-2"></div>
                        { location.pathname !== '/teacher' && location.pathname !== '/student' ?
                            <>
                                <Link to={`/${userData[0]?.roles === 'teacher' ? 'teacher' : userData[0]?.roles === 'student' ? 'student' : ''}`} className='text-gray-800 font-semibold'>{userData[0]?.roles === 'teacher' ? 'Teacher' : userData[0]?.roles === 'student' ? 'Student' : ''} Dashboard</Link>
                                <div className="border-t my-2"></div>
                            </>
                            : ''
                        }
                        
                        <button className="text-red-500 hover:text-red-700" onClick={toggleModal}>Logout</button>
                        </div>
                    </div>
                )}

                {isModalOpen && (
                <div className="fixed z-10 inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-8 rounded shadow-lg">
                        <h2 className="text-xl mb-4">Logout</h2>
                        <p className="mb-4">Are you sure you want to logout?</p>
                        <div className="flex justify-end">
                        <button className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 mr-2" onClick={clear}>Logout</button>
                        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300" onClick={toggleModal}>Cancel</button>
                        </div>
                    </div>
                </div>
                )}
            </div>
        </>
    )
}
