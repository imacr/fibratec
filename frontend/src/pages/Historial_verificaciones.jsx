import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { API_URL } from "../config";
import ModalFile from "../components/ModalFile";

export default function HistorialVerificaciones() {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalUrl, setModalUrl] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/historial_verificaciones`)
      .then((res) => res.json())
      .then((data) => {
        setHistorial(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando historial:", err);
        Swal.fire("Error", "No se pudo cargar el historial", "error");
        setLoading(false);
      });
  }, []);

  const abrirPDF = (url) => {
    if (!url) {
      Swal.fire("Sin documento", "No hay PDF disponible para este registro.", "info");
      return;
    }
    setModalUrl(`${API_URL}/${url}`);
  };

  if (loading) return <p className="mensaje-estado">Cargando historial...</p>;

  return (
    <div className="unidades-container">
      <h1>📜 Historial de Verificaciones Vehiculares</h1>

      {historial.length === 0 ? (
        <p className="mensaje-estado">No hay registros en el historial.</p>
      ) : (
        <div className="table-wrapper">
          <table className="elegant-table">
            <thead>
              <tr>
                <th>ID Verificación</th>
                <th>Unidad / Placa</th>
                <th>Holograma</th>
                <th>Periodo 1 (Real)</th>
                <th>Periodo 2 (Real)</th>
                <th>Fecha de cambio</th>
                <th>Usuario</th>
                <th>Comprobante 1</th>
                <th>Comprobante 2</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((item) => (
                <tr key={item.id_historial}>
                  <td>{item.id_verificacion}</td>
                  <td>
                    {item.unidad
                      ? `${item.unidad.nombre} (ID: ${item.unidad.id_unidad}) / ${item.unidad.placa || "Sin placa"}`
                      : "Sin unidad"}
                  </td>
                  <td>{item.holograma || "—"}</td>
                  <td>{item.periodo_1_real || "—"}</td>
                  <td>{item.periodo_2_real || "—"}</td>
                  <td>{new Date(item.fecha_cambio).toLocaleDateString()}</td>
                  <td>{item.usuario || "sistema"}</td>
                  <td>
                    {item.url_verificacion_1 ? (
                      <button className="btn-pdf" onClick={() => abrirPDF(item.url_verificacion_1)}>
                        📄 Verificación 1
                      </button>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    {item.url_verificacion_2 ? (
                      <button className="btn-pdf" onClick={() => abrirPDF(item.url_verificacion_2)}>
                        📄 Verificación 2
                      </button>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalUrl && <ModalFile url={modalUrl} onClose={() => setModalUrl(null)} />}
    </div>
  );
}
