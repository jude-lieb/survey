import { React, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChartComponent from "./ChartComponent";

const Results = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState();

  useEffect(() => {
    checkAuth();
    getResults();
  }, []);

  const { quizID } = useParams();

  const checkAuth = async () => {
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("roles");

    if (username === null) {
      navigate("/login");
      return;
    } else if (username !== null && !role.includes("admin")) {
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

  const getResults = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/get_count", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quizID: quizID }),
      });

      const result = await response.json();
      console.log(result);
      setResults(result);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h1>Quiz Answer Distribution</h1>
      {results &&
        results.map((result, index) => (
          <li>
            {
              <ChartComponent
                key={index}
                question={result.question}
                answers={result.answers}
              />
            }
          </li>
        ))}
    </div>
  );
};


export default Results;
