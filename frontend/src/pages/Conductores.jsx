import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Modal from "../components/Modal";
import { API_URL } from "../config";
import "./Unidades.css";
import { FaSearch } from "react-icons/fa";


export default function Conductores() {
  const [choferes, setChoferes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const [formData, setFormData] = useState({
    id_chofer: null,
    id_usuario: "",
    curp: "",
    calle: "",
    colonia_localidad: "",
    codpos: "",
    municipio: "",
    licencia_folio: "",
    licencia_tipo: "",
    licencia_vigencia: ""
  });

  /* ================== FETCH ================== */
  const fetchChoferes = async () => {
    const res = await fetch(`${API_URL}/conductores`);
    setChoferes(await res.json());
  };

  const fetchUsuarios = async () => {
    const res = await fetch(`${API_URL}/usuarios/sin-chofer`);
    setUsuarios(await res.json());
  };

  useEffect(() => {
    fetchChoferes();
    fetchUsuarios();
  }, []);

  /* ================== HANDLERS ================== */
  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleEdit = c => {
    setFormData({ ...c });
    setModalOpen(true);
  };

  const handleDelete = async id => {
    const ok = await Swal.fire({
      title: "¿Eliminar conductor?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar"
    });

    if (!ok.isConfirmed) return;

    await fetch(`${API_URL}/choferes/${id}`, { method: "DELETE" });

    await Swal.fire({
      icon: "success",
      title: "Conductor eliminado",
      confirmButtonText: "Aceptar"
    });

    fetchChoferes();
    fetchUsuarios();
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const isEdit = Boolean(formData.id_chofer);
    const method = isEdit ? "PUT" : "POST";
    const url = isEdit
      ? `${API_URL}/choferes/${formData.id_chofer}`
      : `${API_URL}/choferes`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    const data = await res.json();

    if (!res.ok) {
      Swal.fire("Error", data.error || "Ocurrió un error", "error");
      return;
    }

    await Swal.fire({
      icon: "success",
      title: isEdit ? "Conductor actualizado" : "Conductor registrado",
      confirmButtonText: "Aceptar"
    });

    setModalOpen(false);
    setFormData({
      id_chofer: null,
      id_usuario: "",
      curp: "",
      calle: "",
      colonia_localidad: "",
      codpos: "",
      municipio: "",
      licencia_folio: "",
      licencia_tipo: "",
      licencia_vigencia: ""
    });

    fetchChoferes();
    fetchUsuarios();
  };

  /* ================== FILTRO + PAGINACIÓN ================== */
  const filteredChoferes = choferes.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.curp.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredChoferes.length / itemsPerPage);

  const paginatedChoferes = filteredChoferes.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  /* ================== UI ================== */
  return (
    <div className="unidades-container">
      <h1>Conductores</h1>

      <button
        className="btn-registrar-garantia"
        onClick={() => setModalOpen(true)}
      >
        Agregar Conductor
      </button>

      <div className="search-box">
  <FaSearch className="search-icon" />
  <input
    type="text"
    placeholder="Buscar por nombre o CURP"
    value={search}
    onChange={e => {
      setSearch(e.target.value);
      setPage(1);
    }}
  />
</div>

      {/* ===== TABLA ESCRITORIO ===== */}
      <div className="table-wrapper">
        <table className="elegant-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>CURP</th>
              <th>Licencia</th>
              <th>Vigencia</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedChoferes.map(c => (
              <tr key={c.id_chofer}>
                <td>{c.id_chofer}</td>
                <td>{c.nombre}</td>
                <td>{c.curp}</td>
                <td>{c.licencia_tipo}</td>
                <td>{c.licencia_vigencia}</td>
                <td>
                  <button className="icon-edit" onClick={() => handleEdit(c)}>✎</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== TARJETAS MÓVIL ===== */}
      <div className="card-wrapper">
        {paginatedChoferes.map(c => (
          <div className="unidad-card" key={c.id_chofer}>
            <h3>{c.nombre}</h3>
            <p><strong>CURP:</strong> {c.curp}</p>
            <p><strong>Licencia:</strong> {c.licencia_tipo}</p>
            <p><strong>Vigencia:</strong> {c.licencia_vigencia}</p>

            <div className="card-actions">
              <button onClick={() => handleEdit(c)}>Editar</button>
            </div>
          </div>
        ))}
      </div>

      {/* ===== PAGINACIÓN ===== */}
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Anterior
        </button>

        <span>Página {page} de {totalPages}</span>

        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
          Siguiente
        </button>
      </div>

      {/* ===== MODAL ===== */}
      {modalOpen && (
        <Modal onClose={() => setModalOpen(false)}>
          <h2>{formData.id_chofer ? "Editar" : "Registrar"} Conductor</h2>

          <form className="form-container" onSubmit={handleSubmit}>
            {!formData.id_chofer && (
              <select
                name="id_usuario"
                value={formData.id_usuario}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona usuario</option>
                {usuarios.map(u => (
                  <option key={u.id_usuario} value={u.id_usuario}>
                    {u.nombre}
                  </option>
                ))}
              </select>
            )}

            <input name="curp" placeholder="CURP" value={formData.curp} onChange={handleChange} required />
            <input name="calle" placeholder="Calle" value={formData.calle} onChange={handleChange} />
            <input name="colonia_localidad" placeholder="Colonia" value={formData.colonia_localidad} onChange={handleChange} />
            <input name="codpos" placeholder="Código Postal" value={formData.codpos} onChange={handleChange} />
            <input name="municipio" placeholder="Municipio" value={formData.municipio} onChange={handleChange} />
            <input name="licencia_folio" placeholder="Folio Licencia" value={formData.licencia_folio} onChange={handleChange} />
            <input name="licencia_tipo" placeholder="Tipo Licencia" value={formData.licencia_tipo} onChange={handleChange} />
            <input type="date" name="licencia_vigencia" value={formData.licencia_vigencia} onChange={handleChange} />

            <button className="btn-registrar-garantia">Guardar</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
