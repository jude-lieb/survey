import { useEffect, useState } from "react";
import QuizForm from "./NewQuizPrompt";
import { Link } from "react-router-dom";

const  CreateQuiz = () => {
    const [quizzes, setQuizzes] = useState([]);

    useEffect(() => {
        fetchQuizzes();
    }, []);
    
    const fetchQuizzes = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/quizzes");
            const result = await response.json();
            setQuizzes(result);
        } catch (error) {
            console.error("Error fetching data: ", error);
        }
    };
    const handleAddQuiz = (newQuiz) => {
        setQuizzes([...quizzes, newQuiz]);
        fetchQuizzes();
      };

    return(
    <div>
      <QuizForm onAddQuiz={handleAddQuiz} />
    </div>
    )
}

export default CreateQuiz;