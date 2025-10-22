import React from "react";
import ReactDOM from "react-dom";
import './Modal.css';
import { BASE_URL } from "../config"; // Ajusta la ruta según la ubicación del archivo

const ModalFile = ({ url, onClose }) => {
  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-contentido" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        
        {/* Previsualización */}
        {url.endsWith(".pdf") ? (
          <iframe
            src={url}
            width="100%"
            height="500px"
            title="Documento PDF"
          ></iframe>
        ) : (
          <img src={url} alt="Archivo" style={{ width: "100%", maxHeight: "500px" }} />
        )}

      <a 
      href={`${BASE_URL}/api/descargar/${url.split('/').slice(-2).join('/')}`} 
      className="download-btn"
    >
      Descargar
    </a>


      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default ModalFile;
