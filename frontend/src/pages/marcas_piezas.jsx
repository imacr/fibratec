import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Modal from "../components/Modal";
import { API_URL } from "../config";

import "./Unidades.css";
import "./Placas.css";

export default function Marcas() {
  const [marcas, setMarcas] = useState([]);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({});

  // Paginación
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    fetchMarcas();
  }, []);

  const fetchMarcas = async () => {
    try {
      const res = await fetch(`${API_URL}/marcas`);
      const data = await res.json();
      setMarcas(data || []);
    } catch (err) {
      Swal.fire("Error", "No se pudieron cargar las marcas", "error");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleRegistro = async () => {
    if (!form.nombre_marca) return Swal.fire("Advertencia", "El nombre es obligatorio", "warning");
    try {
      const res = await fetch(`${API_URL}/marcas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) return Swal.fire("Error", data.error || "Error al registrar marca", "error");

      Swal.fire("Éxito", "Marca registrada correctamente", "success");
      setForm({});
      fetchMarcas();
    } catch {
      Swal.fire("Error", "No se pudo registrar la marca", "error");
    }
  };

  const handleActualizar = async () => {
    if (!edit) return;
    try {
      const res = await fetch(`${API_URL}/marcas/${edit.id_marca}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) return Swal.fire("Error", data.error || "Error al actualizar marca", "error");

      Swal.fire("Éxito", "Marca actualizada correctamente", "success");
      setEdit(null);
      setForm({});
      fetchMarcas();
    } catch {
      Swal.fire("Error", "No se pudo actualizar la marca", "error");
    }
  };

  const handleEliminar = async (id_marca) => {
    const result = await Swal.fire({
      title: "¿Seguro que quieres eliminar esta marca?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/marcas/${id_marca}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) return Swal.fire("Error", data.error || "Error al eliminar marca", "error");

      Swal.fire("Éxito", "Marca eliminada correctamente", "success");
      fetchMarcas();
    } catch {
      Swal.fire("Error", "No se pudo eliminar la marca", "error");
    }
  };

  // ======================
  // Paginación
  // ======================
  const totalPages = itemsPerPage === "todos" ? 1 : Math.ceil(marcas.length / itemsPerPage);
  const startIndex = itemsPerPage === "todos" ? 0 : (page - 1) * itemsPerPage;
  const endIndex = itemsPerPage === "todos" ? marcas.length : startIndex + itemsPerPage;
  const marcasPaginadas = itemsPerPage === "todos" ? marcas : marcas.slice(startIndex, endIndex);

  return (
    <div className="unidades-container">
      <h1>Marcas de Piezas</h1>

      {/* Botón Registro */}
      {!edit && (
        <button className="btn-registrar-garantia" onClick={() => setEdit({})}>
          Registrar Marca
        </button>
      )}

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
              <th>País Origen</th>
              <th>Observaciones</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {marcasPaginadas.map(m => (
              <tr key={m.id_marca}>
                <td>{m.id_marca}</td>
                <td>{m.nombre_marca}</td>
                <td>{m.pais_origen}</td>
                <td>{m.observaciones}</td>
                <td>
                  <button onClick={() => setEdit(m)}>Editar</button>
                  <button onClick={() => handleEliminar(m.id_marca)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tarjetas */}
      <div className="card-wrapper">
        {marcasPaginadas.map(m => (
          <div key={m.id_marca} className="unidad-card">
            <p><b>ID:</b> {m.id_marca}</p>
            <p><b>Nombre:</b> {m.nombre_marca}</p>
            <p><b>País Origen:</b> {m.pais_origen}</p>
            <p><b>Observaciones:</b> {m.observaciones}</p>
            <button onClick={() => setEdit(m)}>Editar</button>
            <button onClick={() => handleEliminar(m.id_marca)}>Eliminar</button>
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

      {/* Modal Registro / Edición */}
      {edit && (
        <Modal onClose={() => { setEdit(null); setForm({}); }}>
          <div className="edit-placa-container">
            <h2>{edit.id_marca ? `Editar Marca ${edit.id_marca}` : "Registrar Marca"}</h2>
            <div className="form-group">
              <label>Nombre</label>
              <input name="nombre_marca" value={form.nombre_marca || ""} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>País de Origen</label>
              <input name="pais_origen" value={form.pais_origen || ""} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Observaciones</label>
              <input name="observaciones" value={form.observaciones || ""} onChange={handleChange} />
            </div>
            <div style={{ marginTop: 10 }}>
              <button onClick={edit.id_marca ? handleActualizar : handleRegistro}>
                {edit.id_marca ? "Actualizar" : "Registrar"}
              </button>
              <button onClick={() => { setEdit(null); setForm({}); }} style={{ marginLeft: 5 }}>Cancelar</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
