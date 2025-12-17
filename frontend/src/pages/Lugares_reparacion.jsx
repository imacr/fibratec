import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Modal from "../components/Modal";
import { API_URL } from "../config";

import "./Unidades.css";
import "./Placas.css";

export default function LugaresReparacion() {
  const [lugares, setLugares] = useState([]);
  const [edit, setEdit] = useState(null);
  const [showRegistro, setShowRegistro] = useState(false);
  const [form, setForm] = useState({});
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // ==============================
  // Carga de lugares
  // ==============================
  useEffect(() => {
    fetchLugares();
  }, []);

  const fetchLugares = async () => {
    try {
      const res = await fetch(`${API_URL}/lugares`);
      const data = await res.json();
      setLugares(data || []);
    } catch {
      Swal.fire("Error", "No se pudieron cargar los lugares de reparación", "error");
    }
  };

  // ==============================
  // Formulario
  // ==============================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleRegistro = async () => {
    if (!form.nombre_lugar) return Swal.fire("Advertencia", "El nombre es obligatorio", "warning");
    try {
      const res = await fetch(`${API_URL}/lugares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) return Swal.fire("Error", data.error || "Error al registrar lugar", "error");

      Swal.fire("Éxito", "Lugar registrado correctamente", "success");
      setForm({});
      setShowRegistro(false);
      fetchLugares();
    } catch {
      Swal.fire("Error", "No se pudo registrar el lugar", "error");
    }
  };

  const handleEdit = (lugar) => {
    setEdit(lugar);
    setForm({ ...lugar });
  };

  const handleActualizar = async () => {
    if (!edit) return;
    try {
      const res = await fetch(`${API_URL}/lugares/${edit.id_lugar}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) return Swal.fire("Error", data.error || "Error al actualizar lugar", "error");

      Swal.fire("Éxito", "Lugar actualizado correctamente", "success");
      setEdit(null);
      setForm({});
      fetchLugares();
    } catch {
      Swal.fire("Error", "No se pudo actualizar el lugar", "error");
    }
  };

  const handleEliminar = async (id_lugar) => {
    const result = await Swal.fire({
      title: "¿Seguro que quieres eliminar este lugar?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/lugares/${id_lugar}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) return Swal.fire("Error", data.error || "Error al eliminar lugar", "error");

      Swal.fire("Éxito", "Lugar eliminado correctamente", "success");
      fetchLugares();
    } catch {
      Swal.fire("Error", "No se pudo eliminar el lugar", "error");
    }
  };

  // ==============================
  // Paginación
  // ==============================
  const totalPages = itemsPerPage === "todos" ? 1 : Math.ceil(lugares.length / itemsPerPage);
  const indiceInicial = itemsPerPage === "todos" ? 0 : (page - 1) * itemsPerPage;
  const indiceFinal = itemsPerPage === "todos" ? lugares.length : indiceInicial + itemsPerPage;
  const lugaresPaginados = itemsPerPage === "todos" ? lugares : lugares.slice(indiceInicial, indiceFinal);

  return (
    <div className="unidades-container">
      <h1>Lugares de Reparación</h1>

      <button className="btn-registrar-garantia" onClick={() => setShowRegistro(true)}>
        Registrar Nuevo Lugar
      </button>

      {/* Selector Mostrar */}
      <div className="paginacion-controles">
        <label>Mostrar:</label>
        <select
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(e.target.value === "todos" ? "todos" : parseInt(e.target.value));
            setPage(1);
          }}
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="todos">Todos</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="table-wrapper">
        <table className="elegant-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Dirección</th>
              <th>Contacto</th>
              <th>Observaciones</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lugaresPaginados.length > 0 ? (
              lugaresPaginados.map(l => (
                <tr key={l.id_lugar}>
                  <td>{l.id_lugar}</td>
                  <td>{l.nombre_lugar}</td>
                  <td>{l.tipo_lugar}</td>
                  <td>{l.direccion}</td>
                  <td>{l.contacto}</td>
                  <td>{l.observaciones}</td>
                  <td>
                    <button onClick={() => handleEdit(l)}>Editar</button>
                    <button onClick={() => handleEliminar(l.id_lugar)}>Eliminar</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>No hay lugares registrados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Tarjetas */}
      <div className="card-wrapper">
        {lugaresPaginados.map(l => (
          <div key={l.id_lugar} className="unidad-card">
            <p><b>ID:</b> {l.id_lugar}</p>
            <p><b>Nombre:</b> {l.nombre_lugar}</p>
            <p><b>Tipo:</b> {l.tipo_lugar}</p>
            <p><b>Dirección:</b> {l.direccion}</p>
            <p><b>Contacto:</b> {l.contacto}</p>
            <p><b>Observaciones:</b> {l.observaciones}</p>
            <button onClick={() => handleEdit(l)}>Editar</button>
            <button onClick={() => handleEliminar(l.id_lugar)}>Eliminar</button>
          </div>
        ))}
      </div>

      {/* Paginación */}
      {itemsPerPage !== "todos" && (
        <div className="pagination">
          <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>Anterior</button>
          <span>Página {page} de {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}>Siguiente</button>
        </div>
      )}

      {/* Modal Registro */}
      {showRegistro && (
        <Modal onClose={() => setShowRegistro(false)}>
          <div className="edit-placa-container">
            <h2>Registrar Lugar</h2>
            <div className="form-group">
              <label>Nombre</label>
              <input name="nombre_lugar" value={form.nombre_lugar || ""} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Dirección</label>
              <input name="direccion" value={form.direccion || ""} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Contacto</label>
              <input name="contacto" value={form.contacto || ""} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Observaciones</label>
              <input name="observaciones" value={form.observaciones || ""} onChange={handleChange} />
            </div>
            <div style={{ marginTop: 10 }}>
              <button onClick={handleRegistro}>Registrar</button>
              <button onClick={() => setShowRegistro(false)} style={{ marginLeft: 5 }}>Cancelar</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Edición */}
      {edit && (
        <Modal onClose={() => setEdit(null)}>
          <div className="edit-placa-container">
            <h2>Editar Lugar {edit.id_lugar}</h2>
            <div className="form-group">
              <label>Nombre</label>
              <input name="nombre_lugar" value={form.nombre_lugar || ""} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Dirección</label>
              <input name="direccion" value={form.direccion || ""} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Contacto</label>
              <input name="contacto" value={form.contacto || ""} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Observaciones</label>
              <input name="observaciones" value={form.observaciones || ""} onChange={handleChange} />
            </div>
            <div style={{ marginTop: 10 }}>
              <button onClick={handleActualizar}>Actualizar</button>
              <button onClick={() => setEdit(null)} style={{ marginLeft: 5 }}>Cancelar</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
