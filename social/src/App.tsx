import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AlertContainer from "./components/Alert/AlertContainer";
import ProtectedRoutes from './components/ProtectedRoutes';
import Register from './components/Register';
import { useParams } from "react-router-dom";
import Myprofile from './components/Myprofile';
import User from './components/User'
import Login from './components/Login';
import Home from './components/Home';
import React, { useState } from 'react';
import './App.css'

function App() {

  const [currentUser, setCurrentUser] = useState(localStorage.getItem("currentUser"));
  const { givenUser } = useParams();
  console.log("the current user is:", currentUser, currentUser == "{}");
  return (
    <>
      <div className='min-h-screen bg-[#d4bfee]'>
        <AlertContainer>
        <Router>
          <Routes>
            <Route path="/" element={<Login updateUser={setCurrentUser} />} />
            <Route path="/register" element={ <Register/>} />
            <Route element={<ProtectedRoutes currentUser={ (currentUser != null && currentUser !=  "{}")  ? currentUser : "no-user"} />}>
                <Route path="/myprofile" element={  currentUser ? <Myprofile updateUser={setCurrentUser} /> : <Login updateUser={setCurrentUser}/>} />
                <Route path="/home" element={ currentUser ? <Home updateUser={setCurrentUser} /> : <Login updateUser={setCurrentUser}/>} />
                <Route path="/user/:givenUser" element={ givenUser !== "ok" ? <User/> : <Login updateUser={setCurrentUser}/>} />
            </Route>
          </Routes>
        </Router>
      </AlertContainer>
      </div>
    </>
  )
}

export default App
