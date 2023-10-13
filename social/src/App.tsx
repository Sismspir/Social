import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AlertContainer from "./components/Alert/AlertContainer";
import Register from './components/Register';
import Myprofile from './components/Myprofile';
import Login from './components/Login';
import Home from './components/Home';
import React, { useState } from 'react';
import './App.css'

function App() {

  const [currentUser, setCurrentUser] = useState(localStorage.getItem("currentUser"));
  console.log("the current user is:", currentUser);
  return (
    <>
      <div className='h-screen bg-[#d4bfee]'>
        <AlertContainer>
        <Router>
          <Routes>
            <Route path="/" element={<Login updateUser={setCurrentUser} />} />
            <Route path="/register" element={ <Register/>} />
            <Route path="/myprofile" element={  currentUser ? <Myprofile updateUser={setCurrentUser} /> : <Login updateUser={setCurrentUser}/>} />
            <Route path="/home" element={ currentUser ? <Home updateUser={setCurrentUser} /> : <Login updateUser={setCurrentUser}/>} />
          </Routes>
        </Router>
      </AlertContainer>
      </div>
    </>
  )
}

export default App
