# Web_System_1.0_Spring_2024

A simple project built using React, Flask, and SQLite.
Made by Chintan Patel, Diana Karim, Jude Lieb, and Grace Lueking.

<h1> HOW TO SET UP THE PROJECT </h1>

(Frontend)

1. Install Node.js, and with it, npm. Make sure to restart your PC afterwards.

2. In VSCode, clone the repository. You can do this by going to Source Control -> Clone Repository.

3. Once you've cloned it from the repository, you no longer need to clone it. You can perform pull/push requests from Source Control.

4. You can run the program using npm start. 

(Backend)

1. Do `pip install flask flask-cors` in your terminal.

2. You can start the project by right clicking app.py and pressing 'Run Python File in Terminal'

3. Make sure both files are running to use the program. It's helpful to have a bash terminal and a Python terminal running at the same time.

4. To commit changes to table structure, use these three commands:
    `python -m flask db init`
    `python -m flask db migrate -m "Your migration message"`
    `python -m flask db upgrade`
    This implies you have Flask-Migrate installed.