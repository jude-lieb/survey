import React from "react";
import { Link } from "react-router-dom";
import './NewQuiz.css';
import './Login.css';
const Logout = () => {
  return (
    <div>
      <label className="nameQuiz mr-1" style={{paddingLeft: '40%', marginTop: '23%'}}>You have been signed out. </label>
      <Link to={"/"}>
        <button className="btn btn-primary">Go to Dashboard</button>
      </Link>
    </div>
  );
};

export default Logout;
