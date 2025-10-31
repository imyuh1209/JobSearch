import Header from "./components/client/layout/header";
import Footer from "./components/client/layout/footer";
import { Outlet } from "react-router-dom";
import { ConfigProvider } from "antd";
import { getAccount } from "./services/api.service";
import { useContext, useEffect } from "react";
import { AuthContext } from "./components/context/auth.context";

function App() {
  const { setUser } = useContext(AuthContext);
  useEffect(() => {
    GetAccount();
  }, []);

  const GetAccount = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setUser({
        email: "",
        name: "",
        id: ""
      });
      return;
    }

    try {
      const res = await getAccount();
      if (res.data) {
        setUser(res.data.user);
      }
    } catch (error) {
      console.error("Error getting account:", error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setUser({
          email: "",
          name: "",
          id: ""
        });
      }
    }
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#3b82f6", // blue-500: điểm nhấn nhẹ, hiện đại
          colorBgLayout: "#f6f8fb", // nền xám rất nhạt cho toàn trang
          colorBgContainer: "#ffffff",
          colorBorder: "#d1d5db", // xám-300 cho viền dịu mắt
          borderRadius: 12,
        },
      }}
    >
      <Header />
      <Outlet />
      <Footer />
    </ConfigProvider>
  );
}

export default App;
