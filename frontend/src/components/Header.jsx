import React, { useState, useEffect } from "react";
import "./Header.css";

const Header = ({  onLogout, toggleSidebar, onChangePassword }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="app-header">
      <div className="header-left">
        {/* Este es tu botón original, mantenemos la funcionalidad */}
        {!isMobile && (
          <button className="main-action-btn" onClick={toggleSidebar}>
            <i className="fa-solid fa-house"></i>
          </button>
        )}
      </div>

      <div className="header-right">
        <div className="user-menu-container">
          <button
            className="user-menu-btn"
            onClick={() => setShowMenu(!showMenu)}
          >
            <i className="fa fa-user"></i>
          </button>

          {showMenu && (
            <div className="user-menu-dropdown">
            <button className="dropdown-item" onClick={onChangePassword}>
              <i className="fa fa-key" /> Cambiar contraseña
            </button>
            <button className="dropdown-item" onClick={onLogout}>
              <i className="fa fa-sign-out-alt" /> Cerrar sesión
            </button>
          </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
