import React, { useEffect } from 'react'
import nxgn from '../images/NXGN.png'
import { useNavigate } from 'react-router-dom'
import Nav from './Nav'
const api = process.env.REACT_APP_API

const Home = () => {

    let history = useNavigate();
    useEffect(() => {
        if (!localStorage.getItem("auth-token")) {
            history("/login");
        }
    }, [])

    return (
        <>
            <div className="col-lg-2 col-md-3 col-sm-4 bg-info text-center">
                <Nav />
            </div>
            <div className="col-lg-10 col-md-9 col-sm-8 bg-white p-3 border">
                <div className='center-container' id='home'>
                    <img src={nxgn} alt='NextGenLab' id='logo' />
                    <h1>Hello, {localStorage.getItem('name')}</h1>
                    <h4 style={{ fontWeight: '400' }}>Welcom to NextGenLab Admin Panel : Python School Coding program.</h4>
                </div>
            </div>
        </>
    )
}

export default Home