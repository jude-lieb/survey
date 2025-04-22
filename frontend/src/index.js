import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import QuizDetails from "./QuizDetails";
import Login from "./Login";
import SignUp from "./SignUp";
import ContactUs from "./ContactUs";
import FAQ from "./Faq";
import CreateQuiz from "./CreateQuiz";
import Logout from "./Logout";
import Logs from "./Logs";
import Results from "./Results";
import AdminPanel from "./AdminPanel";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Router>
    <Routes>
      <Route path="" element={<App />} />
      <Route path=":quizID" element={<QuizDetails />} />
      <Route path="login" element={<Login />} />
      <Route path="/login/signUp" element={<SignUp />} />
      <Route path=":quizID/:status" element={<QuizDetails />} />
      <Route path="contactUs" element={<ContactUs />} />
      <Route path="faq" element={<FAQ />} />
      <Route path="createQuiz" element={<CreateQuiz />} />
      <Route path="logout" element={<Logout />} />
      <Route path=":quizID/logs" element={<Logs />} />
      <Route path=":quizID/results" element={<Results />} />
      <Route path="/adminPanel" element={<AdminPanel />} />
    </Routes>
  </Router>

);
