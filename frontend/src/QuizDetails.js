import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";
import { LuTrash } from "react-icons/lu";
import Question from "./Question";
import QuizEditor from "./QuizEditor";
import QuizTaker from "./QuizTaker";
import back from "./images/back.png";
import "./QuizDetails.css";
import { ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const QuizDetails = () => {
  const navigate = useNavigate();
  const { quizID, status } = useParams();

  const [quiz, setQuiz] = useState({
    title: "sampleQuiz",
    id: quizID,
    questions: [],
  });

  // Make sure you are not accessing this in a way you shouldn't be
  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    fetchQuiz();
  }, [quizID]);

  const checkAuth = async () => {
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("roles");
    
    if (username == null && status === "editing") {
      navigate("/login");
      return;
    } else if (
      status === "editing" &&
      username != null &&
      !role.includes("admin")
    ) {
      const response = await fetch("http://localhost:5000/api/get_creator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quizID: quizID, username: username }),
      });

      if (!response) {
        navigate("/login");
      }
    }
  };

  const setQuestions = (newQuestions) => {
    setQuiz({
      title: quiz.title,
      id: quizID,
      questions: newQuestions,
    });
  };

  const mapAnswers = (answers, id) => {
    var newAnswers = [];
    answers.map((ans, index) => {
      if (id + "" === ans.id + "") {
        newAnswers.push({
          answer: ans.answer,
          id: ans.id,
          aid: ans.aid,
          selected: false,
        });
      }
      return ""; //Supresses warning, no functionality
    });
    return newAnswers;
  };

  const mapQuestions = (questions, answers) => {
    const newQuestions = questions.map((question) => {
      return {
        question: question.question,
        id: question.id,
        answers: mapAnswers(answers, question.id),
        type: question.type,
      };
    });
    return newQuestions;
  };

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/quiz/${quizID}`);
      const result = await response.json();
      console.log("Database Result ");
      console.log(result);

      //Distributing answers to respective questions
      const newQuiz = {
        title: result.quiz_title,
        id: result.quiz_id,
        questions: mapQuestions(
          result.questions.slice(0),
          result.answers.slice(0)
        ),
      };

      setQuiz(newQuiz);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  const handleDeleteQuiz = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/del_quiz/${quizID}`,
        {
          method: "DELETE",
        }
      );
      const result = await response.json();
      console.log(result);
      navigate("/"); // This will send the user back to the main page after deletion.
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  const submit = async () => {
    var responseData = [];
    //Saving answer ids of selected answers
    for (var i = 0; i < quiz.questions.length; i++) {
      for (var j = 0; j < quiz.questions[i].answers.length; j++) {
        if (quiz.questions[i].answers[j].selected) {
          responseData.push(quiz.questions[i].answers[j].aid);
        }
      }
    }

    console.log("Selected Answer IDs");
    console.log(responseData);

    try {
      const response = await fetch("http://localhost:5000/api/user_submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ responseData }),
      });
    } catch (error) {
      console.log(error);
    }
  };

  const submitEdits = async () => {
    const questionsData = {
      quiz_id: quizID,
      questions: quiz.questions.map((question) => ({
        text: question.question,
        type: question.type,
        answers: question.answers,
      })),
    };

    console.log("Question Data");
    console.log(questionsData);
    try {
      const response = await fetch("http://localhost:5000/api/submit_edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ questionsData }),
      });

      toast.success("Quiz saved successfully.");

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container fluid" style={{marginRight: '50%'}}>
      <ToastContainer />
      {quiz ? (
        <div className="row">
          <Link to={"/"} className="back flex-align-items-center" style={{height: '60px', width:'300px', marginBottom: '15vh'}}>
                <img src={back} alt="" style={{height: '50px', paddingTop: '8px'}}/> 
                <label className="dashboard" style={{paddingLeft:'1rem'}}> Back to Dashboard</label>
            </Link>

          {status === "taking" && (
            <div className="container fluid d-flex justify-content-center">
              <QuizTaker
              style={{marginTop: '3vh'}}
                submitQuiz={submit}
                setQuestions={setQuestions}
                quiz={quiz}></QuizTaker>
            </div>
          )}

          {status === "editing" && (
            <div className="container-fluid flex-align-items-center" style={{marginLeft: '15%', marginTop: '12vh'}}>
              <div className="row">
                <div className="col-3 border rounded flex-align-items-center" style={{width: '40%', marginInline: 'auto'}}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{fontSize: '34px', maxWidth: '80vw'}}>{quiz.title}</label>
                  <LuTrash onClick={() => handleDeleteQuiz()} size={30} style={{ marginTop:'1%', marginLeft: '1rem',cursor: 'pointer' }}/>
                  </div>
                  <label style={{fontSize:'16px', marginBottom: '1rem'}}>ID: {quizID} </label>


                  <h3>Questions:</h3>
                  <ul className="list-group">
                    {quiz.questions.map((currentQuestion, index) => (
                      <li className="list-group-item flex-align-items-center border-secondary-subtle rounded" key={index} style={{marginBottom: '30px'}}>
                        {
                          <Question
                            title={currentQuestion.question}
                            answers={currentQuestion.answers}
                            id={currentQuestion.id}
                            type={currentQuestion.type}></Question>
                        }
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="col-3" style={{width: '40%'}}>

                  <QuizEditor
                    submitQuiz={submitEdits}
                    questions={quiz.questions}
                    setQuestions={setQuestions}
                    quizID={quizID}></QuizEditor>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default QuizDetails;
