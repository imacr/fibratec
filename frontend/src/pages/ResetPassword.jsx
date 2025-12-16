import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import styles from '../components/Login.module.css'; // 1. Reutilizamos los estilos del Login
import logo from '../assets/fibra.png';  // Usamos el mismo logo
import { API_URL } from "../config"; // Ajusta la ruta según la ubicación del archivo

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // 2. Añadimos estado de carga
  const [showPassword, setShowPassword] = useState(false); // Para el icono del ojo

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message + ". Serás redirigido en 3 segundos...");
        setTimeout(() => navigate("/login"), 3000); // Aumentamos tiempo para leer
      } else {
        setError(data.error || "Error al actualizar. El enlace puede haber expirado.");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <img className={styles.logo_login} src={logo} alt="Logo" />
        <h1 className={styles.loginTitle}>Restablecer Contraseña</h1>
        <p style={{color: '#666', marginTop: '-1rem', marginBottom: '1.5rem'}}>
          Ingresa tu nueva contraseña.
        </p>

        {message && <p className={styles.successMessage}>{message}</p>}
        {error && <p className={styles.errorMessage}>{error}</p>}
        
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.inputContainer}>
            <i className={`fa-solid fa-lock ${styles.icon}`}></i>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <i 
              className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} ${styles.passwordToggleIcon}`}
              onClick={() => setShowPassword(!showPassword)}
            ></i>
          </div>

          <div className={styles.inputContainer}>
            <i className={`fa-solid fa-lock ${styles.icon}`}></i>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirmar nueva contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className={styles.loginButton}
            disabled={loading}
          >
            {loading ? 'ACTUALIZANDO...' : 'ACTUALIZAR CONTRASEÑA'}
          </button>
        </form>
        
        <div style={{ marginTop: '1.5rem' }}>
          <Link to="/login" className={styles.forgotPassword}>
            Volver a Inicio de Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;