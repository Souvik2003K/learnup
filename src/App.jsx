import './App.css';
import { useEffect, useState } from 'react';
import { auth, firestore } from './config/firebase';
import { getDocs, query, where, collection } from "firebase/firestore";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './auth/Login';
import Signup from './auth/Signup';
import Teacher from './teacher/Teacher';
import Student from './student/Student';
import AddCourse from './teacher/AddCourse';
import Protected from './Protected/Protected';
import ShowCourses from './student/ShowCourses';
import Test from './student/Test';


function App() {

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

  console.log('App rendered');
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Login />}></Route>
        <Route path='/login' element={<Login />}></Route>
        <Route path='/signup' element={<Signup />}></Route>
        {userData[0]?.roles === 'teacher' && 
          <>
            <Route path='/teacher' element={<Protected Component={Teacher} />}></Route>
            <Route path='/add-course' element={<Protected Component={AddCourse} />}></Route>
            <Route path='/*' element={<Navigate to='/teacher' replace />}></Route>
          </>
        }
        {userData[0]?.roles === 'student' && 
          <>
            <Route path='/student' element={<Protected Component={Student} />}></Route>
            <Route path='/show-courses/:value' element={<Protected Component={ShowCourses} />}></Route>
            <Route path='/test/:value' element={<Protected Component={Test} />}></Route>
            <Route path='/*' element={<Navigate to='/student' replace />}></Route>
          </>
        }
      </Routes>
    </Router>
  )
}

export default App


/*

{
  "course": "Advance Excel",
  "question": "How long is an IPv6 address?",
  "answer": "128 bits",
  "options": [
    "32 bits",
    "64 bits",
    "128 bits",
    "128 bytes"
  ]
},

*/