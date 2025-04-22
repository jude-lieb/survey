from flask import Flask, jsonify, request, render_template, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import datetime, timedelta
from flask_bcrypt import Bcrypt
from flask_session import Session

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SECRET_KEY'] = 'secret'
db = SQLAlchemy(app)
app.config['SESSION_TYPE'] = 'sqlalchemy'
app.config['SESSION_SQLALCHEMY'] = db
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=30)
migrate = Migrate(app, db)
CORS(app)
bcrypt = Bcrypt(app)
Session(app)

class Quiz(db.Model):
    id = db.Column(db.Integer, primary_key=True) # Primary Key
    title = db.Column(db.String(100), nullable=False) # Title of the quiz.
    questions = db.relationship('Question', backref='quiz', lazy=True) # Links to the table question.
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id')) # TODO: This should not be nullable. Change this when we add support for users.
    creator = db.relationship('User', back_populates="quizzes", lazy=True) # Links to the user who created this quiz.

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True) # Primary Key
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False) # Links to the parent Quiz.
    question = db.Column(db.String(200), nullable=False) # The text content of the question.
    type = db.Column(db.Boolean, nullable=False, default=True) # This dictates if it's a radio button or checkbox. Primarily used for front-end purposes.
    answers = db.relationship('Answer', backref='question', lazy=True, cascade='all, delete-orphan') # Links a many-to-many relation to answers.
    
class Answer(db.Model):
    id = db.Column(db.Integer, primary_key=True) # Primary Key
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False) # The foreign key that links the answer to the question.
    answer = db.Column(db.String(200), nullable=False) # The text content of the answer.
    is_correct = db.Column(db.Boolean, default=False) # This may not be necessary depending on our requirements and scope.
    chosen = db.Column(db.Integer, default=0) # How many times this answer has been selected.

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=False)
    roles = db.relationship('Role', backref='user')
    quizzes = db.relationship('Quiz', back_populates="creator")

class Role(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False) # Name of the role.
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False) # The ID of the user the role is tied to.

class Log(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
    content = db.Column(db.String)
    updated = db.Column(db.DateTime, default=datetime.now()) # TODO: Verify this actually works and not load every value with an old time

# Receive all quizzes by their title and ID.
@app.route('/api/quizzes', methods=['GET'])
def get_quizzes():
    quizzes = Quiz.query.all()
    quizzes_json = []

    for quiz in quizzes:
        # Count the number of questions for each quiz
        num_questions = Question.query.filter_by(quiz_id=quiz.id).count()
        user = User.query.filter_by(id=quiz.creator_id).first()

        # Create JSON representation for each quiz including the number of questions
        quiz_json = {
            "id": quiz.id,
            "title": quiz.title,
            "num_questions": num_questions,
            "username": user.username,
            "name": user.first_name + " " + user.last_name
        }

        quizzes_json.append(quiz_json)

    return jsonify(quizzes_json)

# Get a list of all questions this quiz has. This also returns all Answers that share that Question ID.
@app.route('/api/quiz/<int:quiz_id>')
def quiz_details(quiz_id):
    
    questions = Question.query.filter_by(quiz_id=quiz_id).all()

    question_ids = [question.id for question in questions]
    
    answers = Answer.query.filter(Answer.question_id.in_(question_ids)).all()
    
    serialized_questions = [{'question': question.question, 'id': question.id, 'type': question.type} for question in questions]
    serialized_answers = [{'answer': answer.answer, 'id': answer.question_id, 'aid': answer.id} for answer in answers]

    quiz = Quiz.query.filter_by(id=quiz_id).first()

    return jsonify({'quiz_id': quiz_id, 'quiz_title': quiz.title, 'questions': serialized_questions, 'answers': serialized_answers})

# Delete a quiz and all of its components based on an ID.
# TODO: Logging (with its current schema) doesn't really work with deleted quizzes. Perhaps there can be a centralized place for this?
@app.route('/api/del_quiz/<int:quiz_id>', methods=['DELETE'])
def del_quiz(quiz_id):

    quiz = Quiz.query.get(quiz_id)
    if quiz:
        cascade_delete(quiz_id)
        db.session.delete(quiz)
        db.session.commit()
        return jsonify({"message": f"Quiz {quiz_id} deleted successfully."})
    else:
        return jsonify({"message": f"Quiz {quiz_id} not found."})
    
# Adds a quiz's title to the database.
# The flow of the program should always have this query come first. Afterwards, we can add questions.
@app.route('/api/add_quiz', methods=['POST'])
def add_quiz():

    data = request.json
    user = User.query.filter_by(username=data['username']).first()

    new_quiz = Quiz(title=data['title'], creator_id=user.id)

    db.session.add(new_quiz)
    db.session.commit()

    create_log(id=new_quiz.id, message=f"Quiz {data['title']} (ID: {new_quiz.id}) has been created on {datetime.now()}.")

    return jsonify({"message": "Quiz added successfully", "quizID": new_quiz.id})

# When a user submits an edit of the quiz they are creating, this is called.
# We override all old questions and answers with new ones.
@app.route('/api/submit_edit', methods=['POST'])
def submit_edit():
    
    data = request.json
    down_layer_data = data.get('questionsData', {}).get('questions', []) # Data is returning the whole package, so we need to go down a layer in JSON to be in the correct scope.
    quiz_id = int(data.get('questionsData', {}).get('quiz_id'))

    # When a quiz is done being edited, we delete every old question and answer, and replace it with the new data we've received.
    # This implies that all results stored will be deleted as well.
    cascade_delete(quiz_id)
    num_questions = 0

    for question_data in down_layer_data:

        q = Question(question=question_data['text'], quiz_id=quiz_id, type=question_data['type'])
        db.session.add(q)
        db.session.commit()

        for answer_text in question_data['answers']:

            a = Answer(answer=answer_text['answer'], question_id=q.id)
            db.session.add(a)
        
        num_questions += 1

    db.session.commit()

    # TODO: make this log more detailed?
    create_log(id=quiz_id, message=f"Quiz ID: {quiz_id} has been edited on {datetime.now()}. There are now {num_questions} question(s).")

    return jsonify({"message": "Questions + Answers submitted successfully"})

# When a user submits a quiz they were taking, we record their answers.
# We can use these answers to provide graphs of the responses for the quiz owner and admins.
@app.route('/api/user_submit', methods=['POST'])
def user_submit():

    data = request.json

    for answer_id in data.get('responseData'):
        answer = Answer.query.filter_by(id=answer_id).first()
        answer.chosen += 1
    
    db.session.commit()

    return jsonify({"message": "Quiz responses recorded successfully"})

@app.route('/api/get_count', methods=['POST'])
def get_count():

    data = request.json

    questions = Question.query.filter_by(quiz_id=data['quizID']).all()

    quiz_answer_counts = []

    for question in questions:

        question_text = question.question

        answers = question.answers

        answer_counts = {}

        for answer in answers:
            answer_counts[answer.answer] = answer.chosen
        
        quiz_answer_counts.append({
            'question': question_text,
            'answers': answer_counts
        })
    
    return jsonify(quiz_answer_counts)

# Returns a true or false depending on whether or not a user created this quiz or not.
@app.route('/api/get_creator', methods=['POST'])
def get_creator():
    data = request.json
    quiz_id = data['quizID']
    user = data['username']

    quiz = Quiz.query.filter_by(id=quiz_id).first()
    creator_id = User.query.filter_by(username=user).first().id

    return jsonify({"message": quiz.creator_id == creator_id})

# Main sign in query. Checks the hash of the password provided to verify if this password is correct or not.
@app.route('/api/sign_in', methods=['POST'])
def sign_in():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()

    if user == None:
        return jsonify({"return": False})
    
    is_valid = bcrypt.check_password_hash(user.password, data['password'])
    
    if is_valid:
        session['username'] = data['username']

    roles_data = [role.name for role in user.roles]

    return jsonify({"return": is_valid, "roles": roles_data})

# Pops the session info from the list when a user signs out.
@app.route('/api/sign_out', methods=['POST'])
def sign_out():
    data = request.json
    session.pop(data['username'], None)
    
    return jsonify({"message": "Successfully signed out."})

# We can use this to check if a user is actually signed in or not.
# TODO: Check if this actually works
@app.route('/api/get_auth', methods=['POST'])
def get_auth():
    data = request.json

    if data['username'] in session:
        return jsonify({'authenticated': True, 'username': session[data['username']]})
    
    else:
        return jsonify({'authenticated': False})

# Gets the first and last name of the user.
# We shouldn't have to catch errors because this is called immediately after we're sure the username exists.
@app.route('/api/get_name', methods=['GET', 'POST'])
def get_name():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()

    if user != None:
        return jsonify({"message": f"{user.first_name} {user.last_name}"})
    
    return jsonify({"message": f"Not Signed In"})

# Adds a new user to the database
# Stores first name, last name, username, and password. 
# Uses bcrypt to hash passwords.
@app.route('/api/sign_up', methods=['POST'])
def sign_up():
    data = request.json
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(username=data['username'], password=hashed_password, first_name=data['firstName'], last_name=data['lastName'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User added successfully"})

# Deletes a user and all quizzes and roles associated with the user.
@app.route('/api/delete_user', methods=['DELETE'])
def delete_user():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()

    if user:
        quizzes = Quiz.query.filter_by(creator_id=user.id).all()

        for quiz in quizzes:
            cascade_delete(quiz.id)
            db.session.delete(quiz)
        
        roles = Role.query.filter_by(user_id=user.id).all()

        for role in roles:
            db.session.delete(role)

        db.session.delete(user)

        session.pop(user.username, None)
        
        db.session.commit()

        return jsonify({"response": True})

    return jsonify({"response": False})

# Assigns a user a role you create, can be any role, it's just a string name.
@app.route('/api/add_role', methods=['POST'])
def add_role():

    data = request.json
    user = User.query.filter_by(username=data['username']).first()
    role_name = data['role']
    
    role = Role.query.filter_by(user_id=user.id).first()

    if role:
        return jsonify({'message': f'User already has the role: {role_name}'}), 200

    role = Role(name=role_name, user_id=user.id)

    db.session.add(role)
    user.roles.append(role)

    db.session.commit()

    return jsonify({'message': f'Role {role_name} assigned to user {user.username}'}), 200

@app.route('/api/get_logs', methods=['POST'])
def get_logs():

    data = request.json
    
    logs = Log.query.filter_by(quiz_id=data['quizID']).all()
    logs_json = [log.content for log in logs]

    print(logs_json)
    return jsonify(logs_json)

# This function is used for verifying the state of our database.
# Use this externally in Postman or another API website.
# Or, we could make this hooked into the website later on.
@app.route('/api/database_state', methods=['GET'])
def get_database_state():

    try:
        all_entries = {}

        # Iterate over each table model
        for table_name in db.metadata.tables.keys():
            # Get the table class dynamically
            table_class = globals()[table_name]

            # Query all entries for the current table
            table_entries = table_class.query.all()

            # Convert each entry to a dictionary representation
            all_entries[table_name] = [entry.__dict__ for entry in table_entries]

        return all_entries, 200
    
    except Exception as e:
        return {"error": str(e)}, 500

# This is used for testing purposes only.
# This is a mass delete. It will delete every single entry in the database.
# Use externally only, and only if you know what you're doing.
@app.route('/api/purge', methods=['DELETE'])
def database_purge():

    try:
        # Iterate over all tables in the database schema
        for table in reversed(db.metadata.sorted_tables):
            # Delete all records from the current table
            db.session.execute(table.delete())
        
        db.session.commit()
        return jsonify({'message': 'All records deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    
# Helper function used for deleting quizzes or overriding old values in an edit.
# This does *not* commit anything. Your calling function must commit.
def cascade_delete(quiz_id):
    
    questions_to_delete = Question.query.filter_by(quiz_id=quiz_id).all()
    answers_to_delete = Answer.query.filter(Answer.question_id.in_([question.id for question in questions_to_delete])).all()
    
    for question in questions_to_delete:
        db.session.delete(question)
    for answer in answers_to_delete:
        db.session.delete(answer)

# Helper function that creates logs based on the message and quiz you tie it to.
def create_log(id, message):
    log = Log(quiz_id=id, content=message, updated=datetime.now())
    db.session.add(log)
    db.session.commit()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
