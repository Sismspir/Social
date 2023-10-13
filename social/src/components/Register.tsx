import { RiArrowGoBackFill as Back} from "react-icons/Ri";
import { useAlert } from "./Alert/AlertContainer";
import { useNavigate } from "react-router-dom";
import { FormEvent, useState } from 'react';
import axios from 'axios';

interface Iuser {
    username: string,
    password: string,
}
interface Iusernames {
    username: string,
}

function Register() {
    const [userNames, setUserNames] = useState([]);
    const navigate = useNavigate();
    const { alert } = useAlert();

    const goHome = () => {
        navigate("/");
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e?.preventDefault();

        const registerForm = e.currentTarget;
        const regName = registerForm.username.value;
        const regPass = registerForm.password.value;
        const regPassAgain = registerForm.passagain.value;

        if( regPass != regPassAgain ) {
            alert({
                title: "Attention!",
                message: "Passwords do not match.",
                autoClose: true,
            })
            return;
        } else if (regName.trim == "" || regPass.trim == "" || regPassAgain == "") {
            alert({
                title: "Hey got you...",
                message: "No empty values please ░▒▓║",
                autoClose: true,
            })
            return;
        } else {
            console.log( {
                username: regName,
                password: regPass,
            } )

            const getUsernames = async() => {
                try {
                    const response = await axios.post(`http://localhost:3000/server/login/fetchall`);
                    console.log("sending request to the database");
                    const requestResult = response.data;
                    const arrayOfusernames =  requestResult.map((obj: Iusernames) => Object.values(obj)[0]);
                    console.log("this is the response", arrayOfusernames);
                    setUserNames(arrayOfusernames); 
                    console.log("these are the usernames", userNames);
                    // callback hell!!
                    if (!arrayOfusernames.includes(regName)) {
                        fetchData({
                            username: regName,
                            password: regPass,
                        });

                        alert({
                            title: "",
                            message: "User is registered successfully!",
                            autoClose: true,
                        })

                    } else {
                        alert({
                            title: "Attention!",
                            message: "Username already exists",
                            autoClose: true,
                        })
                    }
                }   catch (error) {
                    console.log(error);
                }
            }

            const fetchData = async (user: Iuser) => {
                try {
                    // we use the JSON.stringify format because the server/register/ function expects a string!!
                    const response = await axios.post(`http://localhost:3000/server/register/${ JSON.stringify(user)}`);
                    console.log("sending request to the database");
                    let requestResult = response.data;
                    console.log("this is the response", requestResult, "And these are the usernames:", userNames);
                }  catch (error) {
                    console.log(error);
                }
            };

            getUsernames();
            console.log("get usernames is finished");
        }
    }
    return(
        <div className='relative flex h-screen'>
            <Back onClick={goHome} className="shadow-2xl hover:bg-slate-100 -rotate-45 border-2 border-slate-700 absolute m-14 h-[8vh] w-[8vw] bg-slate-200"/>
            <form className="shadow-2xl flex flex-col rounded-xl bg-slate-100 self-center mx-[10vw] border-2 pb-[12vh] pt-[14vh] px-[30vw]" onSubmit={handleSubmit}>
                <p className='m-2 text-2xl text-[#9966a3] font-medium'>Username</p>
                <input key="username" className="mb-8 border-b-4 w-[100%] outline-none" type="text" placeholder="  Username" name="username">
                </input>
                <p className='m-2 text-2xl text-[#9966a3] font-medium'>Password</p>
                <input key="pass" className="mb-8 border-b-4 w-[100%] outline-none" type="password" placeholder="  Password" name="password">
                </input> 
                <p className='m-2 text-2xl text-[#9966a3] font-medium'>Password again</p>
                <input key="passAgain" className="mb-8 border-b-4 w-[100%] outline-none" type="password" placeholder="  Password again" name="passagain">
                </input> 
                <button type="submit" className='rounded-md self-center min-h-[2rem] bg-[#b696dd] text-slate-100 h-[4vh] w-[16vw] font-bold hover:bg-green-500'>Register</button>
            </form>
        </div>
)}
export default Register