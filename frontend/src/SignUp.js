import React, { useState} from "react";
import { ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {Link, useNavigate } from "react-router-dom";
import './SignUp.css';

const SignUp = () => {

    const[username, setUsername] = useState("");
    const[password, setPassword] = useState("");
    const[firstName, setFirstName]  = useState("");
    const[lastName, setLastName]  = useState("");
    const navigate = useNavigate();

    const handleSignUp = async() => {

        const userData = {
            'username':username,
            'password':password,
            'firstName':firstName,
            'lastName':lastName
        };

        const response = await fetch("http://localhost:5000/api/sign_up", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        });

        toast.success("Thanks for signing up");
        setTimeout(() => {
            navigate("/login");
        }, 1500);
    }

    return(
        <div className="container-fluid center">
            <ToastContainer />
             <div className="form-group" style={{ width: 500, height: 130 }}>
                 <h1>Sign Up</h1>
                 <input
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    className="form-control input"
                    type="text"
                    required
                />
                <input
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    className="form-control input"
                    type="text"
                    required
                />
                <input
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className="form-control input"
                    type="email"
                    required
                />

                <input
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="form-control input"
                    type="password"
                    required
                />
                <button className="btn btn-primary" style={{width: 500, height: 50, marginTop: 10}} onClick={() => handleSignUp()}>
                    Create Account
                </button>

                {/* Back to Sign in */}
                <Link to="/login">
                    <label className="goBack">Go Back to Sign In</label>
                </Link>
            </div>
        </div>
    )
}

export default SignUp;