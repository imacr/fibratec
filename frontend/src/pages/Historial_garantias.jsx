import { useEffect, useState } from "react";
import { API_URL } from "../config";
import ModalFile from "../components/ModalFile";

export default function HistorialGarantias() {
  const [historiales, setHistoriales] = useState([]);
  const [modalUrl, setModalUrl] = useState(null);

  // PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10); // default 10

  useEffect(() => {
    fetch(`${API_URL}/historial_garantias`)
      .then((res) => {
        if (!res.ok) throw new Error("Error en la respuesta del servidor");
        return res.json();
      })
      .then((data) => setHistoriales(data))
      .catch((err) => console.error("Error cargando historial de pólizas:", err));
  }, []);

const abrirModal = (url) => {
  // Eliminamos la barra final de API_URL y la barra inicial de url
  const normalizedUrl = `${API_URL.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
  setModalUrl(normalizedUrl);
};

const cerrarModal = () => setModalUrl(null);

  // CALCULAR PÁGINA
  const indexLast = currentPage * registrosPorPagina;
  const indexFirst = indexLast - registrosPorPagina;

  const datosPagina =
    registrosPorPagina === "all"
      ? historiales
      : historiales.slice(indexFirst, indexLast);

  const totalPaginas =
    registrosPorPagina === "all"
      ? 1
      : Math.ceil(historiales.length / registrosPorPagina);

  return (
    <div className="unidades-container">
      <h1>Historial de Pólizas de Garantía</h1>

      {/* Selector de registros */}
      <div style={{ marginBottom: 15 }}>
        <label><b>Mostrar:</b> </label>
        <select
          value={registrosPorPagina}
          onChange={(e) => {
            const value = e.target.value === "all" ? "all" : parseInt(e.target.value);
            setRegistrosPorPagina(value);
            setCurrentPage(1);
          }}
          style={{ marginLeft: 10 }}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value="all">Todos</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table className="elegant-table">
          <thead>
            <tr>
              <th style={{ display: "none" }}>ID</th>
              <th>ID Unidad</th>
              <th>ID Garantía</th>
              <th>Aseguradora</th>
              <th>Tipo Garantía</th>
              <th>No. Póliza</th>
              <th>Suma Asegurada</th>
              <th>Inicio Vigencia</th>
              <th>Vigencia</th>
              <th>Prima</th>
              <th>Archivo</th>
              <th>Usuario</th>
              <th>Fecha de Cambio</th>
            </tr>
          </thead>

          <tbody>
            {datosPagina.length > 0 ? (
              datosPagina.map((h, i) => (
                <tr key={i}>
                  <td style={{ display: "none" }}>{h.id}</td>
                  <td>{h.cve_unidad}</td>
                  <td>{h.id_garantia}</td>
                  <td>{h.aseguradora}</td>
                  <td>{h.tipo_garantia}</td>
                  <td>{h.no_poliza}</td>
                  <td>
                    ${h.suma_asegurada?.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </td>
                  <td>{h.inicio_vigencia || "-"}</td>
                  <td>{h.vigencia || "-"}</td>
                  <td>
                    ${h.prima?.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </td>
                    <td>
                      {h.url_poliza ? (
                        <button
                          onClick={() => abrirModal(h.url_poliza)}
                          className="btn btn-outline-danger btn-sm"
                          title="Ver PDF"
                        >
                          Ver PDF
                        </button>

                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{h.usuario}</td>
                    <td>{h.fecha_cambio}</td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="13" style={{ textAlign: "center" }}>
                  No hay registros disponibles
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* TARJETAS */}
      <div className="card-wrapper">
        {datosPagina.length === 0 ? (
          <p className="mensaje-estado">No hay registros disponibles.</p>
        ) : (
          datosPagina.map((h, i) => (
            <div key={i} className="unidad-card">
              <h3>Garantía ID: {h.id_garantia} (Unidad {h.id_unidad})</h3>
              <p><b>Aseguradora:</b> {h.aseguradora || "—"}</p>
              <p><b>Tipo Garantía:</b> {h.tipo_garantia || "—"}</p>
              <p><b>No. Póliza:</b> {h.no_poliza || "—"}</p>
              <p><b>Suma Asegurada:</b> {h.suma_asegurada ? `$${h.suma_asegurada.toLocaleString("es-MX", { minimumFractionDigits: 2 })}` : "—"}</p>
              <p><b>Inicio Vigencia:</b> {h.inicio_vigencia || "—"}</p>
              <p><b>Vigencia:</b> {h.vigencia || "—"}</p>
              <p><b>Prima:</b> {h.prima ? `$${h.prima.toLocaleString("es-MX", { minimumFractionDigits: 2 })}` : "—"}</p>
              <p>
                <b>Archivo:</b>{" "}
                {h.url_poliza ? (
                  <button
                    onClick={() => abrirModal((`${API_URL}/${h.url_poliza}`))}
                    className="btn btn-outline-danger btn-sm"
                    title="Ver PDF"
                  >
                    Ver PDF
                  </button>
                ) : "—"}
              </p>
              <p><b>Usuario:</b> {h.usuario || "—"}</p>
              <p><b>Fecha de Cambio:</b> {h.fecha_cambio || "—"}</p>
            </div>
          ))
        )}
      </div>

      {/* PAGINACIÓN */}
      {totalPaginas > 1 && registrosPorPagina !== "all" && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Anterior
          </button>

          {[...Array(totalPaginas)].map((_, i) => (
            <button
              key={i}
              className={currentPage === i + 1 ? "active" : ""}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPaginas}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Siguiente
          </button>
        </div>
      )}

      {modalUrl && <ModalFile url={modalUrl} onClose={cerrarModal} />}
    </div>
  );
}
