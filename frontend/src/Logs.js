import { React, useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom";

const Logs = () => {

    const navigate = useNavigate();
    const {quizID} = useParams();
    const [logs, setLogs] = useState();

    useEffect(() => {
        checkAuth();
        getLogs();
    }, [])

    // Only admins should be able to view this page.
    const checkAuth = () => {
        const role = localStorage.getItem('roles');

        if(!role.includes("admin")){
            navigate("/login");
        }
    }

    const getLogs = async () => {

        try{
            const response = await fetch("http://localhost:5000/api/get_logs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 'quizID': quizID })
            });

            const log_received = await response.json();
            setLogs(log_received);
        }

        catch(error){
            console.log(error);
        }
    }


    return(
        <div>
            <h2>Logs:</h2>
            {logs && logs.length > 0 ? (
                <ul>
                    {logs.map((log, index) => (
                        <li key={index}>{log}</li>
                    ))}
                </ul>
            ) : (
                <p>No logs available</p>
            )}

            <br></br>
            <Link to="/">Exit to quiz list</Link>
        </div>
    );
};

export default Logs;
