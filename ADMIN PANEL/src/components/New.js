import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from './Nav';
const api = process.env.REACT_APP_API

const New = (props) => {

    let history = useNavigate();

    const [questionCount, setQuestionCount] = useState(2);
    console.log(props.api);
    const addQuestion = () => {
        setQuestionCount(prevCount => prevCount + 1);
    };
    const [videosCount, setVideosCount] = useState(1);
    const addVideo = () => {
        setVideosCount(prevCount => prevCount + 1);
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

        const videos = [];
        for (let i = 0; i < videosCount; i++) {
            const videoName = event.target[`videoName[${i}]`].value;
            const link = event.target[`link[${i}]`].value;
            videos.push({ name: videoName, link });
        }

        const formData = new FormData(event.target);
        formData.append('videos', JSON.stringify(videos));

        // Perform your API call or form submission with formData
        // Example using fetch:
        fetch(`http://${api}/api/upload`, {
            method: 'POST',
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                // Handle response data as needed
                console.log(data);
                alert("Course Created");
                history("/new");
            })
            .catch(error => {
                console.error('Error:', error);
            });

        // Continue with form submission if validation passes
        // event.currentTarget.submit();
    };



    return (
        <>
            <div className="col-lg-2 col-md-3 col-sm-4 bg-info text-center">
                <Nav />
            </div>
            <div className="col-lg-10 col-md-9 col-sm-8 p-3 bg-white border">
                <div className='container'>
                    <div className='m-2'>
                        <h2>Add New Course : </h2>
                        <div className='form'>
                            <form action={`http://${api}/api/upload`} method='post' encType='multipart/form-data' onSubmit={validateOptions}>

                                <div className='mb-3'>
                                    <label htmlFor='courseName' className='form-label'>
                                        Course Name:
                                    </label>
                                    <input type='text' id='courseName' name='courseName' className='form-control' />
                                </div>

                                <div className='mb-3'>
                                    <label htmlFor='video' className='form-label'>
                                        Course img:
                                    </label>
                                    <input type='file' name='video' className='form-control' multiple />
                                </div>

                                <div className='mb-3'>
                                    <label htmlFor='moduleName' className='form-label'>
                                        Module Name:
                                    </label>
                                    <input type='text' id='moduleName' name='moduleName' className='form-control' />
                                </div>

                                <div className='mb-3'>
                                    <label htmlFor='unitName' className='form-label'>
                                        Unit Name:
                                    </label>
                                    <input type='text' id='unitName' name='unitName' className='form-control' />
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
                                        Notes:
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
                                            <label htmlFor={`link[${index}]`} className='form-label'>
                                                Link:
                                            </label>
                                            <input type='text' name={`link[${index}]`} className='form-control' />
                                        </div>
                                    </div>
                                ))}


                                {/* Button to Add More Videos */}
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

                                <button type='submit' className='btn btn-primary'>
                                    Submit
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default New;
