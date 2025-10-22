import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";
import "./Sidebar.css";
import { useContext } from "react";
import { NotificationContext } from "./NotificationContext";



const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showSubmenu, setShowSubmenu] = useState(false);
  const navigate = useNavigate();
  const [showMantenimientosSubmenu, setShowMantenimientosSubmenu] = useState(false);
  const [showHistorialSubmenu, setShowHistorialSubmenu] = useState(false);
  const [showChoferSubmenu, setShowChoferSubmenu] = useState(false);
 const { pendientes } = useContext(NotificationContext);


  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleSubmenu = (e) => {
    e.preventDefault(); // evita recarga inmediata
    setShowSubmenu(!showSubmenu);
  };
  

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {isMobile && (
        <button className="menu-btn" onClick={toggleSidebar}>
          <i className="fa-solid fa-house"></i>
        </button>
      )}
      {isMobile && isOpen && <div className="overlay" onClick={toggleSidebar}></div>}

      <div className={`sidebar ${isMobile ? (isOpen ? "open" : "") : ""}`}>
        <div className="sidebar-header">
          <img src={logo} alt="Logo" className="logo" />
          {isMobile && (
            <button className="close-btn" onClick={toggleSidebar}></button>
          )}
        </div>

        <nav className="sidebar-menu">

          {/* === Dashboard con submenú === */}
          <div
            className="menu-item"
            onMouseEnter={() => !clicked && setShowSubmenu(true)}   // hover abre solo si no se clickeó
            onMouseLeave={() => !clicked && setShowSubmenu(false)} // hover cierra solo si no se clickeó
>
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={(e) => {
                const isIconClick = e.target.closest(".submenu-toggle");
                if (isIconClick) toggleSubmenu(e);
                else {
                  setShowSubmenu(!showSubmenu); // también se despliega al hacer clic
                  navigate("/"); // clic normal -> navega al Dashboard
                }
              }}
            >
              <i className="fa fa-th-large"></i> Dashboard
              <i
                className={`fa submenu-toggle fa-chevron-${showSubmenu ? "down" : "right"}`}
                style={{ marginLeft: "auto" }}
              ></i>
            </NavLink>

            {showSubmenu && (
              <div className="submenu">
                <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
                  <i className="fa fa-bar-chart"></i> Reportes
                </NavLink>

              </div>
            )}
          </div>

            <NavLink to="/admin/solicitudes" className={({ isActive }) => (isActive ? "active" : "")}>
                <i className="fa fa-line-chart"></i> Solicitudes
                {pendientes > 0 && (
                  <span className="notification-badge">{pendientes}</span>
                )}
              </NavLink>
          {/* === Mantenimientos con submenú === */}
          <div
            className="menu-item"
            onMouseEnter={() => !clicked && setShowMantenimientosSubmenu(true)}
            onMouseLeave={() => !clicked && setShowMantenimientosSubmenu(false)}
          >
            <NavLink
              to="/mantenimientos"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={(e) => {
                const isIconClick = e.target.closest(".submenu-toggle");
                if (isIconClick) setShowMantenimientosSubmenu(!showMantenimientosSubmenu);
                else {
                  setShowMantenimientosSubmenu(!showMantenimientosSubmenu);
                  navigate("/mantenimientos");
                }
              }}
            >
              <i className="fa fa-cogs"></i> Mantenimientos
              <i
                className={`fa submenu-toggle fa-chevron-${showMantenimientosSubmenu ? "down" : "right"}`}
                style={{ marginLeft: "auto" }}
              ></i>
            </NavLink>

            {showMantenimientosSubmenu && (
              <div className="submenu">
                <NavLink to="/mantenimientos_menores" className={({ isActive }) => (isActive ? "active" : "")}>
                  <i className="fa fa-wrench"></i> Mantenimientos Menores
                </NavLink>
                <NavLink to="/mantenimientos_mayores" className={({ isActive }) => (isActive ? "active" : "")}>
                  <i className="fa fa-gear"></i> Mantenimientos Mayores
                </NavLink>
                <NavLink to="/fallasmecanicas" className={({ isActive }) => (isActive ? "active" : "")}>
                  <i className="fa fa-car"></i> Fallas Mecánicas
                </NavLink>
                <NavLink to="/historial_mantenimientos" className={({ isActive }) => (isActive ? "active" : "")}>
                  <i className="fa fa-history"></i> Historial de Mantenimientos
                </NavLink>
              </div>
            )}
          </div>
          
       {/* === Historiales con submenú === */}
      <div
        className="menu-item"
        onMouseEnter={() => !clicked && setShowHistorialSubmenu(true)}
        onMouseLeave={() => !clicked && setShowHistorialSubmenu(false)}
      >
        <NavLink
          to="/historiales"
          className={({ isActive }) => (isActive ? "active" : "")}
          onClick={(e) => {
            const isIconClick = e.target.closest(".submenu-toggle");
            if (isIconClick) setShowHistorialSubmenu(!showHistorialSubmenu);
            else {
              setShowHistorialSubmenu(!showHistorialSubmenu);
              navigate("/historiales");
            }
          }}
        >
          <i className="fa fa-folder-open"></i> Historiales
          <i
            className={`fa submenu-toggle fa-chevron-${showHistorialSubmenu ? "down" : "right"}`}
            style={{ marginLeft: "auto" }}
          ></i>
        </NavLink>

        {showHistorialSubmenu && (
          <div className="submenu">
            <NavLink to="/asignaciones" className={({ isActive }) => (isActive ? "active" : "")}>
              <i className="fa fa-users"></i> Asignaciones
            </NavLink>
            <NavLink to="/fallasmecanicas" className={({ isActive }) => (isActive ? "active" : "")}>
              <i className="fa fa-cogs"></i> Fallas Mecánicas
            </NavLink>
            <NavLink to="/mantenimientos" className={({ isActive }) => (isActive ? "active" : "")}>
              <i className="fa fa-wrench"></i> Mantenimientos
            </NavLink>
            <NavLink to="/polizas" className={({ isActive }) => (isActive ? "active" : "")}>
              <i className="fa fa-file-text"></i> Pólizas
            </NavLink>
          </div>
        )}
      </div>
          <NavLink to="/unidades" className={({ isActive }) => isActive ? "active" : ""}>
            <i className="fa fa-car"></i> Unidades
          </NavLink>
          {/* === Usuarios === */}
          <NavLink
            to="/usuarios"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            
            <i className="fa fa-users"></i> Usuarios
          </NavLink>

          <NavLink
          to="/garantias"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <i className="fa-solid fa-file-lines"></i> Pólizas
        </NavLink>

        <NavLink
          to="/verificaciones"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <i className="fa-solid fa-clipboard-check"></i> Verificaciones
        </NavLink>





          {/* === Chofer con submenú === */}
      <div
        className="menu-item"
        onMouseEnter={() => !clicked && setShowChoferSubmenu(true)}
        onMouseLeave={() => !clicked && setShowChoferSubmenu(false)}
      >
        <NavLink
          to="/chofer"
          className={({ isActive }) => (isActive ? "active" : "")}
          onClick={(e) => {
            const isIconClick = e.target.closest(".submenu-toggle");
            if (isIconClick) setShowChoferSubmenu(!showChoferSubmenu);
            else {
              setShowChoferSubmenu(!showChoferSubmenu);
              navigate("/chofer");
            }
          }}
        >
          <i className="fa fa-folder-open"></i> Acciones chofer
          <i
            className={`fa submenu-toggle fa-chevron-${showChoferSubmenu ? "down" : "right"}`}
            style={{ marginLeft: "auto" }}
          ></i>
        </NavLink>

        {showChoferSubmenu && (
          <div className="submenu">
            <NavLink to="/chofer/solicitudes" className={({ isActive }) => (isActive ? "active" : "")}>
              <i className="fa fa-users"></i> Solicitud
            </NavLink>
            <NavLink to="/chofer/listasolicitudes" className={({ isActive }) => (isActive ? "active" : "")}>
              <i className="fa fa-cogs"></i> Lista solicitudes
            </NavLink>
          </div>
        )}
      </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;











