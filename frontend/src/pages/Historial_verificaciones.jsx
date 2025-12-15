import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { API_URL } from "../config";
import ModalFile from "../components/ModalFile";

export default function HistorialVerificaciones() {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalUrl, setModalUrl] = useState(null);

  // Paginación y búsqueda
  const [search, setSearch] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

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

  // Filtro de búsqueda
  const filtered = historial.filter((item) => {
    const placa = item.unidad?.placa || "";
    const nombre = item.unidad?.nombre || "";
    const holo = item.holograma || "";

    return (
      placa.toLowerCase().includes(search.toLowerCase()) ||
      nombre.toLowerCase().includes(search.toLowerCase()) ||
      holo.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Lógica de paginación
  let totalPages = 1;
  let currentItems = filtered;

  if (itemsPerPage !== "Todos") {
    const perPage = Number(itemsPerPage);
    totalPages = Math.ceil(filtered.length / perPage);
    const indexLast = currentPage * perPage;
    const indexFirst = indexLast - perPage;
    currentItems = filtered.slice(indexFirst, indexLast);
  }

  if (loading) return <p className="mensaje-estado">Cargando historial...</p>;

  return (
    <div className="unidades-container">
      <h1>Historial de Verificaciones Vehiculares</h1>

      {/* Filtros */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Buscar por placa, unidad o holograma..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />

        <select
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value="Todos">Todos</option>
        </select>
      </div>

      {/* Tabla */}
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
            {currentItems.map((item) => (
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
                      Verificación 1
                    </button>
                  ) : "—"}
                </td>
                <td>
                  {item.url_verificacion_2 ? (
                    <button className="btn-pdf" onClick={() => abrirPDF(item.url_verificacion_2)}>
                      Verificación 2
                    </button>
                  ) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards responsive */}
      <div className="card-wrapper">
        {currentItems.map((item) => (
          <div key={item.id_historial} className="unidad-card">
            <h3>
              {item.unidad ? `${item.unidad.nombre} / ${item.unidad.placa || "Sin placa"}` : "Sin unidad"}
            </h3>
            <p><b>ID Verificación:</b> {item.id_verificacion}</p>
            <p><b>Holograma:</b> {item.holograma || "—"}</p>
            <p><b>Periodo 1:</b> {item.periodo_1_real || "—"}</p>
            <p><b>Periodo 2:</b> {item.periodo_2_real || "—"}</p>
            <p><b>Fecha cambio:</b> {new Date(item.fecha_cambio).toLocaleDateString()}</p>
            <p><b>Usuario:</b> {item.usuario || "sistema"}</p>
            <p>
              <b>Comprobante 1:</b>{" "}
              {item.url_verificacion_1 ? (
                <button className="btn-pdf" onClick={() => abrirPDF(item.url_verificacion_1)}>
                  Verificación 1
                </button>
              ) : "—"}
            </p>
            <p>
              <b>Comprobante 2:</b>{" "}
              {item.url_verificacion_2 ? (
                <button className="btn-pdf" onClick={() => abrirPDF(item.url_verificacion_2)}>
                  Verificación 2
                </button>
              ) : "—"}
            </p>
          </div>
        ))}
      </div>

      {/* Paginación */}
      <div className="pagination">
        {itemsPerPage !== "Todos" && (
          <>
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
              Anterior
            </button>
            <span>Página {currentPage} de {totalPages}</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Siguiente
            </button>
          </>
        )}
      </div>

      {modalUrl && <ModalFile url={modalUrl} onClose={() => setModalUrl(null)} />}
    </div>
  );
}
