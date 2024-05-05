import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import Nav from './components/Nav';
import New from './components/New';
import Home from './components/Home';
import Update from './components/Update';
import Delete from './components/Delete';
import ChapterUpdate from './components/UPDATE/Chapter';
import NotesVideoUpdate from './components/UPDATE/notes_video';
import ModuleUpdate from './components/UPDATE/Module';
import UnitUpdate from './components/UPDATE/Unit';
import QuizzUpdate from './components/UPDATE/Quizz';
import CourseUpdate from './components/UPDATE/Course';
import CourseDelete from './components/DELETE/Course';
import ModuleDelete from './components/DELETE/Module';
import UnitDelete from './components/DELETE/Unit';
import ChapterDelete from './components/DELETE/Chapter';
import NotesVideoDelete from './components/DELETE/notes_video';
import QuizzDelete from './components/DELETE/Quizz';
import Videos from './components/UPDATE/Videos';
import Video from './components/DELETE/Video';
import ExcelUploader from './ExcelUploader';
import Login from './components/Login';


function App() {
  const [api, setApi] = useState(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Update the state when the authentication token changes
    if (localStorage.getItem("auth-token")) {
      
      setIsLoggedIn(true);
    }
  }, [isLoggedIn]);

  return (

    <Router>
      <div className="container-fluid min-vh-100">
        <div className="row">
          {/* {isLoggedIn && (
            <div className="col-lg-2 col-md-3 col-sm-4 bg-info text-center">
              <Nav />
            </div>
          )} */}

          <Routes>
            <Route path='/' element={<Home />}></Route>
            <Route path='/login' element={<Login />}></Route>
            <Route path='/newuser' element={<ExcelUploader />}></Route>
            <Route path='/new' element={<New api={api} />}></Route>
            <Route path='/update' element={<Update setApi={setApi} />}></Route>
            <Route path='/delete' element={<Delete />}></Route>
            <Route path='/update/course' element={<CourseUpdate />}></Route>
            <Route path='/update/module' element={<ModuleUpdate />}></Route>
            <Route path='/update/unit' element={<UnitUpdate />}></Route>
            <Route path='/update/chapter' element={<ChapterUpdate />}></Route>
            <Route path='/update/NotesVideoUpdate' element={<NotesVideoUpdate />}></Route>
            <Route path='/update/Quizz' element={<QuizzUpdate />}></Route>
            <Route path='/update/Videos' element={<Videos />}></Route>

            <Route path='/delete/course' element={<CourseDelete />}></Route>
            <Route path='/delete/module' element={<ModuleDelete />}></Route>
            <Route path='/delete/unit' element={<UnitDelete />}></Route>
            <Route path='/delete/chapter' element={<ChapterDelete />}></Route>
            <Route path='/delete/NotesVideoUpdate' element={<NotesVideoDelete />}></Route>
            <Route path='/delete/Video' element={<Video />}></Route>
            <Route path='/delete/Quizz' element={<QuizzDelete />}></Route>
          </Routes>
        </div>
      </div>


    </Router>
  )
}

export default App;