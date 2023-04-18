import React, { useContext, useState, useEffect } from 'react';
import AuthContext from "../context/AuthContext";
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import 'font-awesome/css/font-awesome.min.css';
// import Loader from './loader';


const Home = () => {
    const { user,logoutUser,setUser,setAuthTokens} = useContext(AuthContext);
    const [showEditName,setShowEditName] = useState(false)
    const [showEditPass,setShowEditPass] = useState(false)
    const [response,setResponse] = useState('')
    const navigate = useNavigate();
    const cookie = localStorage.getItem('authTokens')
    console.log(cookie)
    const handleSubmitEditName = async (e) => {
        e.preventDefault();
        const name = e.target.editname.value;
        await axios.post(`http://localhost:55356/editname/${user.id}`,{'name':name,'token':cookie}).then(res=>{
            setShowEditName(false)
            setResponse(res.data.message)
            setAuthTokens(res.data.token)
            localStorage.setItem("authTokens", JSON.stringify(res.data.token));
            setUser(jwt_decode(res.data.token))
            setTimeout(()=>{
                setResponse('')
            },5000)
        }).catch(err=>console.log(err))
    }

    const handleSubmitEditPass = async(e) => {
        e.preventDefault();
        const pass = e.target.editpass.value;
        await axios.post(`http://localhost:55356/editpassword/${user.id}`,{'password':pass,'token':cookie}).then(res=>{
            setShowEditPass(false)
            setResponse(res.data)
            setTimeout(()=>{
                setResponse('')
            },5000)
        })
    }

    const [resMsg,setResMsg] = useState();
    const [emp,setEmp] = useState([]);
    const [showEmployees,setShowEmployees] = useState(false);
    const [showCreateRoot,setShowCreateRoot] = useState(false);


    const fetchEmployees = ()=>{
        axios.get(`http://localhost:55356/admin/${cookie}`).then((res)=>{
            if (res.data.message === 'successful') setEmp(res.data.res)
            else {
                setResMsg(res.data.message);
                setTimeout(()=>{setResMsg('')},5000);
            }
        })
    }

    const deleteEmployee = id => {
        axios.post(`http://localhost:55356/delete/${id}`,{'token':cookie}).then((res)=>{
            setResponse(res.data)
            setTimeout(()=>setResponse(''),5000)
        });
        fetchEmployees();
    }

    const handleCreateRoot = (e) => {
        e.preventDefault();
        const name = e.target.name.value;
        const password = e.target.password.value;
        const email = e.target.email.value;
        const mobile = e.target.mobile.value;
        axios.post(`http://localhost:55356/create-superuser`,{'name':name,'password':password,'mobile':mobile,'email':email,'token':cookie}).then(res=>{
            setShowCreateRoot(false)
            setResponse(res.data)
            setTimeout(()=>setResponse(''),5000)
        });
    }
    
    return (
        <>
            <div class="header">
                <p onClick={()=>{setShowEditName(!showEditName);setShowEditPass(false);setShowEmployees(false);setShowCreateRoot(false)}}>Edit Name</p>
                <p onClick={()=>{setShowEditPass(!showEditPass);setShowEditName(false);setShowEmployees(false);setShowCreateRoot(false)}}>Edit Password</p>
                {user.admin===1 ? <p onClick={()=>{fetchEmployees();setShowEditName(false);setShowEditPass(false);setShowEmployees(!showEmployees);setShowCreateRoot(false)}}>View all Employees</p>:null}
                {user.admin===1 ? <p onClick={()=>{setShowEditName(false);setShowEditPass(false);setShowEmployees(false);setShowCreateRoot(!showCreateRoot)}}>Create Root User</p>:null}
                <p onClick={logoutUser}>Logout</p>
            </div>
            <div className='container'>
                <h1>Welcome {user.name}</h1>
                {response!==''?<p>{response}</p>:null}
                {resMsg !== ''? <p>{resMsg}</p>:null}
                {showEditName?<form onSubmit={handleSubmitEditName} style={{width:'100%'}}>
                    <input type="text" name="editname" id="editname" placeholder='Enter New Name'/><br />
                    {/* <input type="text" name="pincredit" id="pincredit" placeholder='Enter PIN'/><br /> */}
                    <button type="submit" >Submit</button><br />
                </form>:null}
                {showEditPass?<form  onSubmit={handleSubmitEditPass} style={{width:'100%'}}>
                    <input type="password" name="editpass" id="editpass" placeholder='Enter New Password'/><br />
                    {/* <input type="text" name="pindebit" id="pindebit" placeholder='Enter PIN'/><br /> */}
                    <input type="submit" value="Submit" /><br />
                </form>:null}
                {showCreateRoot? <form onSubmit={handleCreateRoot} style={{width:'100%'}}>
                    <h3>Create Root</h3>
                    <input type="text" id="name" placeholder="Enter Username" /><br />
                    <input type="password" id="password" placeholder="Enter Password" /><br />
                    <input type="email" id="email" placeholder="Enter your Email" /><br />
                    <input type="text" id="mobile" placeholder="Enter your Mobile Number" /><br />
                    <button type="submit">Create</button></form> :null}
                {showEmployees? 
                <table>
                    <thead>
                        <tr>
                            <th>User Name</th>
                            <th>Email</th>
                            <th>Mobile</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {emp.map((e,key)=>
                            <tr>
                                <td>{e.name}</td>
                                <td>{e.email}</td>
                                <td>{e.mobile}</td>
                                <td><button onClick={()=>deleteEmployee(e.id)}><i className='fa fa-trash'></i></button></td>
                            </tr>
                        )}
                    </tbody>
                </table> :null}
            </div>
        </>
    )
}

export default Home