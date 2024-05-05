import React from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from './Nav';
import "../App.css";

const Update = (props) => {
    const navigate = useNavigate();
    const cardsData = [
        { title: 'Module', content: 'Content for Module', route: '/update/module' },
        { title: 'Unit', content: 'Content for Unit', route: '/update/unit' },
        { title: 'Chapter', content: 'Content for Chapter', route: '/update/chapter' },
        { title: 'Notes', content: 'Add more notes or videos to the course.', route: '/update/NotesVideoUpdate' },
        { title: 'Quizz', content: 'Content for Quizz', route: '/update/Quizz' },
        { title: 'Video', content: 'Content for Quizz', route: '/update/Videos' },
    ];

    const handleButtonClick = (route, title) => {
        props.setApi(title)
        navigate(route);
    };

    return (
        <>
            <div className="col-lg-2 col-md-3 col-sm-4 bg-info text-center">
                <Nav />
            </div>
            <div className="col-lg-10 col-md-9 col-sm-8 p-3 bg-white border">
                <div className='m-2'>
                    <h2>Update course:</h2>
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

export default Update;
