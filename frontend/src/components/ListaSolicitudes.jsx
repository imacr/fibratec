import React, { useState, useEffect, useContext } from "react";
import Swal from "sweetalert2";
import { API_URL } from "../config";
import { NotificationContext } from "./NotificationContext"; // agregar contexto
import "./SolicitudForm.css";

export default function ListaSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { setPendientes } = useContext(NotificationContext); // usar contexto para notificaciones

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const itemsPerPageOptions = [5, 10, 15, 20];

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const Gestion = 1;

  const fetchSolicitudes = async () => {
    try {
      const res = await fetch(`${API_URL}/solicitudes`);
      if (!res.ok) throw new Error("Error al cargar solicitudes");
      const data = await res.json();
      data.sort((a, b) => new Date(b.fecha_solicitud) - new Date(a.fecha_solicitud));
      setSolicitudes(data);

      // Actualizar notificación de pendientes
      const pendientesCount = data.filter(s => s.estado === "pendiente").length;
      setPendientes(pendientesCount);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (id, aprobar) => {
    try {
      const res = await fetch(`${API_URL}/solicitudes/${id}/aprobar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aprobar }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Error al procesar solicitud");

      Swal.fire("Éxito", data.msg, "success");

      setSolicitudes(prev => {
        const nuevos = prev.filter(s => s.id_solicitud !== id);
        // Actualizar notificación de pendientes
        const pendientesCount = nuevos.filter(s => s.estado === "pendiente").length;
        setPendientes(pendientesCount);
        return nuevos;
      });

    } catch (err) {
      Swal.fire("Error", err.message || "No se pudo procesar la solicitud", "error");
    }
  };

  if (loading) return <p>Cargando solicitudes...</p>;
  if (error) return <p>Error: {error}</p>;
  if (solicitudes.length === 0) return <p>No hay solicitudes registradas</p>;

  // Paginación lógica
  const totalPages = Math.ceil(solicitudes.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = solicitudes.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="unidades-container">
      <h1><i className="fa-solid fa-car-side"></i> Registro de Solicitudes</h1>

      {/* Controles de paginación */}
      <div className="pagination-controls mb-2 flex justify-between items-center">
        <label className="pagination-label flex items-center">
          Mostrar:
          <select
            className="pagination-select ml-2 border rounded px-2 py-1"
            value={itemsPerPage}
            onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
          >
            {itemsPerPageOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="table-wrapper overflow-x-auto">
        <table className="elegant-table min-w-full border-collapse">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-2">Unidad</th>
              <th className="px-4 py-2">Pieza</th>
              <th className="px-4 py-2">Marca</th>
              <th className="px-4 py-2">Servicio</th>
              <th className="px-4 py-2">Descripción</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((s, index) => (
              <tr key={s.id_solicitud} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                <td className="border px-4 py-2">{s.unidad}</td>
                <td className="border px-4 py-2">{s.pieza}</td>
                <td className="border px-4 py-2">{s.marca}</td>
                <td className="border px-4 py-2">{s.tipo_servicio}</td>
                <td className="border px-4 py-2">{s.descripcion}</td>
                <td className="border px-4 py-2 font-semibold">{s.estado}</td>
                <td className="border px-4 py-2">
                  {s.estado === "pendiente" && (
                    <>
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 mr-2 rounded shadow"
                        onClick={() => handleAprobar(s.id_solicitud, true)}
                      >
                        Aceptar
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow"
                        onClick={() => handleAprobar(s.id_solicitud, false)}
                      >
                        Rechazar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación estilo chofer */}
      {totalPages > 1 && (
        <div className="pagination flex justify-center items-center mt-3 gap-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <span>Página {currentPage} de {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
          >
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      )}
    </div>
  );
}
