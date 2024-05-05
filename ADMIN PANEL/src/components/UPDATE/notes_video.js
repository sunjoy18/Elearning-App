import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Nav from '../Nav';

const api = process.env.REACT_APP_API

const NotesVideoUpdate = () => {
    const resRef = useRef(null); // Using useRef for global access
    const [courseNameOptions, setCourseNameOptions] = useState([]);
    const [moduleNameOptions, setModuleNameOptions] = useState([]);
    const [unitNameOptions, setUnitNameOptions] = useState([]);
    const [chapterNameOptions, setChapterNameOptions] = useState([]);
    const [selectedCourseName, setSelectedCourseName] = useState('');
    const [selectedModuleName, setSelectedModuleName] = useState('');
    const [selectedUnitName, setSelectedUnitName] = useState('');
    const [selectedChapterName, setSelectedChapterName] = useState('');

    // Fetch data from API when the component mounts
    useEffect(() => {
        const getCourses = async () => {
            try {
                const response = await axios.get(`http://${api}/api/getCourses`);
                resRef.current = response; // Update the ref value
                setCourseNameOptions(response.data.map(course => course.name));
                console.log("courseNameOptions: ", response.data);
                console.log("Courses Fetched");
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

    useEffect(() => {
        const getChapters = () => {
            if (resRef.current) {
                const selectedUnit = resRef.current.data
                    .find(course => course.name === selectedCourseName)
                    ?.modules.find(module => module.name === selectedModuleName)
                    ?.units.find(unit => unit.name === selectedUnitName);

                if (selectedUnit) {
                    setChapterNameOptions(selectedUnit.chapters.map(chapter => chapter.name));
                    console.log("chapterNameOptions: ", chapterNameOptions);
                }
            }
        };

        getChapters();
    }, [selectedUnitName]);

    return (
        <>
            <div className="col-lg-2 col-md-3 col-sm-4 bg-info text-center">
                <Nav />
            </div>
            <div className="col-lg-10 col-md-9 col-sm-8 p-3 bg-white border">
                <div className='m-2'>
                    <h2>Add New notes_video : </h2>
                    <div className='form '>
                        <form action={`http://${api}/api/update/files`} method='put' encType='multipart/form-data' >

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
                                        <option key={option} value={option}>
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

                            <div className='mb-3'>
                                <label htmlFor='chapterName' className='form-label'>
                                    Choose Chapter Name:
                                </label>
                                <select
                                    id='chapterName'
                                    name='chapterName'
                                    className='form-control'
                                    value={selectedChapterName}
                                    onChange={(e) => setSelectedChapterName(e.target.value)}
                                >
                                    <option value='' disabled>Select a Chapter</option>
                                    {chapterNameOptions.map(option => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                                {/* <input type='text' id='chapterName' name='chapterName' className='form-control' /> */}
                            </div>

                            {/* <div className='mb-3'>
                        <label htmlFor='minAnswer' className='form-label'>
                            Minimum Answer:
                        </label>
                        <input type='number' id='min' name='min' className='form-control' />
                    </div> */}

                            <div className='mb-3'>
                                <label htmlFor='video' className='form-label'>
                                    <b>Add New Notes/Videos:</b>
                                </label>
                                <input type='file' name='files' className='form-control' multiple />
                            </div>

                            <input type='text' id='org' name='org' className='form-control' value={'frontend'} hidden />

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

export default NotesVideoUpdate;
