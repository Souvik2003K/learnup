import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

import Home from '../Home';
import { Client, Databases, Query, ID, Storage } from 'appwrite';

import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, firestore } from '../config/firebase';

import ReactLoading from "react-loading";

import { FaLock } from "react-icons/fa";
import { PiCurrencyInr } from "react-icons/pi";

export default function Student() {
    const client = new Client();

    client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

    const databases = new Databases(client);
    const storage = new Storage(client);


    const [blogs, setBlogs] = useState([]);
    const [pays, setPays] = useState([]);

    const [userData, setUserData] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    const [modal, setModal] = useState(false);

    const navigate = useNavigate();


    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user);
        });
        // console.log(unsubscribe);
        return unsubscribe;
    }, []);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                const QuerySnapshot = await getDocs(query(collection(firestore, "users"), where("email", "==", currentUser?.email)));
                const d = [];
                QuerySnapshot.forEach((doc) => {
                    d.push(doc.data());
                });
                setUserData(d);
            }
        });
        return unsubscribe;
    }, []);

    // course DB
    let promise = databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_COURSE_COLLECTION_ID,
        []
    );

    promise.then(function (response) {
        setBlogs(response.documents);
    }, function (error) {
        // console.log('err',error);
    });

    //---------------------------

    // purchase DB
    let promise2 = databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_PURCHASE_COLLECTION_ID,
        [
            Query.equal('bought_by', auth?.currentUser?.email)
        ]
    );

    promise2.then(function (response) {
        // console.log('docs',response.documents);
        setPays(response.documents);
    }, function (error) {
        console.log('err in promise',error);
    });


    const initPayement = async (data, course) => {
        const options = {
            key: 'rzp_test_Jxunc6kJaKo1s3',
            amount: data.amount,
            currency: data.currency,
            name: 'Learn up',
            description: 'Test transaction',
            image: 'https://example.com/your_logo',
            order_id: data.id, 
            handler: async function (response) {
                try{
                    console.log(auth?.currentUser?.email);
                    const paymentURL = import.meta.env.VITE_RAZOR_PAY_VERIFY_API;
                    const data = await axios.post(paymentURL, response);
                    console.log(data);
                    const purchase = {
                        'title': course.title, 
                        'price': course.price, 
                        'bought_by': auth?.currentUser?.email
                    };
                    // purchase DB
                    const promise = databases.createDocument(
                    import.meta.env.VITE_APPWRITE_DATABASE_ID,
                    import.meta.env.VITE_APPWRITE_PURCHASE_COLLECTION_ID,
                    ID.unique(),
                    purchase
                    );
                
                    promise.then(function (response) {
                        // console.log(response);
                        // alert("Data submitted successfully!");
                    }, function (error) {
                        console.log('err in creation of blog',error);
                    });
                } catch (error) {
                console.log(error);
                const purchase = {
                    'title': course.title, 
                    'price': course.price, 
                    'bought_by': auth?.currentUser?.email
                };
                // purchase DB
                const promise = databases.createDocument(
                import.meta.env.VITE_APPWRITE_DATABASE_ID,
                import.meta.env.VITE_APPWRITE_PURCHASE_COLLECTION_ID,
                ID.unique(),
                purchase
                );
            
                promise.then(function (response) {
                    // console.log(response);
                    // alert("Data submitted successfully!");
                }, function (error) {
                    console.log('err in creation of blog',error);
                });
                }
            },
            theme: {
                color: '#3399cc',
            },
        };
        const rzp1 = new window.Razorpay(options);
        rzp1.open();
        
    }
    
    const handlepayement = async (bookData) => {
        // console.log(bookData.price);
        const orderURL = import.meta.env.VITE_RAZOR_PAY_ORDER_API;
        const { data } = await axios.post(orderURL, { amount: bookData.price })
        console.log(data);
        initPayement(data?.data, bookData);
    }

    const goto = (d) => {
        // console.log(d.vid_id);
        navigate(`/show-courses/${d.vid_id}`);
    }



    return (
        <div>
            <Home />
            <div className='container mx-auto my-5 px-5'>
                <div className="grid-layout-3">
                    {blogs.length > 0 ? blogs.filter((blog) => {
                        if (blog.is_published === true) {
                            return blog;
                        }
                    }).map((data, key) => {
                        const isPaid = pays?.find((pay) => pay.bought_by === auth?.currentUser?.email && pay.title === data.title);
                        return (
                            <>
                                <div key={key} className="border border-gray-300 rounded-lg shadow-xl mx-5 my-3 p-5">
                                    <div className='flex justify-center'>
                                        <img src={storage.getFilePreview(import.meta.env.VITE_APPWRITE_IMG_STORAGE_ID,data.img_id)} alt={data.title} style={{width: '430px', height: '300', borderRadius: '10px', padding: '10px'}} />
                                    </div>
                                    <p className="text-2xl font-bold my-3">{data.title}</p>
                                    <p className="text-xl font-semibold my-3">Author - {data.uploader_email[0].toUpperCase()+ data.uploader_email.slice(1)}</p>
                                    <p className="text-gray-700 my-2 text-center">{data.description.slice(0, 100)}....</p>
                                    {isPaid ? 
                                        (
                                            <button className="flex justify-center items-center gap-2 bg-purple-500 hover:bg-purple-700 text-white px-4 py-2 mt-4 rounded-lg transition duration-300 w-full text-lg" onClick={()=>{goto(data)}}>continue</button>
                                        ) : (
                                            <button className="flex justify-center items-center gap-2 bg-purple-500 hover:bg-purple-700 text-white px-4 py-2 mt-4 rounded-lg transition duration-300 w-full text-lg" onClick={()=>{handlepayement(data)}}><FaLock /><p>Buy for</p><p className='flex justify-center items-center'><PiCurrencyInr /><p>{data.price}</p></p></button>
                                        )
                                    }
                                </div>
                            </>
                        )
                    })
                    : 
                    <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 5}}>
                        <ReactLoading type="bubbles" color="#a855f7 " height={200} width={100} />
                    </div>
                    }
                </div>
            </div>
            {modal &&
                <div className="fixed z-10 inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-8 rounded shadow-lg">
                        <h2 className="text-xl mb-4">Coming Soon...</h2>
                        <div className="flex justify-center">
                            <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded" onClick={()=>{setModal(!modal)}}>Close</button>
                        </div>
                    </div>
                </div>
            }
            <div>
                <div onClick={()=>{setModal(!modal)}} className='bg-purple-500 text-white font-bold shadow-xl hover:cursor-pointer texts' style={{borderRadius: '50%', position: 'fixed', left: '1%', bottom: '1%'}}>Live Session</div>
            </div>
        </div>
    )
}
