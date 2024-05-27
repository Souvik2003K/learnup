import Home from '../Home';

import { Player, ControlBar } from 'video-react';
import 'video-react/dist/video-react.css';

import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

// import { auth, firestore } from '../config/firebase';
// import { collection, getDocs, query, where } from "firebase/firestore";

import { Client, Databases, Query, Storage } from 'appwrite';
// import { render } from 'react-dom';

export default function ShowCourses() {

    const { value } = useParams();
    const navigate = useNavigate();

    const client = new Client();

    client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

    const databases = new Databases(client);
    const storage = new Storage(client);

    // const [userData, setUserData] = useState([]);
    // useEffect(() => {
    //     const unsubscribe = auth.onAuthStateChanged(async (user) => {
    //         if (user) {
    //             const QuerySnapshot = await getDocs(query(collection(firestore, "users"), where("email", "==", auth?.currentUser?.email)));
    //             const d = [];
    //             QuerySnapshot.forEach((doc) => {
    //                 d.push(doc.data());
    //             });
    //             setUserData(d);
    //         }
    //     });
    //     return unsubscribe;
    // }, []);

    const [blogs, setBlogs] = useState([]);

    useEffect(() => {

        // course DB
        let promise = databases.listDocuments(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            import.meta.env.VITE_APPWRITE_COURSE_COLLECTION_ID,
            [
                Query.equal('vid_id', value)
            ]
        );

        promise.then(function (response) {
            setBlogs(response.documents);
        }, function () {
            // console.log('err',error);
        });
    }, []);

    const [inputText, setInputText] = useState('');
    const download = () => {
        const element = document.createElement('a');
        const file = new Blob([inputText], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = 'notes.txt';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }
    
    const test = (email, title) => {
        navigate(`/test/${email}&&${title}`);
    }


    //---------------------




    return (
        <div>
            <Home />
            <div style={{ width: '80%', margin: '0 auto', marginTop: '30px', marginBottom: '20px' }}>
                <Player src={storage.getFileView(import.meta.env.VITE_APPWRITE_VID_STORAGE_ID,value)}>
                    <ControlBar autoHide={false} className="my-class" />
                </Player>
            </div>
            <div style={{ width: '80%', margin: '10px auto'}}>
                {blogs.length > 0 ? blogs.map((data, key) => {
                            return (<>
                            <div key={key}>
                                <div className='flex justify-between items-center'>
                                    <p className="text-2xl font-bold my-5">A Course on {data.title}</p>
                                    <button className="flex justify-center items-center gap-2 bg-purple-500 hover:bg-purple-700 text-white px-4 py-2 mt-4 rounded-lg transition duration-300 text-lg" onClick={()=>{test(data.uploader_email, data.title)}}>Take Test</button>
                                </div>
                                <div className='border border-gray-300 rounded-lg shadow-xl p-6 my-4'>
                                    <div>
                                        <div className='flex justify-evenly items-center'>
                                            {/* <p></p> */}
                                            <p className="text-2xl font-bold my-3">Author - </p>
                                            <p className="text-xl font-semibold text-gray-700 my-2 ">{data.author[0].toUpperCase()+ data.author.slice(1)}</p>
                                            {/* <p></p> */}
                                        </div>

                                        <div className='flex justify-evenly items-center'>
                                            <p className="text-2xl font-bold my-3">Price - </p>
                                            <p className="text-xl font-semibold text-gray-700 my-2">Rs. {data.price}</p>
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold my-3">Description - </p>
                                    <div style={{maxWidth: '1000px', margin: '0 auto'}}>
                                        <p className="text-gray-700 my-2 text-center">{data.description}....</p>
                                    </div>
                                </div>
                                <div className='border border-gray-300 rounded-lg shadow-xl p-6 my-4'>
                                    <p className="text-2xl font-bold my-3">Write your notes here - </p>
                                    <div style={{maxWidth: '1000px', margin: '10px auto'}}>
                                        <textarea value={inputText} onChange={(event)=>{setInputText(event.target.value)}} className="w-full h-32 border border-gray-300 rounded-lg p-2" placeholder="notes..."></textarea>
                                        <button className="flex justify-center items-center gap-2 bg-purple-500 hover:bg-purple-700 text-white px-4 py-2 mt-4 rounded-lg transition duration-300 text-lg" onClick={download}>Save your notes offline</button>
                                    </div>
                                </div>
                            </div>
                            </>
                            
                            )
                        })
                        : <div>Loading....</div>}
            </div>
            

        </div>
    )
}
