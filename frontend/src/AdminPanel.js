import { React, useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminPanel = () => {

    const navigate = useNavigate();

    const [userField, setUserField] = useState();
    const [userRoleField, setUserRoleField] = useState();
    const [roleField, setRoleField] = useState();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const username = localStorage.getItem('username')
        const role = localStorage.getItem('roles')
        
        if(username === null){
          navigate("/login");
        }

        else if(!role.includes("admin")){
            navigate("/");
        }
    }

    /*
    While this hasn't been tested, there may be a problem with this method if the user being deleted is still signed in.
    The cookie needs to be removed from the user's client side in order for changes to take place.
    GetAuth *should* take care of this, as the session is popped in the backend.
    */
    const handleDeleteUser = async () => {
        try{
            const response = await fetch("http://localhost:5000/api/delete_user", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ "username": userField })
            })
            
            const reply = await response.json();
            if(reply['response'] === true){
                toast.success(`User ${userField} has been successfully deleted.`)
            }
            else{
                toast.error(`That didn't work as expected.`)
            }
        }
        catch(error){
            console.log(error)
            toast.error(`That didn't work as expected.`)
        }
    }

    const handleAddRole = async () => {
        try{
            const response = await fetch("http://localhost:5000/api/add_role", {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({ "username": userRoleField, "role": roleField }),
            })

            if(response.ok){
                toast.success(`User ${userRoleField} has received the role ${roleField}!`)
            }
        }

        catch(error){
            console.log(error)
            toast.error(`That didn't work as expected.`)
        }
    }

    return(
        <div>
            <Link to="/">Exit to dashboard</Link>

            <h2>Delete a User</h2>
            <input
                type="text"
                placeholder="Username"
                value={userField}
                onChange={(e) => setUserField(e.target.value)}>
            </input>
            <button onClick={handleDeleteUser}>Delete User</button>

            <br></br>

            <h2>Add a Role</h2>
            <input
                type="text"
                placeholder="Username"
                value={userRoleField}
                onChange={(e) => setUserRoleField(e.target.value)}>
            </input>
            <input
                type="text"
                placeholder="Role"
                value={roleField}
                onChange={(e) => setRoleField(e.target.value)}>
            </input>
            <button onClick={handleAddRole}>Add Role to User</button>


            <ToastContainer />
        </div>
    );

}

export default AdminPanel;