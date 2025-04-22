import "bootstrap/dist/css/bootstrap.css";
import Question from "./Question";

const QuizTaker = ({ quiz, setQuestions, submitQuiz }) => {
  //Saves selections of user to quiz
  //Position is the index of the clicked answer within its question.
  //qIndex is the index of the question clicked within the quiz.
  const handleChecks = (event, position, qIndex) => {
    const newQuestions = quiz.questions.map((question, questionIndex) => {
      return {
        question: question.question,
        type: question.type,
        id: question.id,
        answers: question.answers.map((answer, index) => {
          if (questionIndex === qIndex) {
            if (index === position) {
              return {
                answer: answer.answer,
                id: answer.id,
                aid: answer.aid,
                selected: event.target.checked,
              };
            } else {
              if (question.type === true) {
                return {
                  answer: answer.answer,
                  id: answer.id,
                  aid: answer.aid,
                  selected: false,
                };
              } else {
                return answer;
              }
            }
          } else {
            return answer;
          }
        }),
      };
    });
    setQuestions(newQuestions);
  };

  return (
    <div>
      {quiz ? (
        <div>
          <div className="row" style={{minWidth: '80%', maxWidth: '100%'}}>
            <div className="col-3" style={{minWidth: '80%',maxWidth: '100%'}}>
              <ol className="list-group">
                {quiz.questions.map((question, index) => (
                  <li
                    key={index}
                    className="list-group-item d-flex justify-content-between border rounded" style={{minWidth: '40vw', maxWidth: '100vw', marginTop: '2vh'}}>
                    <Question
                      qIndex={index}
                      handleChecks={handleChecks}
                      answers={question.answers}
                      type={question.type}
                      title={question.question}
                      id={question.id}></Question>
                  </li>
                ))}
              </ol>
              <div className="d-flex justify-content-center" style={{marginLeft:'10rem', marginTop: '2vh'}}>
                <button className="btn btn-primary d-flex justify-content-center" onClick={submitQuiz} style={{minWidth: '15rem', backgroundColor: 'white', color:  'black', borderColor: 'black'}}>
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default QuizTaker;
