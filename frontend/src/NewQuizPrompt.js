import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "./NewQuiz.css";
import "./Login.css";
import { useNavigate } from "react-router-dom";

/*
This is going to be remade completely when we move to the dashboard design.
Refactoring the title of this for now to match this.
*/

const QuizForm = ({ onAddQuiz }) => {
  const [quizTitle, setQuizTitle] = useState("");

  const navigate = useNavigate();

  const handleAddQuiz = async () => {

    const username = localStorage.getItem('username')

    const response = await fetch("http://localhost:5000/api/add_quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: quizTitle, username: username }),
    });

    const data = await response.json();
    console.log(data);

    onAddQuiz({ title: quizTitle, username: username });
    navigate(`/${data['quizID']}/editing`);

  };

  return (
    <div className="nameQuiz form-group">
      <h2 className="nameQuiz" style={{fontSize: '52px'}}> Name Your New Quiz </h2>
      <input
        className="input form-control" style={{ }}
        type="text"
        placeholder="Quiz Title"
        value={quizTitle}
        onChange={(e) => setQuizTitle(e.target.value)}></input>
      <button className="btn btn-primary input" onClick={handleAddQuiz}>Add Quiz</button>
    </div>
  );
};

export default QuizForm;