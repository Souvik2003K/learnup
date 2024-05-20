import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { Client, Databases, ID, Storage } from 'appwrite';

import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, firestore } from '../config/firebase';

import Home from '../Home';

import ReactLoading from "react-loading";

import Select from 'react-select';

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

    const [err, setErr] = useState('');

    const [loading, setLoading] = useState(false);


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

    // console.log(currentDate.toString());
    const navigate = useNavigate();


    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [price, setPrice] = useState(0);
    const [image, setImage] = useState(null);
    const [video, setVideo] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    
    const options = [
        { value: 'Web Development', label: 'Web Development' },
        { value: 'Data Analytics', label: 'Data Analytics' },
        { value: 'Cyber Security', label: 'Cyber Security' },
        { value: 'Artificial Intelligence', label: 'Artificial Intelligence' },
        { value: 'Robotics', label: 'Robotics' },
        { value: 'Embedded Systems', label: 'Embedded Systems' },
        { value: 'Cooking', label: 'Cooking' },
        { value: 'Dancing', label: 'Dancing' },
        { value: 'Singing', label: 'Singing' },
        { value: 'Core CS', label: 'Core CS' }
    ];

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
            setLoading(true);
            const [imgResponse, vidResponse] = await Promise.all([
                new Promise((resolve, reject) => {
                    storage.createFile(import.meta.env.VITE_APPWRITE_IMG_STORAGE_ID, ID.unique(), image)
                        .then(resolve)
                        .catch((error) => {
                            if (error.message === 'File extension not allowed') {
                                setErr('File extension not allowed, please upload an image file only');
                            }
                            reject(error);
                        });
                }),
                new Promise((resolve, reject) => {
                    storage.createFile(import.meta.env.VITE_APPWRITE_VID_STORAGE_ID, ID.unique(), video)
                        .then(resolve)
                        .catch((error) => {
                            if (error.message === 'File extension not allowed') {
                                setErr('File extension not allowed, please upload a video file only');
                            }
                            reject(error);
                        });
                })
            ]);
        
            console.log('image done');
            console.log('video done');

            const newData = {
                title: title,
                description: desc,
                price: Number(price),
                img_id: imgResponse?.$id,
                vid_id: vidResponse?.$id,
                category: selectedOption.value,
                is_published: e.target.textContent === 'Publish' ? true : false,
                uploader_email: userData[0]?.username
            };
        
                // course DB
                const promise = databases.createDocument(
                import.meta.env.VITE_APPWRITE_DATABASE_ID,
                import.meta.env.VITE_APPWRITE_COURSE_COLLECTION_ID,
                ID.unique(),
                newData
                );
            
                promise.then(function () {
                    // console.log(response);
                    setLoading(false);
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
                    console.log('err in creation of blog',error.message);
                    if(error.message.includes('Invalid document structure: Attribute "description"')){
                        setErr('Description should be of 500 length');
                    }else if(error.messagee.includes('Invalid document structure: Attribute "title"')){
                        setErr('Title should be of 100 length');
                    }else if(error.messagee.includes('Invalid document structure: Attribute "price"')){
                        setErr('Price should be a Number');
                    }
                });
        }
    }

    return (
        <form onSubmit={submit}>
            <Home />
            <div className='flex-layout'>
                <p className='text-3xl font-bold'>Course Setup</p>
                
                <div className='flex justify-center'>
                    <button onClick={submit} style={{display: 'flex', alignItems: 'center'}} className='border border-purple-500 hover:bg-purple-100 font-bold my-4 py-2 mx-2 px-4 rounded'><MdPublish className='text-xl' /><p>Save as Draft</p></button>
                    <button onClick={submit} style={{display: 'flex', alignItems: 'center'}} className='bg-purple-500 hover:bg-purple-700 text-white font-bold my-4 py-2 mx-2 px-4 rounded'><MdPublish className='text-xl' /><p>Publish</p></button>
                </div>
            </div>

            {err &&
                <div className='w-80 lg:w-2/6 mx-auto my-2'>
                    <Alert icon={<CheckIcon fontSize="inherit" />} severity="error">
                        <p className='font-bold' >{err}</p>
                    </Alert>
                </div>
            }

            {loading && 
                <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 5}}>
                    <ReactLoading type="bubbles" color="#a855f7 " height={200} width={100} />
                </div>
                    }
            
            <div className='grid-layout-2'>
                <div className='w-5/6 mx-auto'>
                    <div className='bg-purple-100 p-5 rounded w-6/6 lg:w-5/6 my-5 mx-auto shadow-xl'>
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
                            <p className='block text-lg font-bold text-gray-500 my-3 text-center px-3'>{title}</p>
                        }
                    </div>
                    
                    <div className='bg-purple-100 p-5 rounded w-6/6 lg:w-5/6 my-5 mx-auto shadow-xl'>
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
                            <input type="text" name="description" className='block border border-gray-300 w-5/6 mx-auto rounded-md p-3 text-md' value={desc} onChange={(e) => setDesc(e.target.value)} placeholder='Enter Course description here...' />
                            :
                            <p className='block text-lg font-bold text-gray-500 my-3 text-center px-3'>{desc.length > 0 ? desc.slice(0, 120)+'....' : desc}</p>
                        }
                        
                    </div>
                    
                    <div className='bg-purple-100 p-5 block border border-gray-300 rounded text-sm w-6/6 lg:w-5/6 my-5 mx-auto shadow-xl'>
                        <div className='block'>
                            <p className='block text-lg font-bold text-gray-700 mb-3'>Course Thumbnail</p>
                            <div className='flex justify-center'>
                                <input type="file" name='image' ref={imageInputRef} onChange={handleImageChange} className='text-md font-semibold text-gray-700 mb-3 gap-1' />
                            </div>
                        </div>
                        {viewImage ?
                            <div>
                            <img src={viewImage} alt="Preview" className='storage-prop' />
                            </div>:
                            <div className='alter-prop'>
                                <CiCamera className='text-2xl' />
                                <p className='text-lg'>No Image Uploaded</p>
                            </div>
                        }
                    </div>
                </div>
                
                <div className='w-5/6 mx-auto'>
                    <div className='bg-purple-100 rounded w-6/6 lg:w-5/6 my-5 mx-auto shadow-xl p-5'>
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

                    <div className='bg-purple-100 p-5 rounded w-6/6 lg:w-5/6 my-5 mx-auto shadow-xl'>
                        <div className='flex justify-between items-center'>
                            <p className='block text-lg font-bold text-gray-700 mb-3'>Course Category</p>
                            <Select
                                className='w-full lg:w-80'
                                defaultValue={selectedOption}
                                onChange={setSelectedOption}
                                options={options}
                                placeholder='Select the Category'
                                required
                            />
                        </div>
                    </div>

                    <div className='bg-purple-100 rounded block border border-gray-300 text-sm w-6/6 lg:w-5/6 my-5 mx-auto shadow-xl p-5'>
                        <div className='block'>
                            <p className='block text-lg font-bold text-gray-700 mb-3'>Course Video</p>
                            <div className='flex justify-center'>
                                <input type="file" name='video' ref={videoInputRef} onChange={handleVideoChange} className='text-md font-semibold text-gray-700 mb-3 gap-1' />
                            </div>
                        </div>
                        {viewVideo ?
                            <div>
                            <video src={viewVideo} controls alt="Preview" className='storage-prop' />
                            </div>:
                            <div className='alter-prop'>
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
