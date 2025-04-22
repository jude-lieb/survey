import React from "react";
import "bootstrap/dist/css/bootstrap.css";

const question = ({ title, answers, type, id, qIndex, handleChecks }) => {
  return (
    <div>
      <p>{title}</p>
      <div>
        {answers.map((answer, index) => (
          <div key={index}>
            {type === true && (
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name={"radio_" + title}
                  id={id + "" + index}
                  onClick={(e) => handleChecks(e, index, qIndex)}
                />
                <label className="form-check-label" htmlFor={id + "" + index}>
                  {answer.answer}
                </label>
              </div>
            )}

            {type === false && (
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name={"radio_" + title}
                  id={id + "" + index}
                  onClick={(e) => handleChecks(e, index, qIndex)}
                />
                <label className="form-check-label" htmlFor={id + "" + index}>
                  {answer.answer}
                </label>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default question;
