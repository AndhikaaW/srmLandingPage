import React from "react";
import ReactDOM from "react-dom/client";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import "./styles.css";

// ponytail: tanpa router, /login diserve 404.html (copy index.html) lalu cabang di sini. Butuh route beneran → tambah react-router.
const isLogin = window.location.pathname.includes("login");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>{isLogin ? <LoginPage /> : <LandingPage />}</React.StrictMode>
);
