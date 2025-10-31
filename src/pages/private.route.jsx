import { useContext } from "react";
import { AuthContext } from "../components/context/auth.context";
import { Button, Result } from "antd";
import { Link } from "react-router-dom";

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

        <Result
            status="403"
            title="Oops!"
            subTitle={"Bạn cần đăng nhập để truy cập nguồn tài nguyên này!"}
            extra={
                <Link to="/login">
                    <Button type="primary">Go to login page</Button>
                </Link>
            }
        />
    );
}

export default PrivateRoute;