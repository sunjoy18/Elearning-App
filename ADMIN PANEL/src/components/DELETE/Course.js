import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Nav from '../Nav';
const api = process.env.REACT_APP_API

let API_BASE_URL = `http://${api}/api`;

const CourseDelete = () => {

  let history = useNavigate();

  const handleDelete = async () => {
    try {
      const courseName = document.getElementById('courseName').value;

      const response = await axios.delete(`${API_BASE_URL}/course/${courseName}`);
      console.log(response.data);
      alert("Course Deleted Successfully");
      history("/delete");

    } catch (error) {
      console.error('Error deleting course data:', error);
    }
  };

  const resRef = useRef(null); // Using useRef for global access
  const [courseNameOptions, setCourseNameOptions] = useState([]);
  const [selectedCourseName, setSelectedCourseName] = useState('');

  // Fetch data from API when the component mounts
  useEffect(() => {
    const getCourses = async () => {
      try {
        const response = await axios.get(`http://${api}/api/getCourses`);
        resRef.current = response; // Update the ref value
        setCourseNameOptions(response.data.map(course => course.name));
        // console.log("courseNameOptions: ", response.data);
        // console.log("Courses Fetched");
      } catch (error) {
        console.log("Error fetching courses: ", error);
      }
    };

    getCourses();
  }, []);

  return (
    <>
      <div className="col-lg-2 col-md-3 col-sm-4 bg-info text-center">
        <Nav />
      </div>
      <div className="col-lg-10 col-md-9 col-sm-8 p-3 bg-white border">
        <div className='m-2'>
          <h2>Delete Course:</h2>
          <div className='form '>
            <form>
              <div className='mb-3'>
                <label htmlFor='courseName' className='form-label'>
                  <b>Choose Course Name:</b>
                </label>
                <select
                  id='courseName'
                  name='courseName'
                  className='form-control'
                  value={selectedCourseName}
                  onChange={(e) => setSelectedCourseName(e.target.value)}
                >
                  <option value='' disabled>Select a Course</option>
                  {courseNameOptions.map(option => (
                    <option key={option.id} value={option.value}>
                      {option}
                    </option>
                  ))}
                </select>
                {/* <input type='text' id='courseName' name='courseName' className='form-control' placeholder='Enter New Course Name' /> */}
              </div>

              <button type='button' className='btn btn-danger' onClick={handleDelete}>
                Delete Course
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseDelete;
