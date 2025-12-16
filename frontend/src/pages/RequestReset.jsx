import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from '../components/Login.module.css'; // 1. Reutilizamos los mismos estilos del Login
import logo from '../assets/fibra.png';  // Reutilizamos el logo para consistencia
import { API_URL } from "../config"; // Ajusta la ruta según la ubicación del archivo

const RequestReset = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // 2. Añadimos estados de carga y error
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    // 3. Envolvemos la petición en try/catch para manejar errores de red
    try {
      const res = await fetch(`${API_URL}/api/request-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
      } else {
        setError(data.error || "Ocurrió un error.");
      }
    } catch (err) {
      setError("Error de conexión. No se pudo contactar al servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Aplicamos las clases del contenedor y la tarjeta del login
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <img className={styles.logo_login} src={logo} alt="Logo" />
        <h1 className={styles.loginTitle}>Recuperar Contraseña</h1>
        <p style={{color: '#666', marginTop: '-1rem', marginBottom: '1.5rem'}}>
          Ingresa tu correo y te enviaremos un enlace para restablecerla.
        </p>
        
        {/* Mostramos mensajes de éxito o error con estilos consistentes */}
        {message && <p className={styles.successMessage}>{message}</p>}
        {error && <p className={styles.errorMessage}>{error}</p>}
        
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.inputContainer}>
            <i className={`fa-solid fa-envelope ${styles.icon}`}></i>
            <input 
              type="email" 
              placeholder="Tu correo electrónico" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button 
            type="submit" 
            className={styles.loginButton}
            disabled={loading}
          >
            {loading ? 'ENVIANDO...' : 'ENVIAR ENLACE'}
          </button>
        </form>
        
        {/* 4. Añadimos un enlace para volver al login */}
        <div style={{ marginTop: '1.5rem' }}>
          <Link to="/login" className={styles.forgotPassword}>
            Volver a Inicio de Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RequestReset;