import React, { useState } from 'react'
import axios from 'axios';
import "./css/login.css";
import { useNavigate } from 'react-router-dom';


const Login = () => {

    let history = useNavigate();

    const [details, setDetails] = useState({
        email: "",
        password: ""
    });


    const handleLogin = async (e) => {
        e.preventDefault();
        axios.post("http://192.168.0.215:5000/api/auth/admin-login", details)
            .then(res => {
                if (res) {
                    localStorage.setItem("auth-token", res.data.authToken);
                    localStorage.setItem("name", res.data.adminName);
                    history("/");
                }
                else {
                    alert("Invalid Credentials");
                }
            })
            .catch(err => console.log(err));
    }

    const handleChange = (e) => {
        setDetails({ ...details, [e.target.name]: e.target.value });
    }


    return (
        // <div className="center-container bg-primary text-white">
        //     <div className="col-3 border rounded bg-transparent ">
        //       <h2 className="m-3 text-center">Admin Panel</h2>
        //       <form onSubmit={handleSubmit}>
        //         <div className="mb-3 p-4 pb-1">
        //           <label htmlFor="username" className="form-label">User Name :</label>
        //           <input type="text" className="form-control" id="username" name="username" placeholder="username" />
        //         </div>
        //         <div className="mb-3 p-4 pb-1">
        //           <label htmlFor="password" className="form-label">Password :</label>
        //           <input type="text" className="form-control" id="password" name="password" placeholder="password" />
        //         </div>
        //         <div className="text-center">
        //           <button className="btn btn-warning m-3" type="submit">LOGIN</button>
        //         </div>
        //       </form>
        //     </div>
        //   </div>


        <>

            <div className="container">
                <div className='log'>
                    <div className="row">
                        <div className="col-lg-3 col-md-2"></div>
                        <div className="col-lg-6 col-md-8 login-box">
                            <div className="col-lg-12 login-key">
                                <i className="fa fa-key" aria-hidden="true"></i>
                            </div>
                            <div className="col-lg-12 login-title">
                                ADMIN PANEL
                            </div>

                            <div className="col-lg-12 login-form">
                                <div className="col-lg-12 login-form">
                                    <form>
                                        <div className="form-group">
                                            <label className="form-control-label">EMAIL</label>
                                            <input id='login-input' type="text" name='email' className="form-control" onChange={handleChange} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-control-label">PASSWORD</label>
                                            <input id='login-input' type="password" name='password' className="form-control" onChange={handleChange} />
                                        </div>

                                        <div className="col-lg-12 loginbttm">

                                            <div className="login-button">
                                                <button type="button" className="btn btn-outline-primary" onClick={handleLogin}>LOGIN</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-2"></div>
                        </div>
                    </div>
                </div>
            </div>
        </>


    )
}

export default Login