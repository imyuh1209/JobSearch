import { useContext } from "react";
import { AuthContext } from "../components/context/auth.context";
import { Button, Result } from "antd";
import { Link, Navigate } from "react-router-dom";

const PrivateRoute = (props) => {
    const { user } = useContext(AuthContext);
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if ((user && user.id) || token) {
        return (
            <>
                {props.children}
            </>
        )
    }
    return (
        <Navigate to="/login" replace />
    );
}

export default PrivateRoute;