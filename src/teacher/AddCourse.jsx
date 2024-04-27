import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Client, Databases, ID, Storage } from 'appwrite';

import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, firestore } from '../config/firebase';

import Home from '../Home';

import Alert from '@mui/material/Alert';
import CheckIcon from '@mui/icons-material/Check';

import { MdPublish } from "react-icons/md";
import { CiCamera } from "react-icons/ci";
import { FaVideo } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { PiCurrencyInr } from "react-icons/pi";

function AddCourse() {

    const client = new Client();

    client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

    const databases = new Databases(client);
    const storage = new Storage(client);

    
    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);
    
    const [userData, setUserData] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    const [err, setErr] = useState('');

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user);
        });
        // console.log(unsubscribe);
        return unsubscribe;
    }, []);

    // console.log('curr',currentUser?.email);

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

    // console.log(currentDate.toString());
    const navigate = useNavigate();

    const [allImg, setAllImg] = useState('');

    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [price, setPrice] = useState(0);
    const [image, setImage] = useState(null);
    const [video, setVideo] = useState(null);

    const [viewImage, setViewImage] = useState(null);
    const [viewVideo, setViewVideo] = useState(null);

    const [editTitle, setEditTitle] = useState(false);
    const [editDesc, setEditDesc] = useState(false);
    const [editPrice, setEditPrice] = useState(false);

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
        const file = e.target.files[0];
        if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            setViewImage(reader.result);
        };
        reader.readAsDataURL(file);
        }
    };
    
    const handleVideoChange = (e) => {
        setVideo(e.target.files[0]);
        const file = e.target.files[0];
        if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            setViewVideo(reader.result);
        };
        reader.readAsDataURL(file);
        }
    };



    const submit = async (e) =>{
        e.preventDefault();
        if(title === '' && desc === '' && price === 0){
            setErr('Please dont keep Title, Description or Price blank');
        }
        if(title !== '' && desc !== '' && price !== 0 && video !== null && image === null){
            setErr('Please add a thumbnail image for the course');
        }
        if(title !== '' && desc !== '' && price !== 0 && image !== null && video === null){
            setErr('Please add a video for the course');
        }
        else{
            const imgResponse = await new Promise((resolve, reject) => {
                storage.createFile(import.meta.env.VITE_APPWRITE_IMG_STORAGE_ID, ID.unique(), image)
                    .then(resolve)
                    .catch(reject);
            });
            // console.log(imgResponse.$id); // Success
            
            const vidResponse = await new Promise((resolve, reject) => {
                storage.createFile(import.meta.env.VITE_APPWRITE_VID_STORAGE_ID, ID.unique(), video)
                    .then(resolve)
                    .catch(reject);
            });
            console.log(price, typeof price); // Success

            const newData = {
                title: title,
                description: desc,
                price: Number(price),
                img_id: imgResponse?.$id,
                vid_id: vidResponse?.$id,
                is_published: e.target.textContent === 'Publish' ? true : false,
                uploader_email: userData.length > 0 ? (userData[0].email) : auth?.currentUser?.email
            };
        
                // course DB
                const promise = databases.createDocument(
                import.meta.env.VITE_APPWRITE_DATABASE_ID,
                import.meta.env.VITE_APPWRITE_COURSE_COLLECTION_ID,
                ID.unique(),
                newData
                );
            
                promise.then(function (response) {
                    // console.log(response);
                    setTitle("");
                    setDesc("");
                    setPrice("");
                    setImage(null);
                    setVideo(null);
                    setViewImage(false);
                    setViewVideo(false);
                    if (imageInputRef.current) {
                        imageInputRef.current.value = '';
                    }
                    if (videoInputRef.current) {
                        videoInputRef.current.value = '';
                    }
                    console.log("Data submitted successfully!");
                    navigate('/teacher');
                }, function (error) {
                    console.log('err in creation of blog',error);
                });
        }
    }

    return (
        <form onSubmit={submit}>
            <Home />
            <div className='flex justify-around items-center mx-5 mt-5'>
                <div>
                    <p className='text-3xl font-bold'>Course Setup</p>
                </div>
                
                <div className='flex'>
                    <button onClick={submit} style={{display: 'flex', alignItems: 'center'}} className='border border-purple-500 hover:bg-purple-100 font-bold my-4 py-2 mx-2 px-4 rounded'><MdPublish className='text-xl' /><p>Save as Draft</p></button>
                    <button onClick={submit} style={{display: 'flex', alignItems: 'center'}} className='bg-purple-500 hover:bg-purple-700 text-white font-bold my-4 py-2 mx-2 px-4 rounded'><MdPublish className='text-xl' /><p>Publish</p></button>
                </div>
            </div>

            {err &&
                <div className='w-2/6 mx-auto my-3'>
                    <Alert icon={<CheckIcon fontSize="inherit" />} severity="error">
                        <p className='font-bold' >{err}</p>
                    </Alert>
                </div>
            }
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', maxWidth: '1200px', margin: '0 auto'}}>
                <div className='w-full mx-auto'>
                    <div className='bg-purple-100 p-5 rounded w-5/6 my-5 mx-auto shadow-xl'>
                        <div className='flex justify-between items-center'>
                            <p className='block text-lg font-bold text-gray-700 mb-3'>Course Title</p>
                            {editTitle ?
                                <input type="button" onClick={()=>{setEditTitle(false)}} className='text-md font-semibold bg-purple-500 hover:bg-purple-700 text-white mb-3 flex items-center gap-1 py-2 px-4 rounded' value="save" />
                                :
                                <div className='font-bold mb-4 px-4 rounded flex items-center'>
                                    <MdEdit />
                                    <input type="button" onClick={()=>{setEditTitle(true)}} value="edit" />
                                </div>
                            }
                        </div>
                        {editTitle ?
                            <input type="text" name='title' className='block border border-gray-300 w-5/6 mx-auto rounded-md p-3 text-md' value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter Course title here..." />
                            :
                            <p className='block text-lg font-bold text-gray-500 mb-3 text-center'>{title}</p>
                        }
                    </div>
                    
                    <div className='bg-purple-100 p-5 rounded w-5/6 my-5 mx-auto shadow-xl'>
                        <div className='flex justify-between items-center'>
                            <p className='block text-lg font-bold text-gray-700 mb-3'>Course Description</p>
                            {editDesc ?
                                <input type="button" onClick={()=>{setEditDesc(false)}} className='text-md font-semibold bg-purple-500 hover:bg-purple-700 text-white mb-3 flex items-center gap-1 py-2 px-4 rounded' value="save" />
                                :
                                <div className='font-bold mb-4 px-4 rounded flex items-center'>
                                    <MdEdit />
                                    <input type="button" onClick={()=>{setEditDesc(true)}} value="edit" />
                                </div>
                            }
                        </div>
                        {editDesc ?
                            <textarea name="description" cols="50" rows="4" className='block border border-gray-300 w-6/6 mx-auto rounded-md p-3 text-md' value={desc} onChange={(e) => setDesc(e.target.value)} placeholder='Enter Course description here...'></textarea>
                            :
                            <p className='block text-lg font-bold text-gray-500 my-3 text-center px-3'>{desc}</p>
                        }
                        
                    </div>
                    
                    <div className='bg-purple-100 p-5 block border border-gray-300 rounded text-sm w-5/6 my-5 mx-auto shadow-xl'>
                        <div className='flex justify-between items-center'>
                            <p className='block text-lg font-bold text-gray-700 mb-3'>Course Thumbnail</p>
                            <div className='flex justify-end'>
                                <input type="file" name='image' ref={imageInputRef} onChange={handleImageChange} className='text-md font-semibold text-gray-700 mb-3 gap-1' />
                            </div>
                        </div>
                        {viewImage ?
                            <div>
                            <img src={viewImage} alt="Preview" style={{ maxWidth: '300px', maxHeight: '200px', margin: "20px auto", borderRadius: '10px' }} />
                            </div>:
                            <div style={{ width: '300px', height: '200px', margin: '20px auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '1px solid #a855f7', borderRadius: '10px' }}>
                                <CiCamera className='text-2xl' />
                                <p className='text-lg'>No Image Uploaded</p>
                            </div>
                        }
                    </div>
                </div>
                
                <div className='w-full mx-auto'>
                    <div className='bg-purple-100 rounded w-5/6 my-5 mx-auto shadow-xl p-5'>
                        <div className='flex justify-between items-center'>
                            <p className='block text-lg font-bold text-gray-700 mb-3'>Course Price</p>
                            {editPrice ?
                                <input type="button" onClick={()=>{setEditPrice(false)}} className='text-md font-semibold bg-purple-500 hover:bg-purple-700 text-white mb-3 flex items-center gap-1 py-2 px-4 rounded' value="save" />
                                :
                                <div className='font-bold mb-4 px-4 rounded flex items-center'>
                                    <MdEdit />
                                    <input type="button" onClick={()=>{setEditPrice(true)}} value="edit" />
                                </div>
                            }
                        </div>
                        {editPrice ?
                            <input type="number" name='price' className='block border border-gray-300 w-full rounded-md p-3 text-md' value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Enter price of the course..." />
                            :
                            <p className='text-lg font-bold text-gray-500 my-3 px-3 flex justify-center items-center'><PiCurrencyInr />{price}</p>
                        }
                    </div>

                    <div className='bg-purple-100 rounded block border border-gray-300 text-sm w-5/6 my-5 mx-auto shadow-xl p-5'>
                        <div className='flex justify-between items-center'>
                            <p className='block text-lg font-bold text-gray-700 mb-3'>Course Video</p>
                            <div className='flex justify-end'>
                                <input type="file" name='video' ref={videoInputRef} onChange={handleVideoChange} className='text-md font-semibold text-gray-700 mb-3 gap-1' />
                            </div>
                        </div>
                        {viewVideo ?
                            <div>
                            <video src={viewVideo} controls alt="Preview" style={{ maxWidth: '300px', maxHeight: '200px', margin: "20px auto", borderRadius: '10px' }} />
                            </div>:
                            <div style={{ width: '300px', height: '200px', margin: '20px auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '1px solid #a855f7', borderRadius: '10px' }}>
                                <FaVideo className='text-2xl' />
                                <p className='text-lg'>No Video Uploaded</p>
                            </div>
                        }
                    </div>
                </div>

            </div>



        </form>
    )
}

export default AddCourse;
