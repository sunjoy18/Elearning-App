import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import Nav from '../Nav';
const api = process.env.REACT_APP_API

const CourseUpdate = () => {
    const [questionCount, setQuestionCount] = useState(2);
    const addQuestion = () => {
        setQuestionCount(prevCount => prevCount + 1);
    };

    const validateOptions = (event) => {
        // Prevent the default form submission behavior
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

    // useEffect(() => {
    //     const getModules = async () => {
    //         if (resRef.current) {
    //             // console.log("Modules : ",resRef.current.data.filter(course =>  course.name === selectedCourseName)[0].modules.map(module => module.name));
    //             setModuleNameOptions(resRef.current.data.filter(course =>  course.name === selectedCourseName)[0].modules.map(module => module.name));
    //             console.log("moduleNameOptions: ", moduleNameOptions)
    //         }
    //     };

    //     getModules();
    // }, [selectedCourseName]);
    return (
        <>
            <div className="col-lg-2 col-md-3 col-sm-4 bg-info text-center">
                <Nav />
            </div>
            <div className="col-lg-10 col-md-9 col-sm-8 p-3 bg-white border">
                <div className='m-2'>
                    <h2>Add New course : </h2>
                    <div className='form '>
                        <form action={`http://${api}/api/upload`} method='post' encType='multipart/form-data' onSubmit={validateOptions}>

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

                            <div className='mb-3'>
                                <label htmlFor='moduleName' className='form-label'>
                                    Module Name:
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
                                    Unit Name:
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

                            <button type='submit' className='btn btn-primary'>
                                Submit
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CourseUpdate;
