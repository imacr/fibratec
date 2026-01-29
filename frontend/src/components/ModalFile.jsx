import React from "react";
import ReactDOM from "react-dom";
import "./Modal.css";

const ModalFile = ({ url, onClose }) => {
  const extension = url.split(".").pop().toLowerCase();


  const esImagen = ["jpg", "jpeg", "png", "gif", "webp"].includes(extension);
  const esVideo = ["mp4", "webm", "ogg"].includes(extension);
  const esAudio = ["mp3", "wav", "ogg"].includes(extension);
  const esPDF = extension === "pdf";
  const esOffice = ["docx", "xlsx", "pptx"].includes(extension);
  const descargarArchivo = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();

    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = url.split("/").pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-contentido" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>

        {/* IMÁGENES */}
        {esImagen && (
          <img
            src={url}
            alt="Archivo"
            style={{ width: "100%", maxHeight: "80vh", objectFit: "contain" }}
          />
        )}

        {/* PDF */}
        {esPDF && (
          <iframe
            src={url}
            width="100%"
            height="500px"
            title="PDF"
          />
        )}

        {/* VIDEO */}
        {esVideo && (
          <video
            src={url}
            controls
            style={{ width: "100%", maxHeight: "80vh" }}
          />
        )}

        {/* AUDIO */}
        {esAudio && (
          <audio src={url} controls style={{ width: "100%" }} />
        )}

        {/* DOCUMENTOS OFFICE */}
        {esOffice && (
          <div style={{ textAlign: "center" }}>
            <p>No se puede previsualizar este documento.</p>
            <a
              href={url}
              download
              className="download-btn"
            >
              Descargar archivo
            </a>
          </div>
        )}

        {/* DESCARGA GENERAL */}
        <button
        className="download-btn"
        onClick={(e) => {
          e.stopPropagation();
          descargarArchivo(url);
        }}
      >
        ⬇ Descargar
      </button>




      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default ModalFile;

