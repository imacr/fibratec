import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Componentes y Páginas
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import Usuarios from "./pages/Usuarios";
import Garantias from "./pages/Garantias";
import RequestReset from "./pages/RequestReset";
import ResetPassword from "./pages/ResetPassword";
import Unidades from "./pages/Unidades";
import Verificaciones from "./pages/Verificaciones";
import ChoferFallas from "./pages/ChoferFallas";
import AdminSolicitudes from "./pages/AdminSolicitudes";
import ListaSolicitudes from "./components/Lista_solicitudeschofer";
import FallasMecanicas from "./pages/FallasMecanicas";
import { NotificationProvider } from "./components/NotificationContext";

import Swal from "sweetalert2";

// Estilos
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

// ====================================================
// CONTENIDO PRINCIPAL DE LA APP
// ====================================================
function AppContent({ isLoggedIn, onLogin, onLogout, loading, usuarioId }) {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const toggleSidebar = () => setSidebarVisible(!sidebarVisible);

  // === AUTO LOGOUT POR INACTIVIDAD ===
  useEffect(() => {
    if (!isLoggedIn) return;

    const AUTO_LOGOUT_TIME = 20 * 60 * 1000; // 20 minutos
    let logoutTimer;

    const resetTimer = () => {
      clearTimeout(logoutTimer);
      logoutTimer = setTimeout(() => {
        onLogout();
        Swal.fire({
          title: "Sesión Expirada",
          text: "Has sido desconectado por inactividad.",
          icon: "warning",
          confirmButtonColor: "#dc3545",
          timer: 5000,
          timerProgressBar: true,
        });
      }, AUTO_LOGOUT_TIME);
    };

    // Escucha eventos de actividad
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("scroll", resetTimer);
    window.addEventListener("click", resetTimer);

    resetTimer(); // Inicia el contador

    return () => {
      clearTimeout(logoutTimer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("scroll", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, [isLoggedIn, onLogout]);

  if (loading) {
    return <div className="centered-loader">Cargando...</div>;
  }

  return (
    <div className="app-container">
      {isLoggedIn ? (
        <>
          {sidebarVisible && <Sidebar />}
          <div className={`main-content ${sidebarVisible ? "" : "full-width"}`}>
            <Header onLogout={onLogout} toggleSidebar={toggleSidebar} />
            <div className="content">
              
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/usuarios" element={<Usuarios />} />
                <Route path="/garantias" element={<Garantias />} />
                <Route path="/verificaciones" element={<Verificaciones />} />
                <Route path="/unidades" element={<Unidades />} />

                {/* ✅ Rutas con usuarioId */}
                <Route path="/chofer/solicitudes" element={<ChoferFallas usuarioId={usuarioId} />}/>
                <Route path="/chofer/listasolicitudes" element={<ListaSolicitudes usuarioId={usuarioId} />}/>
                <Route path="/admin/solicitudes" element={<AdminSolicitudes />} />
                <Route path="/fallasmecanicas" element={<FallasMecanicas />} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </>
      ) : (
        <div className="full-screen-login">
          <Routes>
            <Route path="/login" element={<Login onLogin={onLogin} />} />
            <Route path="/request-reset" element={<RequestReset />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      )}
    </div>
  );
}

// ====================================================
// COMPONENTE PRINCIPAL APP
// ====================================================
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [usuarioId, setUsuarioId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al iniciar la app, recuperar estado de sesión
  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const id = localStorage.getItem("usuarioId");
    setIsLoggedIn(loggedIn);
    setUsuarioId(id);
    setLoading(false);
  }, []);

  // Cuando inicia sesión correctamente
  const handleLogin = () => {
    setIsLoggedIn(true);
    setUsuarioId(localStorage.getItem("usuarioId"));
    


  };

  // Cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("usuarioId");
    setIsLoggedIn(false);
    setUsuarioId(null);
  };

  return (
    <NotificationProvider>
    <Router>
      <AppContent
        isLoggedIn={isLoggedIn}
        onLogin={handleLogin}
        onLogout={handleLogout}
        usuarioId={usuarioId}
        loading={loading}
      />
    </Router>
    </NotificationProvider>
  );
}
