import { useEffect, useState } from "react";
import { API_URL } from "../config";
import ModalFile from "../components/ModalFile";

export default function HistorialMantenimientos() {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [modalUrl, setModalUrl] = useState(null);

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(5); // Cambia según necesites

  useEffect(() => {
    fetch(`${API_URL}/mantenimientos`)
      .then((res) => {
        if (!res.ok) throw new Error("Error en servidor");
        return res.json();
      })
      .then((data) => setMantenimientos(data))
      .catch((err) => console.error("Error cargando mantenimientos:", err));
  }, []);

  const abrirModal = (url) => setModalUrl(`${API_URL}/${url}`);
  const cerrarModal = () => setModalUrl(null);

  // Calcular registros visibles
  const indexUltimo = paginaActual * itemsPorPagina;
  const indexPrimero = indexUltimo - itemsPorPagina;
  const mantenimientosFiltrados = mantenimientos.slice(indexPrimero, indexUltimo);
  const totalPaginas = Math.ceil(mantenimientos.length / itemsPorPagina);

  return (
    <div className="unidades-container">
      <h1>Historial de Mantenimientos</h1>

      {/* Tabla */}
      <div className="table-wrapper">
        <table className="elegant-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>ID Unidad</th>
              <th>Tipo de Mantenimiento</th>
              <th>Descripción</th>
              <th>Fecha Realización</th>
              <th>Kilometraje</th>
              <th>Realizado Por</th>
              <th>Empresa Garantía</th>
              <th>Cobertura Garantía</th>
              <th>Costo</th>
              <th>Observaciones</th>
              <th>Comprobante</th>
            </tr>
          </thead>

          <tbody>
            {mantenimientosFiltrados.length > 0 ? (
              mantenimientosFiltrados.map((m) => (
                <tr key={m.id_mantenimiento}>
                  <td>{m.id_mantenimiento}</td>
                  <td>{m.id_unidad}</td>
                  <td>{m.tipo_mantenimiento}</td>
                  <td>{m.descripcion || "-"}</td>
                  <td>{m.fecha_realizacion}</td>
                  <td>{m.kilometraje}</td>
                  <td>{m.realizado_por || "-"}</td>
                  <td>{m.empresa_garantia || "-"}</td>
                  <td>{m.cobertura_garantia || "-"}</td>
                  <td>{m.costo || "-"}</td>
                  <td>{m.observaciones || "-"}</td>
                  <td>
                    {m.url_comprobante ? (
                      <button
                        onClick={() => abrirModal(m.url_comprobante)}
                        className="btn btn-outline-danger btn-sm"
                        title="Ver comprobante"
                      >
                        Abrir PDF
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="12" style={{ textAlign: "center" }}>
                  No hay mantenimientos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cards */}
      <div className="card-wrapper">
        {mantenimientosFiltrados.length > 0 ? mantenimientosFiltrados.map((m) => (
          <div key={m.id_mantenimiento} className="unidad-card">
            <h3>Mantenimiento ID: {m.id_mantenimiento}</h3>
            <p><b>ID Unidad:</b> {m.id_unidad}</p>
            <p><b>Tipo de Mantenimiento:</b> {m.tipo_mantenimiento}</p>
            <p><b>Descripción:</b> {m.descripcion || "-"}</p>
            <p><b>Fecha Realización:</b> {m.fecha_realizacion}</p>
            <p><b>Kilometraje:</b> {m.kilometraje}</p>
            <p><b>Realizado Por:</b> {m.realizado_por || "-"}</p>
            <p><b>Empresa Garantía:</b> {m.empresa_garantia || "-"}</p>
            <p><b>Cobertura Garantía:</b> {m.cobertura_garantia || "-"}</p>
            <p><b>Costo:</b> {m.costo || "-"}</p>
            <p><b>Observaciones:</b> {m.observaciones || "-"}</p>

            <div className="file-buttons">
              {m.url_comprobante && (
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => abrirModal(m.url_comprobante)}
                >
                  Abrir Comprobante
                </button>
              )}
            </div>
          </div>
        )) : (
          <p>No hay mantenimientos registrados.</p>
        )}
      </div>

      {/* Paginación */}
      <div className="paginacion">
        <button
          onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
          disabled={paginaActual === 1}
        >
          {"<"}
        </button>

        <span>Página {paginaActual} de {totalPaginas}</span>

        <button
          onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
          disabled={paginaActual === totalPaginas}
        >
          {">"}
        </button>
      </div>

      {modalUrl && <ModalFile url={modalUrl} onClose={cerrarModal} />}
    </div>
  );
}
