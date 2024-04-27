import React from 'react';
import Home from '../Home';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Client, Databases, Query
    , ID, Storage 
} from 'appwrite';
import Select from 'react-select';
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, firestore } from '../config/firebase';
import { PiCurrencyInr } from "react-icons/pi";
import { PiDotsThreeOutlineVerticalLight } from "react-icons/pi";
import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { FaVideo } from "react-icons/fa";


export default function Teacher() {

    const client = new Client();

    client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

    const databases = new Databases(client);
    const storage = new Storage(client);


    const [modalVisible, setModalVisible] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });

    const openModal = (index, event) => {
        setSelectedBlog(index);
        // console.log('ind',index);
        const rect = event.target.getBoundingClientRect();
        setModalPosition({ x: rect.left, y: rect.bottom });
        setModalVisible(!modalVisible);
    };


    const [blogs, setBlogs] = useState([]);

    const [userData, setUserData] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);


    const [editable, setEditable] = useState(false);


    const [update, setUpdate] = useState(false);
    

    const videoInputRef = useRef(null);
    const [desc, setDesc] = useState('');
    const [video, setVideo] = useState(null);
    const [viewVideo, setViewVideo] = useState(null);

    const [selectedOption, setSelectedOption] = useState(null);
    const options = [
        { value: 'publish', label: 'publish' },
        { value: 'draft', label: 'draft' }
    ];

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

    // course DB
    let promise = databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_COURSE_COLLECTION_ID,
        [
            Query.equal('uploader_email', userData[0]?.email)
        ]
    );

    promise.then(function (response) {
        // console.log(response.documents);
        setBlogs(response.documents);
    }, function (error) {
        console.log('err in promise',error);
    });


    const Edit = async (doc) => {

        setModalVisible(false);

        if (video !== null && desc !== '') {
            const promise1 = await new Promise((resolve, reject) => {
                storage.createFile(import.meta.env.VITE_APPWRITE_VID_STORAGE_ID, doc.vid_id, video)
                    .then(resolve)
                    .catch(reject);
            });

            const newData = {
                description: desc,
                is_published: selectedOption ? selectedOption?.value : doc.is_published,
                vid_id: promise1?.$id
            }
    
            // course DB
            const promise2 = databases.updateDocument(
                import.meta.env.VITE_APPWRITE_DATABASE_ID,
                import.meta.env.VITE_APPWRITE_COURSE_COLLECTION_ID,
                doc.$id,
                newData
            );

            promise2.then(function (response) {
                console.log(response); // Success
                alert('video and description Updated Successfully');
                close();
            }, function (error) {
                console.log(error); // Failure
            });
        }

        else if (video === null && desc !== '') {

            const newData = {
                description: desc,
                is_published: selectedOption ? (selectedOption?.value === 'publish' ? true : false) : doc.is_published,
                // vid_id: promise1?.$id
            }
    
            // course DB
            const promise2 = databases.updateDocument(
                import.meta.env.VITE_APPWRITE_DATABASE_ID,
                import.meta.env.VITE_APPWRITE_COURSE_COLLECTION_ID,
                doc.$id,
                newData
            );

            promise2.then(function (response) {
                console.log(response); // Success
                alert('Description Updated Successfully');
                close();
            }, function (error) {
                console.log(error); // Failure
            });
        }

        else if (video !== null && desc === '') {
            const promise1 = await new Promise((resolve, reject) => {
                storage.createFile(import.meta.env.VITE_APPWRITE_VID_STORAGE_ID, doc.vid_id, video)
                    .then(resolve)
                    .catch(reject);
            });

            const newData = {
                // description: desc,
                is_published: selectedOption ? selectedOption?.value : doc.is_published,
                vid_id: promise1?.$id
            }
    
            // course DB
            const promise2 = databases.updateDocument(
                import.meta.env.VITE_APPWRITE_DATABASE_ID,
                import.meta.env.VITE_APPWRITE_COURSE_COLLECTION_ID,
                doc.$id,
                newData
            );

            promise2.then(function (response) {
                console.log(response); // Success
                alert('Video Updated Successfully');
                close();
            }, function (error) {
                console.log(error); // Failure
            });
        }

        else{
            const newData = {
                // description: desc,
                is_published: selectedOption ? (selectedOption?.value === 'publish' ? true : false) : doc.is_published,
                // vid_id: promise1?.$id
            }
    
            // course DB
            const promise2 = databases.updateDocument(
                import.meta.env.VITE_APPWRITE_DATABASE_ID,
                import.meta.env.VITE_APPWRITE_COURSE_COLLECTION_ID,
                doc.$id,
                newData
            );

            promise2.then(function (response) {
                console.log(response); // Success
                alert('Description Updated Successfully');
                close();
            }, function (error) {
                console.log(error); // Failure
            });
        }

    }

    const Delete = (doc) => {

        // for deleteing the video file
        const promise1 = storage.deleteFile(
            import.meta.env.VITE_APPWRITE_VID_STORAGE_ID, 
            doc.vid_id
        );

        promise1.then(function (response) {
            console.log(response); // Success
            alert('Video Deleted Successfully');
        }, function (error) {
            console.log(error); // Failure
        });
        
        // for deleting the image file
        const promise2 = storage.deleteFile(
            import.meta.env.VITE_APPWRITE_IMG_STORAGE_ID, 
            doc.img_id
        );

        promise2.then(function (response) {
            console.log(response); // Success
            alert('Video Deleted Successfully');
        }, function (error) {
            console.log(error); // Failure
        });

        // for deleting purchase record
        const promise3 = databases.listDocuments(
            '6620847f50c884a3aca6', 
            '662084c45586bacc51b1',
            [
                Query.equal('title', doc.title)
            ]
        );

        promise3.then(function (response) {
            console.log(response); // Success
            response.documents.forEach((d) => {
                const promise5 = databases.deleteDocument(
                    '6620847f50c884a3aca6', 
                    '662084c45586bacc51b1', 
                    d.$id
                );
                promise5.then(function (response) {
                    console.log(response); // Success
                }, function (error) {
                    console.log(error); // Failure
                });
            });
        }, function (error) {
            console.log(error); // Failure
        });

        // for deleting the document
        const promise4 = databases.deleteDocument(
            '6620847f50c884a3aca6', 
            '662084bc1cf4e261f7d1', 
            doc.$id
        );

        promise4.then(function (response) {
            console.log(response); // Success
            alert('Course Deleted Successfully');
            setModalVisible(false);
        }, function (error) {
            console.log(error); // Failure
        });
    }

    const close = () => {
        setDesc("");
        setVideo(null);
        setViewVideo(false);
        if (videoInputRef.current) {
            videoInputRef.current.value = '';
        }
        setEditable(false);
    }


    return (
        <div>
            <Home />
            <div className='w-4/6 mx-auto my-5 lg:w-3/6 xl:w-3/6'>
                <button style={{padding: '35px'}} className='bg-purple-100 border border-dashed border-gray-700 rounded-lg w-full font-bold text-xl py-5 my-5'>
                    <Link to='/add-course'>Add Course + </Link>
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="table-auto border-collapse" style={{width: '70%', margin: '20px auto'}}>
                    <thead>
                        <tr>
                            <th className="px-4 py-2">Course Title</th>
                            <th className="px-4 py-2">Price</th>
                            <th className="px-4 py-2">Published</th>
                            <th className="px-4 py-2">Options</th>
                        </tr>
                    </thead>
                    <tbody className='text-center'>
                        {blogs? blogs.map((blog, index) => {
                            return (
                                <tr key={index}>
                                    <td className="border px-4 py-2">{blog.title}</td>
                                    <td className="border px-4 py-2">Rs.{blog.price}</td>
                                    <td className="border px-4 py-2"><span>{blog.is_published === true ? 'Published' : 'Draft'}</span></td>
                                    <td className="border px-4 py-2">
                                        <button onClick={(e) => openModal(index, e)}>
                                            <PiDotsThreeOutlineVerticalLight />
                                        </button>
                                    </td>
                                    {modalVisible && selectedBlog !== null && (
                                        <div className="modal bg-white p-5 rounded shadow-lg" style={{ position: 'absolute', top: modalPosition.y, left: modalPosition.x }}>
                                            <div className="modal-content">
                                                <div className='flex items-center gap-2 mb-2 cursor-pointer' onClick={()=>{setEditable(true); setModalVisible(false);}}><MdEdit /><p className='font-bold'>Edit</p></div>
                                                <div className='flex items-center gap-2 mt-2 text-red-500 cursor-pointer' onClick={()=>{Delete(blog)}}><MdDelete /><p className='font-bold'>Delete</p></div>
                                            </div>
                                        </div>
                                    )}
                                    {editable && (
                                        <div className='shadow-lg' style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white'}}>
                                            <div className='bg-white shadow-xl'>
                                                <div className='text-center'>
                                                    <p className='block text-lg font-bold bg-purple-600 text-gray-100 mb-3 p-3'>
                                                        {blog.title}
                                                    </p>
                                                </div>
                                                <div className='bg-purple-100 p-5 rounded w-5/6 my-5 mx-auto'>
                                                    <div className='text-center'>
                                                        <p className='block text-lg font-bold text-gray-700 mb-3'>
                                                            Course Description
                                                        </p>
                                                        <textarea name="description" cols="10" rows="4" className='block border border-gray-300 w-5/6 mx-auto rounded-md p-3 text-md' value={desc} onChange={(e) => setDesc(e.target.value)} placeholder='Enter Course description here...'></textarea>
                                                    </div>
                                                    
                                                </div>
                                                <div className='bg-purple-100 rounded block border border-gray-300 text-sm w-5/6 my-5 mx-auto p-5'>
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
                                                <div className='block text-sm font-bold text-gray-700 mt-4 mb-1 mx-auto'>
                                                    <Select
                                                        className='mx-auto w-5/6'
                                                        defaultValue={selectedOption}
                                                        onChange={setSelectedOption}
                                                        options={options}
                                                        placeholder='Visibility'
                                                    />
                                                </div>
                                                <div className='flex justify-center'>
                                                    <div>
                                                        <button onClick={close} style={{display: 'flex', alignItems: 'center'}} className='border border-purple-500 hover:bg-purple-100 font-bold my-4 py-2 mx-2 px-4 rounded'>Cancel</button>
                                                    </div>
                                                    <div>
                                                        <button onClick={()=>{Edit(blog)}}  style={{display: 'flex', alignItems: 'center'}} className='bg-purple-500 hover:bg-purple-700 text-white font-bold my-4 py-2 mx-2 px-4 rounded'>Update</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                                </tr>
                            )
                        }):(
                            <tr>
                                <td className="border px-4 py-2">Loading...</td>
                                <td className="border px-4 py-2">Loading...</td>
                                <td className="border px-4 py-2">Loading...</td>
                                <td className="border px-4 py-2">Loading...</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                
            </div>
        </div>
    )
}
