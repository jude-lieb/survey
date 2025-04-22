import {React, useEffect} from "react";
import {useNavigate} from "react-router-dom"
import { LuTrash } from "react-icons/lu";

const QuizEditor = ({ questions, setQuestions, quizID, submitQuiz }) => {
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        type: true,
        id: quizID,
        answers: [],
      },
    ]);
  };

  // Swaps from radios to checkboxes and back
  const handleTypeChange = (i) => {
    console.log(questions);
    const newQuestions = questions.map((question, index) => {
      if (i === index) {
        return {
          question: question.question,
          type: !question.type,
          id: question.id,
          answers: question.answers,
        };
      } else {
        return question;
      }
    });
    setQuestions(newQuestions);
  };

  //Helper function for answer adding process
  const mapAnswers = (answers, e, ansIndex) => {
    const newAnswers = answers.map((ans, index) => {
      if (ansIndex === index) {
        return { answer: e.target.value, id: ans.id, selected: false };
      } else {
        return ans;
      }
    });
    return newAnswers;
  };

  const handleAddAnswer = (i) => {
    const newQuestions = questions.map((question, index) => {
      if (i === index) {
        return {
          question: question.question,
          type: question.type,
          id: question.id,
          answers: [
            ...question.answers,
            { answer: "", id: question.id, selected: false },
          ],
        };
      } else {
        return question;
      }
    });
    setQuestions(newQuestions);
  };

  const handleAnswerChange = (e, i, aI) => {
    const newQuestions = questions.map((question, index) => {
      if (i === index) {
        return {
          question: question.question,
          type: question.type,
          id: question.id,
          answers: mapAnswers(question.answers, e, aI),
        };
      } else {
        return question;
      }
    });
    setQuestions(newQuestions);
  };

  const handleQuestionChange = (e, i) => {
    const newQuestions = questions.map((question, index) => {
      if (i === index) {
        return {
          question: e.target.value,
          type: question.type,
          id: question.id,
          answers: question.answers,
        };
      } else {
        return question;
      }
    });
    setQuestions(newQuestions);
  };

  const handleDeleteQuestion = (index) => {
    setQuestions([...questions.slice(0, index), ...questions.slice(index + 1)]);
  };

  const handleDeleteAnswer = (questionIndex, answerIndex) => {
    const newQuestions = questions.map((question, index) => {
      if (questionIndex === index) {
        return {
          question: question.question,
          type: question.type,
          id: question.id,
          answers: [
            ...question.answers.slice(0, answerIndex),
            ...question.answers.slice(answerIndex + 1),
          ],
        };
      } else {
        return question;
      }
    });
    setQuestions(newQuestions);
  };

  return (
    <div className="border rounded">
      <ol className="list-group">
        {questions.map((currentQuestion, index) => (
          <li className="list-group-item" key={index} style={{width: '85%', marginRight: 'auto', marginLeft: 'auto', marginTop: '3vh', marginBottom: '3vh'}}>
            <div>
              <div className="form-group">
                <input
                  value={currentQuestion.question}
                  onChange={(e) => handleQuestionChange(e, index)}
                  type="email"
                  className="form-control"
                  id={"sampleid" + index}
                  aria-describedby="emailHelp"
                  placeholder="Question Prompt"
                />
              </div>

              <div className="form-group">
                <ol>
                  {currentQuestion.answers.map((answer, ansIndex) => (
                    <li key={ansIndex}>
                      <div className="row" style={{marginBottom: '2vh'}}>
                        <div className="col-auto">
                          <input
                            onChange={(e) =>
                              handleAnswerChange(e, index, ansIndex)
                            }
                            value={answer.answer}
                            type="text"
                            className="form-control"
                            id={"sampleId" + ansIndex}
                            placeholder={"Option " + ansIndex}
                          />
                        </div>
                        <div className="col-3">
                          <LuTrash
                            onClick={() => handleDeleteAnswer(index, ansIndex)}
                            type="btn btn-primary"
                            className="mt-2">
                          </LuTrash>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
                <button
                  className="btn btn-primary" style={{marginLeft: '4px',  backgroundColor: 'white', color:  'black', borderColor: 'black'}}
                  onClick={() => handleAddAnswer(index)}>
                  New Answer
                </button>
                <button
                  className="btn btn-primary " style={{marginLeft: '3px',  backgroundColor: 'white', color:  'black', borderColor: 'black'}}
                  onClick={() => handleTypeChange(index)}>
                  Change Type
                </button>
                <button
                  className="btn btn-primary" style={{marginLeft: '3px',  backgroundColor: 'white', color:  'black', borderColor: 'black'}}
                  onClick={() => handleDeleteQuestion(index)}>
                  Delete Question
                </button>
              
              </div>
          </li>
        ))}
      </ol>

      <button className="btn btn-primary" style={{marginBottom:'2rem',marginLeft: '6rem', backgroundColor: 'white', color:  'black', borderColor: 'black'}} onClick={submitQuiz}>
        Save Quiz
      </button>
      <button className="btn btn-primary"  style={{marginBottom:'2rem',marginLeft: '6rem', backgroundColor: 'white', color:  'black', borderColor: 'black'}} onClick={handleAddQuestion}>
        New Question
      </button>
    </div>
  );
};

export default QuizEditor;
