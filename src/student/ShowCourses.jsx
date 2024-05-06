import React from 'react';
import Home from '../Home';

import { Player, ControlBar } from 'video-react';
import 'video-react/dist/video-react.css';

import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

import { auth, firestore } from '../config/firebase';
import { collection, getDocs, query, where } from "firebase/firestore";

import { Client, Databases, Query, ID, Storage } from 'appwrite';
// import { render } from 'react-dom';

export default function ShowCourses() {

    const { value } = useParams();
    // console.log(value);

    const client = new Client();

    client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

    const databases = new Databases(client);
    const storage = new Storage(client);

    const [userData, setUserData] = useState([]);
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

    const [blogs, setBlogs] = useState([]);
    const [videos, setVideos] = useState(null);

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
        }, function (error) {
            // console.log('err',error);
        });
    }, []);


    
    // const [isPlaying, setIsPlaying] = useState(false);

    // const handlePlayPause = () => {
    //     // setIsPlaying(!isPlaying);
    // };


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
                            <div key={key} className="">
                                <p className="text-2xl font-bold my-5">A Course on {data.title}</p>
                                <div className='border border-gray-300 rounded-lg shadow-xl p-6 my-4'>
                                    <p className="text-2xl font-bold my-3">Description - </p>
                                    <div style={{maxWidth: '1000px', margin: '0 auto'}}>
                                        <p className="text-gray-700 my-2 text-center">{data.description}....</p>
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
