import { useEffect, useState } from "react";
import { API_URL } from "../config";
import ModalFile from "../components/ModalFile";

export default function Historiales() {
  const [historiales, setHistoriales] = useState([]);
  const [modalUrl, setModalUrl] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(5); // Default: 5 items por página

  useEffect(() => {
    fetch(`${API_URL}/historiales`)
      .then((res) => {
        if (!res.ok) throw new Error("Error en la respuesta del servidor");
        return res.json();
      })
      .then((data) => setHistoriales(data))
      .catch((err) => console.error("Error cargando historiales:", err));
  }, []);

  const abrirModal = (url) => setModalUrl(`${API_URL}/${url}`);
  const cerrarModal = () => setModalUrl(null);

  // Paginación
  const indexUltimo = paginaActual * itemsPorPagina;
  const indexPrimero = indexUltimo - itemsPorPagina;
  const currentItems = itemsPorPagina === "all" ? historiales : historiales.slice(indexPrimero, indexUltimo);
  const totalPaginas = Math.ceil(historiales.length / (itemsPorPagina === "all" ? historiales.length : itemsPorPagina));

  return (
    <div className="unidades-container">
      <h1>Historial de Refrendo y Tenencia</h1>
      
          <div style={{ marginTop: "10px" }}>
            <label>Mostrar: </label>
            <select
              value={itemsPorPagina}
              onChange={e => setItemsPorPagina(e.target.value === "all" ? "all" : parseInt(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value="all">Todos</option>
            </select>
          </div>
      {/* Tabla */}
      <div className="table-wrapper">
        <table className="elegant-table">
          <thead>
            <tr>
              <th style={{ display: "none" }}>ID</th>
              <th>ID Unidad</th>
              <th>Vehículo</th>
              <th>Tipo de Pago</th>
              <th>Monto</th>
              <th>Monto Refrendo</th>
              <th>Monto Tenencia</th>
              <th>Fecha de Pago</th>
              <th>Factura</th>
              <th>Observaciones</th>
              <th>Tipo Movimiento</th>
              <th>Usuario</th>
              <th>Fecha Registro</th>
            </tr>
          </thead>

          <tbody>
            {currentItems.map((h, i) => (
              <tr key={i}>
                <td style={{ display: "none" }}>{h.id_historial}</td>
                <td>{h.id_unidad}</td>
                <td>{h.vehiculo_modelo}</td>
                <td>{h.tipo_pago}</td>
                <td>{h.monto}</td>
                <td>{h.monto_refrendo}</td>
                <td>{h.monto_tenencia}</td>
                <td>{h.fecha_pago}</td>
                <td>
                  {h.url_factura ? (
                    <button
                      onClick={() => abrirModal(h.url_factura)}
                      className="btn btn-outline-danger btn-sm"
                      title="Ver factura"
                    >
                      Abrir PDF
                    </button>
                  ) : "-"}
                </td>
                <td>{h.observaciones}</td>
                <td>{h.tipo_movimiento}</td>
                <td>{h.usuario_registro}</td>
                <td>{h.fecha_registro}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tarjetas */}
      <div className="card-wrapper">
        {currentItems.length > 0 ? currentItems.map(h => (
          <div key={h.id_historial} className="unidad-card">
            <h3>Unidad ID: {h.id_unidad}</h3>
            <p><b>Vehículo:</b> {h.vehiculo_modelo}</p>
            <p><b>Tipo de Pago:</b> {h.tipo_pago}</p>
            <p><b>Monto:</b> {h.monto}</p>
            <p><b>Monto Refrendo:</b> {h.monto_refrendo}</p>
            <p><b>Monto Tenencia:</b> {h.monto_tenencia}</p>
            <p><b>Fecha de Pago:</b> {h.fecha_pago}</p>
            <p><b>Observaciones:</b> {h.observaciones || "-"}</p>
            <p><b>Tipo Movimiento:</b> {h.tipo_movimiento}</p>
            <p><b>Usuario:</b> {h.usuario_registro}</p>
            <p><b>Fecha Registro:</b> {h.fecha_registro}</p>

            <div className="file-buttons">
              {h.url_factura && (
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => abrirModal(h.url_factura)}
                >
                  Abrir Factura
                </button>
              )}
            </div>
          </div>
        )) : (
          <p>No hay historiales registrados.</p>
        )}
      </div>

      {/* Paginación */}
      {itemsPorPagina !== "all" && (
        <div className="paginacion">
          <button onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))} disabled={paginaActual === 1}>{"<"}</button>
          <span>Página {paginaActual} de {totalPaginas}</span>
          <button onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))} disabled={paginaActual === totalPaginas}>{">"}</button>

        </div>
      )}

      {modalUrl && <ModalFile url={modalUrl} onClose={cerrarModal} />}
    </div>
  );
}
