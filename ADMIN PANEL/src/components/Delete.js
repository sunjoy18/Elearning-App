import React from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from './Nav';

const Delete = () => {
    const navigate = useNavigate();
    const cardsData = [
        { title: 'Course', content: 'Delete Course', route: '/delete/course' },
        { title: 'Module', content: 'Delete Module', route: '/delete/module' },
        { title: 'Unit', content: 'Delete Unit', route: '/delete/unit' },
        { title: 'Chapter', content: 'Delete Chapter', route: '/delete/chapter' },
        { title: 'Notes', content: 'Delete notes from the course.', route: '/delete/NotesVideoUpdate' },
        { title: 'Video', content: 'Delete videos from the course.', route: '/delete/Video' },
        { title: 'Quizz', content: 'Delete Quizz', route: '/delete/Quizz' },
    ];

    const handleButtonClick = (route) => {
        navigate(route);
    };

    return (
        <>
            <div className="col-lg-2 col-md-3 col-sm-4 bg-info text-center">
                <Nav />
            </div>
            <div className="col-lg-10 col-md-9 col-sm-8 bg-white p-3 border">
                <div className='m-2'>
                    <h2>Delete course:</h2>
                    <div className='row m-2'>
                        {cardsData.map((card, index) => (
                            <div key={index} className='col-12 col-md-4 mb-5 d-flex align-items-stretch'>
                                <div className='card border border-dark rounded p-2 text-center mx-auto'>
                                    <h5 className='card-title'>{card.title}</h5>
                                    <p className='card-text'>{card.content}</p>
                                    <button
                                        type='button'
                                        className='btn btn-outline-primary w-50'
                                        onClick={() => handleButtonClick(card.route, card.title)}
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Delete;
