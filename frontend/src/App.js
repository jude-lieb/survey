import { useEffect, useState } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.css";
import userImg from "./images/user.png";
import dashboardIcon from "./images/dashboardIcon.png";
import contactIcon from "./images/contactUs.png";
import faqIcon from "./images/FAQ.png";
import quizIcon from "./images/QuizLab.png";
import searchIcon from "./images/search.png";
import takeQuiz from "./images/takeQuiz.png";
import Modal from "./NewQuizPrompt";
import Fuse from "fuse.js";
import { Link, useNavigate } from "react-router-dom";

function App() {
  const [quizzes, setQuizzes] = useState([]);
  const [name, setName] = useState("User");
  const [user, setUser] = useState();
  const [isSignedIn, setIsSignedIn] = useState();
  const [showModal, setShowModal] = useState(false);
  const [quizList, setQuizList] = useState();

  const fuse = new Fuse(quizzes, { keys: ["title"] });
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
    renderName();
  }, []);
  
  const fetchQuizzes = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/quizzes");
      const result = await response.json();
      console.log("quizzes");
      console.log(result);
      setQuizzes(result);
      setQuizList(result);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  const renderName = async () => {
    // useState only applies whenever it feels like it, not immediately. We can either force it to override, or just use another variable for this function to work.
    setUser(localStorage.getItem("username"));
    const username = localStorage.getItem("username");

    if (username == null) {
      setName(`User`);
      return;
    } else {
      try {
        const response = await fetch("http://localhost:5000/api/get_auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: username }),
        });

        if (response.ok) {
          const response = await fetch("http://localhost:5000/api/get_name", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username }),
          });

          const nameData = await response.json();
          setName(`${nameData.message}`);
          setIsSignedIn(true);
        } else {
          setName("User");
        }
      } catch (error) {
        console.log(error);
        setName("User");
        setUser(null);
      }
    }
  };

  const onSearch = (event) => {
    if (event.target.value === "") {
      setQuizList(quizzes);
    } else {
      setQuizList(fuse.search(event.target.value).map((a) => a.item));
    }
  };

  const handleSignOut = async () => {
    const username = localStorage.getItem("username");

    try {
      const response = await fetch("http://localhost:5000/api/sign_out", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      if (response.ok) {
        localStorage.removeItem("username");
        localStorage.removeItem("roles");
        setName(null);
        setIsSignedIn(false);
        setUser(null);
        navigate("/logout");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className="container-fluid"
      style={{ paddingTop: "50px", paddingLeft: "150px" }}>
      <div className="row">
        {/* Menu Panel */}
        <div className="col-sm-2 border rounded shadow p-3 custom-height">
          <div
            className="d-flex align-items-center"
            style={{ paddingTop: "20px" }}>
            <img
              src={userImg}
              alt="UserImage"
              height={40}
              width={50}
              style={{ paddingLeft: "10px" }}
            />
            <h2 className="mb-0" style={{ paddingLeft: "10px" }}>
              {name}
            </h2>
          </div>
          <br />
          <label
            style={{ paddingLeft: "10px", paddingTop: "10px", color: "gray" }}>
            Menu
          </label>

          <ul className="nav flex-column" style={{ paddingTop: "40px" }}>
            <li className="nav-item">
              <Link to={""} className="link-active">
                <img
                  src={dashboardIcon}
                  style={{ marginRight: "20px" }}
                  alt="Dashboard"
                />{" "}
                Dashboard
              </Link>
            </li>

            {/* <li className="nav-item" style={{ paddingTop: "20px" }}>
              <Link to={"contactUs"} className="link">
                <img
                  src={contactIcon}
                  style={{ marginRight: "20px" }}
                  alt="Contact Us"
                />{" "}
                Contact Us
              </Link>
            </li>
            <li className="nav-item" style={{ paddingTop: "20px" }}>
              <Link to={"faq"} className="link">
                <img src={faqIcon} style={{ marginRight: "20px" }} alt="FAQ" />{" "}
                FAQ
              </Link>
            </li> */}

            {isSignedIn && (
              <li className="nav-item" style={{ paddingTop: "20px" }}>
                <Link to={"createQuiz"} className="link">
                  <img
                    src={quizIcon}
                    style={{ marginRight: "20px" }}
                    alt="Create/Edit Quiz"
                  />{" "}
                  Create Quiz
                </Link>
              </li>
          )}
            {isSignedIn && localStorage.getItem("roles").includes("admin") && (
              <li className="nav-item" style={{ paddingTop: "20px" }}>
                <Link to={"/adminPanel"} className="link">
                  Admin Panel
                </Link>
              </li>
            )}
          </ul>

          

          {isSignedIn ? (
            <button
              className="btn btn-primary signIn"
              onClick={() => handleSignOut()}>
              Sign Out
            </button>
          ) : (
            <Link to={"login"}>
              <button className="btn btn-primary signIn">
                Sign In or Create Account
              </button>
            </Link>
          )}
        </div>

        <div className="col-sm-9" style={{ paddingLeft: "50px" }}>
          <div
            className="row border rounded shadow p-3 flex-align-items-center d-flex"
            style={{ height: "75px" }}>
            <img
              className="flex-item"
              src={searchIcon}
              alt="SearchIcon"
              style={{ height: "70px", width: "70px", paddingBottom: "28px" }}
            />

            <div className="col">
              <input
                className="form-control"
                type="text"
                placeholder="Search Quizzes"
                onChange={(e) => onSearch(e)}
              />
            </div>
          </div>

          <div className="row">
            <label className="overview" style={{ marginBottom: "12px" }}>
              Overview
            </label>
          </div>

          <div className="row border rounded shadow flex-align-items-center quiz">
            <ul className="list-group ">
              {quizList !== undefined &&
                quizList.map((quiz, index) => (
                  <Link to={"../" + quiz.id + "/taking"}>
                    <li
                      className="list-group-item d-flex flex-align-items-center  border-secondary-subtle rounded"
                      style={{ marginBottom: "30px", height: "80px" }}
                      key={index}>
                      <div>
                        <label className="quizName">{quiz.title}</label>
                      </div>
                      <div>
                        <label className="quizDetails ">
                          Questions: {quiz.num_questions} | ID: {quiz.id} |
                          Creator: {quiz.name}
                        </label>
                      </div>
                      {isSignedIn &&
                        (user === quiz.username ||
                          localStorage.getItem("roles").includes("admin")) && (
                          <Link to={"../" + quiz.id + "/editing"}>
                            <button className="btn btn-primary edit">
                              Edit Quiz
                            </button>
                          </Link>
                        )}

                      {isSignedIn &&
                        (user === quiz.username ||
                          localStorage.getItem("roles").includes("admin")) && (
                          <Link to={"../" + quiz.id + "/results"}>
                            <button className="btn btn-primary viewResults">
                              View Results
                            </button>
                          </Link>
                        )}

                      {isSignedIn &&
                        localStorage.getItem("roles").includes("admin") && (
                          <Link to={"../" + quiz.id + "/logs"}>
                            <button className="btn btn-primary logs">
                              View Logs
                            </button>
                          </Link>
                        )}

                      <img
                        src={takeQuiz}
                        className="takeQuiz"
                        alt="Take Quiz"
                      />
                    </li>
                  </Link>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
