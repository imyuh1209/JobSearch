import Header from "./components/client/layout/header";
import Footer from "./components/client/layout/footer";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./components/common/PageTransition";
import IntroScreen from "./components/common/IntroScreen";
import { Outlet, useLocation } from "react-router-dom";
import { ConfigProvider, theme as antdTheme } from "antd";
import { getAccount } from "./services/api.service";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./components/context/auth.context";

function App() {
  const { setUser } = useContext(AuthContext);
  const location = useLocation();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    // Chỉ hiện intro khi user lần đầu vào session (f5 lại vẫn hiện cho đẹp)
    setShowIntro(true);
  }, []);
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

  useEffect(() => {
    const cls = document.documentElement.classList;
    if (isDark) cls.add('theme-dark'); else cls.remove('theme-dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: "#0077b6", // Sea Blue
          colorPrimaryHover: "#0050b3",
          colorText: "var(--color-text)",
          colorTextSecondary: "var(--color-text-secondary)",
          colorBgLayout: "var(--bg-app)",
          colorBgContainer: "var(--color-bg)",
          colorBgElevated: "var(--color-bg)",
          colorBorder: "var(--color-border)",
          colorSplit: "var(--color-border)",
          controlItemBgHover: "var(--color-bg-soft)",
          controlItemBgActive: "var(--color-bg-soft)",
          controlOutline: "rgba(0, 119, 182, 0.2)",
          boxShadowTertiary: "var(--shadow-soft)",
          boxShadowSecondary: "var(--shadow-medium)",
          borderRadius: 8,
          borderRadiusLG: 12,
        },
        components: {
          Menu: {
            itemBg: "transparent",
            itemColor: "var(--color-text)",
            itemHoverColor: "var(--color-text)",
            itemHoverBg: "var(--menu-hover-bg)",
            itemSelectedColor: "var(--color-primary)",
            itemSelectedBg: "var(--menu-selected-bg)",
            horizontalItemSelectedColor: "var(--color-primary)",
          },
          Dropdown: {
            colorBgElevated: "var(--color-bg)",
            controlItemBgHover: "var(--color-bg-soft)",
            controlItemBgActive: "var(--color-bg-soft)",
          },
          Card: {
            headerBg: "var(--color-bg-soft)",
            headerColor: "var(--color-text)",
            colorBorderSecondary: "var(--color-border)",
            boxShadow: "var(--shadow-medium)",
          },
          Form: {
            labelColor: "var(--color-text-secondary)",
          },
          Table: {
            headerBg: "var(--color-bg-soft)",
            headerColor: "var(--color-text)",
            headerSplitColor: "var(--color-border)",
            rowHoverBg: "var(--color-bg-soft)",
            rowSelectedBg: "var(--color-bg-soft)",
          },
        },
      }}
    >
      {showIntro && <IntroScreen onComplete={() => setShowIntro(false)} />}
      <Header isDarkTheme={isDark} onToggleTheme={() => setIsDark((v) => !v)} />
      <AnimatePresence mode="wait">
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </AnimatePresence>
      <Footer />
    </ConfigProvider>
  );
}

export default App;
