import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Nav from '../Nav';

const api = process.env.REACT_APP_API

let API_BASE_URL = `http://${api}/api`;

const UnitDelete = () => {

  let history = useNavigate();

  const handleDelete = async (deleteEndpoint) => {
    try {
      const courseName = document.getElementById('courseName').value;
      const moduleName = document.getElementById('moduleName').value;
      const unitName = document.getElementById('unitName').value;

      const response = await axios.delete(`${API_BASE_URL}${deleteEndpoint}/${courseName}/${moduleName}/${unitName}`);
      console.log(response.data); // Handle the response data as needed
      alert("Unit deleted");
      history("/delete");
    } catch (error) {
      console.error(`Error deleting data: ${error}`);
      // Handle errors as needed
    }
  };

  const resRef = useRef(null); // Using useRef for global access
  const [courseNameOptions, setCourseNameOptions] = useState([]);
  const [selectedCourseName, setSelectedCourseName] = useState('');

  const [moduleNameOptions, setModuleNameOptions] = useState([]);
  const [selectedModuleName, setSelectedModuleName] = useState('');

  const [unitNameOptions, setUnitNameOptions] = useState([]);
  const [selectedUnitName, setSelectedUnitName] = useState('');

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

  useEffect(() => {
    const getModules = () => {
      if (resRef.current) {
        const selectedCourse = resRef.current.data.find(course => course.name === selectedCourseName);

        if (selectedCourse) {
          setModuleNameOptions(selectedCourse.modules.map(module => module.name));
          console.log("moduleNameOptions: ", moduleNameOptions);
        }
      }
    };
    getModules();
  }, [selectedCourseName]);

  useEffect(() => {
    const getUnits = () => {
      if (resRef.current) {
        const selectedModule = resRef.current.data
          .find(course => course.name === selectedCourseName)
          ?.modules.find(module => module.name === selectedModuleName);

        if (selectedModule) {
          setUnitNameOptions(selectedModule.units.map(unit => unit.name));
          console.log("unitNameOptions: ", unitNameOptions);
        }
      }
    };

    getUnits();
  }, [selectedModuleName]);

  return (
    <>
      <div className="col-lg-2 col-md-3 col-sm-4 bg-info text-center">
        <Nav />
      </div>
      <div className="col-lg-10 col-md-9 col-sm-8 p-3 bg-white border">
        <div className='m-2'>
          <h2>Delete Unit:</h2>
          <div className='form '>
            <form>
              <div className='mb-3'>
                <label htmlFor='courseName' className='form-label'>
                  Choose Course Name:
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
                {/* <input type='text' id='courseName' name='courseName' className='form-control' /> */}
              </div>

              <div className='mb-3'>
                <label htmlFor='moduleName' className='form-label'>
                  Choose Module Name:
                </label>
                <select
                  id='moduleName'
                  name='moduleName'
                  className='form-control'
                  value={selectedModuleName}
                  onChange={(e) => setSelectedModuleName(e.target.value)}
                >
                  <option value='' disabled>Select a Module</option>
                  {moduleNameOptions.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {/* <input type='text' id='moduleName' name='moduleName' className='form-control' /> */}
              </div>

              <div className='mb-3'>
                <label htmlFor='unitName' className='form-label'>
                  Choose Unit Name:
                </label>
                <select
                  id='unitName'
                  name='unitName'
                  className='form-control'
                  value={selectedUnitName}
                  onChange={(e) => setSelectedUnitName(e.target.value)}
                >
                  <option value='' disabled>Select a Unit</option>
                  {unitNameOptions.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {/* <input type='text' id='unitName' name='unitName' className='form-control' /> */}
              </div>

              <button
                type='button'
                className='btn btn-danger'
                onClick={() => handleDelete('/course/unit')}
              >
                Delete Unit
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default UnitDelete;
