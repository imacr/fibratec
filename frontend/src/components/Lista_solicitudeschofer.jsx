import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config"; // Ajusta la ruta según la ubicación del archivo
import "./SolicitudForm"; // Asegúrate de tener los estilos CSS aquí

export default function ListaSolicitudesChofer() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();


  const idChofer = localStorage.getItem("usuarioId");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const itemsPerPageOptions = [5, 10, 15, 20];

  useEffect(() => {
    if (!idChofer) {
      setError("No se pudo identificar al usuario logueado.");
      setLoading(false);
      return;
    }

    const fetchSolicitudes = async () => {
      try {
        const res = await fetch(`${API_URL}/solicitudes/chofer/${idChofer}`);
        if (!res.ok) throw new Error("Error al cargar solicitudes");
        const data = await res.json();
        setSolicitudes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitudes();
  }, [idChofer]);

  if (loading) return <p>Cargando solicitudes...</p>;
  if (error) return <p>Error: {error}</p>;
  if (solicitudes.length === 0) return <p>No tienes solicitudes.</p>;

  // Paginación lógica
  const totalPages = Math.ceil(solicitudes.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = solicitudes.slice(indexOfFirstItem, indexOfLastItem);

  const handleContinuar = (id) => {
    console.log("Continuar con solicitud:", id);
    // Aquí puedes abrir el formulario paso 2
  };

  return (
    <div className="unidades-container">
      <h1><i className="fa-solid fa-car-side"></i> Mis Solicitudes</h1>

      <div className="pagination-controls">
        <label className='pagination-label'>
          Mostrar:
          <select className="pagination-select"
            value={itemsPerPage}
            onChange={e => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            {itemsPerPageOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </label>

        <button 
        className="btn-open-modal btn-registrar-garantia"
        onClick={() => navigate("/chofer/solicitudes")}
        >
        Ir a Solicitud
        </button>
      </div>

      <div className="table-wrapper">
        <table className="elegant-table">
          <thead>
            <tr>
              <th>Unidad</th>
              <th>Pieza</th>
              <th>Estado</th>
              <th>Completada</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((s) => (
              <tr key={s.id_solicitud}>
                <td>{s.unidad}</td>
                <td>{s.pieza}</td>
                <td>{s.estado}</td>
                <td>{s.completada ? "Sí" : "No"}</td>
                <td>
                  {s.estado === "aprobada" && !s.completada && (
                    <button className="submit-btn" onClick={() => handleContinuar(s.id_solicitud)}>
                      Continuar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
            disabled={currentPage === 1}
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <span>Página {currentPage} de {totalPages}</span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
            disabled={currentPage === totalPages}
          >
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      )}
    </div>
  );
}
