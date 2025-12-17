import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Modal from "../components/Modal";
import { API_URL } from "../config";

import "./Unidades.css";
import "./Placas.css";

export default function Piezas() {
  const [piezas, setPiezas] = useState([]);
  const [edit, setEdit] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [form, setForm] = useState({});
  const [page, setPage] = useState(1);
  const [itemsPerPageOptions] = useState([5, 10, 20]);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [total, setTotal] = useState(0);
  const [filtroBusqueda, setFiltroBusqueda] = useState("");

  const totalPages = Math.ceil(total / itemsPerPage) || 1;

  useEffect(() => {
    fetchPiezas();
  }, []);

  const fetchPiezas = async () => {
    try {
      const res = await fetch(`${API_URL}/piezas`);
      const data = await res.json();
      setPiezas(data || []);
      setTotal(data.length);
    } catch (err) {
      Swal.fire("Error", "No se pudieron cargar las piezas", "error");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleRegistro = async () => {
    if (!form.nombre_pieza) return Swal.fire("Advertencia", "El nombre de la pieza es obligatorio", "warning");
    try {
      const res = await fetch(`${API_URL}/piezas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const err = await res.json();
        return Swal.fire("Error", err.error || "Error al registrar pieza", "error");
      }
      Swal.fire("Éxito", "Pieza registrada correctamente", "success");
      setForm({});
      setShowRegisterModal(false);
      fetchPiezas();
    } catch (err) {
      Swal.fire("Error", "No se pudo registrar la pieza", "error");
    }
  };

  const handleEdit = (p) => {
    setEdit(p);
    setForm({ ...p });
  };

  const handleActualizar = async () => {
    if (!edit) return;
    try {
      const res = await fetch(`${API_URL}/piezas/${edit.id_pieza}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const err = await res.json();
        return Swal.fire("Error", err.error || "Error al actualizar pieza", "error");
      }
      Swal.fire("Éxito", "Pieza actualizada correctamente", "success");
      setEdit(null);
      setForm({});
      fetchPiezas();
    } catch (err) {
      Swal.fire("Error", "No se pudo actualizar la pieza", "error");
    }
  };

  const handleEliminar = async (id_pieza) => {
    const result = await Swal.fire({
      title: "¿Seguro que quieres eliminar esta pieza?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/piezas/${id_pieza}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        return Swal.fire("Error", err.error || "Error al eliminar pieza", "error");
      }
      Swal.fire("Éxito", "Pieza eliminada correctamente", "success");
      fetchPiezas();
    } catch (err) {
      Swal.fire("Error", "No se pudo eliminar la pieza", "error");
    }
  };

  return (
    <div className="unidades-container">
      <h1>Piezas</h1>

      <button className=" btn-registrar-garantia" onClick={() => setShowRegisterModal(true)}>Registrar Nueva Pieza</button>

      {/* Tabla */}
      <div className="table-wrapper">
        <table className="elegant-table">
          <thead>
            <tr>
              <th>ID</th><th>Nombre</th><th>Descripción</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {piezas.map(p => (
              <tr key={p.id_pieza}>
                <td>{p.id_pieza}</td>
                <td>{p.nombre_pieza}</td>
                <td>{p.descripcion}</td>
                <td>
                  <button onClick={() => handleEdit(p)}>Editar</button>
                  <button onClick={() => handleEliminar(p.id_pieza)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Registro */}
      {showRegisterModal && (
        <Modal onClose={() => setShowRegisterModal(false)}>
          <h2>Registrar Pieza</h2>
          <div className="form-group">
            <label>Nombre</label>
            <input name="nombre_pieza" value={form.nombre_pieza || ""} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <input name="descripcion" value={form.descripcion || ""} onChange={handleChange} />
          </div>
          <div style={{ marginTop: 10 }}>
            <button onClick={handleRegistro}>Registrar</button>
            <button onClick={() => setShowRegisterModal(false)} style={{ marginLeft: 5 }}>Cancelar</button>
          </div>
        </Modal>
      )}

      {/* Modal Edición */}
      {edit && (
        <Modal onClose={() => setEdit(null)}>
          <h2>Editar Pieza {edit.id_pieza}</h2>
          <div className="form-group">
            <label>Nombre</label>
            <input name="nombre_pieza" value={form.nombre_pieza || ""} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <input name="descripcion" value={form.descripcion || ""} onChange={handleChange} />
          </div>
          <div style={{ marginTop: 10 }}>
            <button onClick={handleActualizar}>Actualizar</button>
            <button onClick={() => setEdit(null)} style={{ marginLeft: 5 }}>Cancelar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
