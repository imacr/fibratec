import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import './Modal.css'; // Asegúrate de que la ruta al CSS sea correcta

const Modal = ({ children, onClose }) => {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; // Bloquea el scroll del body

    return () => {
      document.body.style.overflow = prev; // Restaura el scroll al cerrar
    };
  }, []);

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-contentido" 
        role="dialog" 
        aria-modal="true" 
        onClick={e => e.stopPropagation()} // Evita que el modal se cierre al hacer clic dentro
      >
<button
  className="modal-close-btn"
  onClick={onClose}
  aria-label="Cerrar modal"
>
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f3ebebff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
</button>

        {children}
      </div>
    </div>,
    document.getElementById("modal-root") // Asegúrate de que este div esté en tu index.html
  );
};

export default Modal;