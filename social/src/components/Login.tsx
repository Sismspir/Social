import { useAlert } from "./Alert/AlertContainer";
import { useNavigate } from 'react-router-dom';
import { FormEvent, useState } from 'react';
import loginImage from '/loginImage.jpg'
import axios from 'axios';

function Login(props: { updateUser: (user:string) => void}) {
    const navigate = useNavigate(); 
    const { updateUser } = props;
    const { alert } = useAlert();
    const goRegister = () => {
        navigate("/register");
    };

    // Starts When the user clicks login
    const login = (eve: FormEvent<HTMLFormElement>) => {
        // the ? calls the method even the object is null or undefined
        // without causing an error
        eve?.preventDefault();
        const logForm = eve.currentTarget;
        const logUser = logForm.username.value;
        const logPass = logForm.password.value;
    
        const fetchData = async () => {
            try {
                const response = await axios.post(`http://localhost:3000/server/login/${logUser}`);
                console.log("sending request to the database");
                let requestResult = response.data;
                // get info from the resonse
                const userPassFromDB: string | undefined = response.data[0] != undefined ? requestResult[0]["logpass"] : undefined;
                const userid: number | undefined = response.data[0] != undefined ? requestResult[0]["logid"] : undefined;

                if( userPassFromDB === undefined ) {
                    alert({
                        title: "Wrong username",
                        message: "username does not exist",
                        autoClose: true,
                    })
                } else if(userPassFromDB != logPass) {
                    alert({
                        title: "Wrong password",
                        message: "check your password again",
                        autoClose: true,
                    })
                    return;
                } else {
                    localStorage.setItem("currentUser", JSON.stringify({"logUser": logUser,  "logId": userid}));
                    alert({
                        title: "",
                        message: "You have successfully logged in.",
                        autoClose: true,
                    })
                    updateUser(logUser);
                    navigate("/home")
                };
                console.log(userPassFromDB);
            }  catch (error) {
                console.log(error);
            }
        };

        if( logUser.trim == "" || logPass.trim == ""){
            alert({
            title:"",
            message: "Empty username or password.",
            autoClose: true,
        });
            return;
        } 

        fetchData();
        
    }
    return(
        <div className="flex justify-center items-center h-[100vh] bg-[#d4bfee]">
            <div className='w-[30%] h-[50vh] min-w-[16rem] min-h-[26rem]'
            style={{
            backgroundImage: `url('${loginImage}')`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundColor: "black",
            }}>  
                <h1 className='text-slate-200 text-5xl font-bold text-start px-8 pt-[4vw]'>Welcome to our amazing page!</h1>
                <h2 className='text-slate-200 text-1xl  text-start p-8'>Register and enjoy a lifetime experience.</h2>        
                <button onClick={goRegister} className='min-h-[2rem] bg-[#f3eef8] text-[#8457bb] h-[4vh] w-[14vw] ml-[2rem] font-bold'>Register</button>        
            </div>
            <div className='bg-white w-[30%] h-[50vh] px-[3%] min-w-[16rem] min-h-[26rem]'> 
               <h2 className='text-black text-3xl font-extrabold ml-[5%] mb-[10%] mt-[6rem]'>Login</h2>
               <form onSubmit={login}>
                <input key="username" className="mb-8 border-b-4 w-[100%] outline-none" type="text" placeholder="  Username" name="username"></input>
                <input key="pass" className="mb-8 border-b-4 w-[100%] outline-none" type="password" placeholder="  Password"name="password"></input> 
                <button type="submit" className='min-h-[2rem] bg-[#8c67b9] text-slate-100 h-[4vh] w-[14vw] font-bold'>Login</button>
               </form>
            </div>
        </div>
)}
export default Login;