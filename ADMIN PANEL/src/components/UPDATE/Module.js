import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Nav from '../Nav';
const api = process.env.REACT_APP_API


const ModuleUpdate = () => {
  const [courseName, setCourseName] = useState('');
  const [moduleName, setModuleName] = useState('');
  let history = useNavigate();

  const [questionCount, setQuestionCount] = useState(2);

  const addQuestion = () => {
    setQuestionCount(prevCount => prevCount + 1);
  };

  const [videosCount, setVideosCount] = useState(1);
  const addVideo = () => {
    setVideosCount(prevCount => prevCount + 1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate if correctAnswer is present in options before adding a new question
    const optionsInput = document.getElementsByName('option');
    const correctAnswerInput = document.getElementsByName('correctAnswer');

    for (let i = 0; i < optionsInput.length; i++) {
      const options = optionsInput[i].value.split(',').map(option => option.trim().toLowerCase());
      const correctAnswer = correctAnswerInput[i].value.trim().toLowerCase();

      if (!options.includes(correctAnswer)) {
        alert(`Correct Answer for Quiz Question ${i + 1} should be one of the provided options.`);
        return; // Do not add a new question if validation fails
      }
    }

    // Continue with form submission if validation passes
    event.currentTarget.submit();
  };

  const resRef = useRef(null); // Using useRef for global access
  const [courseNameOptions, setCourseNameOptions] = useState([]);
  const [selectedCourseName, setSelectedCourseName] = useState('');

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
          <h2>Add New Module:</h2>
          <div className='form'>
            <form id='form1' method='post' action={`http://${api}/api/update/module`} onSubmit={handleSubmit} encType='multipart/form-data' >
              <div className='mb-3'>
                <label htmlFor='courseName' className='form-label'>
                  Choose Course Name:
                </label>
                <select
                  id='courseName'
                  name='courseName'
                  className='form-control'
                  value={selectedCourseName}
                  onChange={(e) => setSelectedCourseName(e.target.value) && setCourseName(e.target.value)}
                >
                  <option value='' disabled>Select a Course</option>
                  {courseNameOptions.map(option => (
                    <option key={option.id} value={option.value}>
                      {option}
                    </option>
                  ))}
                </select>
                {/* <input
              type='text'
              id='courseName'
              name='courseName'
              className='form-control'
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
            /> */}
              </div>

              <div className='mb-3'>
                <label htmlFor='moduleName' className='form-label'>
                  <b>Add New Module Name: </b>
                </label>
                <input
                  type='text'
                  id='moduleName'
                  name='moduleName'
                  className='form-control'
                  placeholder='Enter New Module Name'
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                />

                <div className='mb-3'>
                  <label htmlFor='unitName' className='form-label'>
                    <b>Add  New Unit Name: </b>
                  </label>
                  <input type='text' id='unitName' name='unitName' className='form-control' placeholder='Enter New Unit Name' />
                </div>

                <div className='mb-3'>
                  <label htmlFor='chapterName' className='form-label'>
                    Chapter Name:
                  </label>
                  <input type='text' id='chapterName' name='chapterName' className='form-control' />
                </div>

                <div className='mb-3'>
                  <label htmlFor='minAnswer' className='form-label'>
                    Minimum Answer:
                  </label>
                  <input type='number' id='min' name='min' className='form-control' />
                </div>

                <div className='mb-3'>
                  <label htmlFor='video' className='form-label'>
                    Notes/Videos:
                  </label>
                  <input type='file' name='video' className='form-control' multiple />
                </div>

                <input type='text' id='org' name='org' className='form-control' value={'frontend'} hidden />


                {[...Array(videosCount)].map((_, index) => (
                  <div key={index}>
                    <div className='mb-3'>
                      <label htmlFor={`videoName[${index}]`} className='form-label'>
                        <b>Video Name {index + 1}:</b>
                      </label>
                      <input type='text' name={`videoName[${index}]`} className='form-control' />
                    </div>

                    <div className='mb-3'>
                      <label htmlFor={`url[${index}]`} className='form-label'>
                        Link:
                      </label>
                      <input type='text' name={`url[${index}]`} className='form-control' />
                    </div>
                  </div>
                ))}

                <button type='button' className='btn btn-secondary mb-3' onClick={addVideo}>
                  Add More Videos
                </button>
                <br></br>

                {[...Array(questionCount)].map((_, index) => (
                  <div key={index}>
                    <div className='mb-3'>
                      <label htmlFor={'questions'} className='form-label'>
                        <b>Quiz Question {index + 1}:</b>
                      </label>
                      <input type='text' name={'questions'} className='form-control' />
                    </div>

                    <div className='mb-3'>
                      <label htmlFor={'option'} className='form-label'>
                        Options:
                      </label>
                      <input type='text' name={'option'} className='form-control' placeholder='Separate each option by comma ","' />
                    </div>

                    <div className='mb-3'>
                      <label htmlFor={'correctAnswer'} className='form-label'>
                        Answer:
                      </label>
                      <input type='text' name={'correctAnswer'} className='form-control' />
                    </div>
                  </div>

                ))}

                {/* Button to Add More Questions */}
                <button type='button' className='btn btn-secondary mb-3' onClick={addQuestion}>
                  Add More Questions
                </button>
                <br></br>

              </div>
              <button type="submit" className="btn btn-primary" id="submitButton">
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModuleUpdate;
