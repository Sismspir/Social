import {Navigate, Outlet} from 'react-router-dom';

export default function ProtectedRoutes(props: {currentUser: string}) {
    console.log("this is the cur user: ", props.currentUser)
    return props.currentUser !== 'no-user' ? <Outlet/> : <Navigate to="/" /> 
}