import React, { useState } from "react";
import "./Login.css";
import signIn from "./images/signIn.png";
import back from "./images/back.png";
import {Link, useNavigate }from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const Login = () => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSignIn = async () => {
    
        const loginData = {
            'username': username,
            'password': password
        };

        const response = await fetch("http://localhost:5000/api/sign_in", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(loginData),
        });
        
        const responseData = await response.json();
        console.log(responseData["return"])

        if(responseData["return"] === false){
            toast.error("Incorrect username or password. Please try again.")
        }
        
        // Successful sign in
        // Store info in a cookie
        else{
            localStorage.setItem('roles', responseData['roles'])
            localStorage.setItem('username', username)
            navigate('/');  
        }
        
    };

    return (
        <div>
            <div className="container-fluid">

            {/* Go Back to Dashboard */}
            <Link to={"../"} className="back flex-align-items-center" style={{height: '60px', width:'300px'}}>
                <img src={back} alt="" style={{height: '50px', paddingTop: '8px'}}/> 
                <label className="dashboard">Back to Dashboard</label>
            </Link>
            
            <div className="row format">
                <div className="col-sm-2 flex-align-items-center" style={{width:'500px'}}>
                    <h1 style={{fontSize: '60px', paddingBottom: '10px'}}>Sign In</h1>
                    <h6 style={{paddingBottom:'20px', color:'gray'}}>Please login to continue to your account</h6>

                    <div className="form-group" style={{ width: 400, height: 130 }}>
                        <input
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            className="form-control input"
                            type="email"
                        />

                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="form-control input"
                            type="password"
                        />
                        <button className="btn btn-primary input"  onClick={() => handleSignIn()}>
                            Sign In
                        </button>
                    </div>
                    <div className="breakLine"/>

                    <div className="account">
                    <label>Need an account? </label>{' '}
                    <Link to={'/login/signUp'}>
                        <label style={{textDecoration: 'underline'}}> Create One</label>
                    </Link>
                    </div>
                </div>
            
            </div>
            <img src={signIn} className="image" alt=""/>
            <ToastContainer/>
        </div>
        </div>
    )
}

export default Login;