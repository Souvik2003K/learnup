import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './auth/Login';
import Signup from './auth/Signup';
import Teacher from './teacher/Teacher';
import Student from './student/Student';
import AddCourse from './teacher/AddCourse';
import Protected from './Protected/Protected';
import ShowCourses from './student/ShowCourses';


function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Login />}></Route>
        <Route path='/login' element={<Login />}></Route>
        <Route path='/signup' element={<Signup />}></Route>
        <Route path='/teacher' element={<Protected Component={Teacher} />}></Route>
        <Route path='/add-course' element={<Protected Component={AddCourse} />}></Route>
        <Route path='/student' element={<Protected Component={Student} />}></Route>
        <Route path='/show-courses/:value' element={<Protected Component={ShowCourses} />}></Route>
      </Routes>
    </Router>
  )
}

export default App
