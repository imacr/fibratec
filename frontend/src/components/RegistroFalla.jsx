import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./SolicitudForm.css"; // Reutiliza el CSS del formulario de solicitud
import { API_URL } from "../config"; // Ajusta la ruta según la ubicación del archivo

export default function RegistroFalla() {
  const [misSolicitudes, setMisSolicitudes] = useState([]);
  const [lugares, setLugares] = useState([]);
  const [fallaData, setFallaData] = useState({
    id_lugar: "",
    proveedor: "",
    tipo_pago: "",
    costo: "",
    tiempo_uso_pieza: "",
    aplica_poliza: false,
    observaciones: "",
    url_comprobante: null,
  });

// ✅ Detecta al chofer desde localStorage (funciona si se guarda como ID o como objeto)
let idChofer = null;
const rawData = localStorage.getItem("usuarioId") || localStorage.getItem("chofer");

if (rawData) {
  try {
    const parsed = JSON.parse(rawData);
    idChofer = parsed?.id || parsed; // si es objeto, usa .id; si es número, usa el valor directo
  } catch {
    idChofer = rawData; // si no era JSON, usa el valor como está
  }
}
  // Obtener solicitudes del chofer y lista de lugares
  useEffect(() => {
    if (!idChofer) return;

    // Solicitudes del chofer
    fetch(`${API_URL}/solicitudes/chofer/${idChofer}`)
      .then(res => res.json())
      .then(data => setMisSolicitudes(data))
      .catch(err => console.error(err));

    // Lista de lugares
    fetch(`${API_URL}/lugares`)
      .then(res => res.json())
      .then(setLugares)
      .catch(err => console.error(err));
  }, [idChofer]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFallaData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleFileChange = (e) => {
  setFallaData(prev => ({ ...prev, url_comprobante: e.target.files[0] }));
};


const handleSubmitFalla = async (id_solicitud) => {
  if (!id_solicitud) return;

  const formData = new FormData();
  formData.append('id_solicitud', id_solicitud);
  formData.append('id_lugar', fallaData.id_lugar);
  formData.append('proveedor', fallaData.proveedor);
  formData.append('tipo_pago', fallaData.tipo_pago);
  formData.append('costo', fallaData.costo);
  formData.append('tiempo_uso_pieza', fallaData.tiempo_uso_pieza);
  formData.append('aplica_poliza', fallaData.aplica_poliza);
  formData.append('observaciones', fallaData.observaciones);

  if (fallaData.url_comprobante) {
    formData.append('comprobante', fallaData.url_comprobante);
  }

  try {
    const res = await fetch(`${API_URL}/fallas`, {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (res.ok) {
      Swal.fire("Registrado", data.msg, "success");
        setMisSolicitudes(prev =>
        prev.map(s =>
          s.id_solicitud === id_solicitud ? { ...s, completada: true } : s
        )
      );

      // limpiar formulario
      setFallaData({
        id_lugar: "",
        proveedor: "",
        tipo_pago: "",
        costo: "",
        tiempo_uso_pieza: "",
        aplica_poliza: false,
        observaciones: "",
        url_comprobante: null
      });
    } else {
      Swal.fire("Error", data.error || "No se pudo registrar la falla", "error");
    }
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "Error de conexión al registrar la falla", "error");
  }
};


  return (
    <div className="registro-falla-container">
      <h2>Mis Solicitudes</h2>

      {!idChofer && <p className="mensaje-estado">No se ha identificado al chofer. Inicia sesión.</p>}
      {idChofer && misSolicitudes.length === 0 && <p className="mensaje-estado">No tienes solicitudes.</p>}

      {misSolicitudes.map(s => (
        <div key={s.id_solicitud} className="mb-6 border-b pb-3">
         

          {s.estado === "aprobada" && !s.completada ? (
            <form onSubmit={e => { e.preventDefault(); handleSubmitFalla(s.id_solicitud); }}>
              <label>Lugar de reparación:</label>
              <select name="id_lugar" value={fallaData.id_lugar} onChange={handleChange} required>
                <option value="">Seleccione</option>
                {lugares.map(l => (
                  <option key={l.id_lugar} value={l.id_lugar}>{l.nombre_lugar}</option>
                ))}
              </select>

              <label>Proveedor:</label>
              <input type="text" name="proveedor" value={fallaData.proveedor} onChange={handleChange} />

              <label>Tipo de pago:</label>
              <input type="text" name="tipo_pago" value={fallaData.tipo_pago} onChange={handleChange} />

              <label>Costo:</label>
              <input type="number" name="costo" value={fallaData.costo} onChange={handleChange} />

              <label>Tiempo de uso de la pieza:</label>
              <input type="text" name="tiempo_uso_pieza" value={fallaData.tiempo_uso_pieza} onChange={handleChange} />

              <label>
                <input type="checkbox" name="aplica_poliza" checked={fallaData.aplica_poliza} onChange={handleChange} />
                Aplica póliza
              </label>

              <label>Observaciones:</label>
              <textarea name="observaciones" value={fallaData.observaciones} onChange={handleChange}></textarea>

              <label>Comprobante (PDF):</label>
              <input
                type="file"
                name="comprobante"
                accept="application/pdf"
                onChange={handleFileChange}
              />

              <button type="submit">Registrar Falla</button>
            </form>
          ) : s.estado !== "aprobada" ? (
            <p>Tu solicitud aún no ha sido aprobada.</p>
          ) : s.completada ? (
            <p>Falla ya registrada.</p>
          ) : null}
        </div>
      ))}
  </div>
  );
}
