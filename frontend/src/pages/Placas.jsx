import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Modal from "../components/Modal";
import ModalFile from "../components/ModalFile";
import { API_URL } from "../config";
import "./Unidades.css";
import "./Placas.css";

export default function Placas() {
  const [placas, setPlacas] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({});
  const [unidadValida, setUnidadValida] = useState(false);
  const [fileModalUrl, setFileModalUrl] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10); 
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchPlacas();
    fetchUnidades();
  }, [page]);

  const fetchPlacas = async () => {
    try {
      const res = await fetch(`${API_URL}/placas?page=${page}&per_page=${perPage}`);
      const data = await res.json();
      setPlacas(data.placas || []);
      setTotal(data.total || 0);
    } catch (err) {
      Swal.fire("Error", "No se pudieron cargar las placas", "error");
    }
  };

  const fetchUnidades = async () => {
    try {
      const res = await fetch(`${API_URL}/unidades`);
      const data = await res.json();
      setUnidades(data || []);
    } catch (err) {
      Swal.fire("Error", "No se pudieron cargar las unidades", "error");
    }
  };
const verificarUnidad = async () => {
  if (!form.id_unidad)
    return Swal.fire("Advertencia", "Debes ingresar el ID de la unidad", "warning");

  const unidad = unidades.find(u => u.id_unidad.toString() === form.id_unidad.toString());
  if (!unidad) {
    setUnidadValida(false);
    return Swal.fire("Error", "La unidad no existe", "error");
  }

  try {
    const res = await fetch(`${API_URL}/placas?id_unidad=${form.id_unidad}`);
    const data = await res.json();
    const placasUnidad = data.placas || [];

    if (placasUnidad.length === 0) {
      setUnidadValida(true);
      return Swal.fire(
        "Unidad válida ✅",
        "No existe placa activa, puedes registrar nueva placa",
        "success"
      );
    }

    const hoy = new Date();
    let puedeRegistrar = true;

    // Recorremos cada placa para ver su vigencia
    for (const placa of placasUnidad) {
      if (!placa.fecha_vigencia) continue; // ignorar si no tiene vigencia

      const fechaVigencia = new Date(placa.fecha_vigencia);
      const diasRestantes = Math.ceil((fechaVigencia - hoy) / (1000 * 60 * 60 * 24));

      // Si alguna placa tiene más de 180 días de vigencia, bloqueamos
      if (diasRestantes > 180) {
        puedeRegistrar = false;
        const fechaFormateada = new Intl.DateTimeFormat("es-MX", {
          day: "numeric",
          month: "long",
          year: "numeric"
        }).format(fechaVigencia);

        setUnidadValida(false);
        return Swal.fire({
          title: "Unidad válida ⚠️",
          html: `No puedes registrar nueva placa.<br><strong>Placa ${placa.placa} vigente hasta:</strong> ${fechaFormateada}`,
          icon: "info"
        });
      }
    }

    // Si todas las placas están próximas a vencer o sin vigencia
    if (puedeRegistrar) {
      setUnidadValida(true);
      Swal.fire(
        "Unidad válida ✅",
        "Puedes registrar nueva placa de reemplazo",
        "success"
      );
    }

  } catch (err) {
    console.error(err);
    Swal.fire("Error", "No se pudo verificar la unidad", "error");
  }
};




  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.files[0] });
  };

  const handleRegistro = async () => {
    if (!unidadValida) return Swal.fire("Advertencia", "Verifica primero la unidad", "warning");
    if (!form.placa || !form.fecha_vigencia) return Swal.fire("Advertencia", "Placa y fecha de vigencia son obligatorias", "warning");

    const fd = new FormData();
    Object.keys(form).forEach((k) => {
      if (form[k] !== undefined && form[k] !== null) fd.append(k, form[k]);
    });

    try {
      const res = await fetch(`${API_URL}/placas/registrar`, { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json();
        return Swal.fire("Error", err.error || "Error al registrar nueva placa", "error");
      }
      Swal.fire("Éxito", "Nueva placa registrada correctamente", "success");
      setForm({});
      setUnidadValida(false);
      fetchPlacas();
    } catch (err) {
      Swal.fire("Error", "No se pudo registrar la nueva placa", "error");
    }
  };

  const handleEdit = (p) => {
    setEdit(p);
    setForm({
      ...p,
      id_unidad: p.id_unidad || "",
      placa: p.placa || "",
      folio: p.folio || "",
      fecha_expedicion: p.fecha_expedicion || "",
      fecha_vigencia: p.fecha_vigencia || "",
      url_placa_frontal: null,
      url_placa_trasera: null,
    });
  };

  const handleActualizar = async () => {
    if (!edit) return;
    const fd = new FormData();
    Object.keys(form).forEach((k) => {
      if (form[k] !== undefined && form[k] !== null) fd.append(k, form[k]);
    });

    try {
      const res = await fetch(`${API_URL}/placas/${edit.id_placa}`, { method: "PUT", body: fd });
      if (!res.ok) {
        const err = await res.json();
        return Swal.fire("Error", err.error || "Error al actualizar placa", "error");
      }
      Swal.fire("Éxito", "Placa actualizada correctamente", "success");
      setEdit(null);
      setForm({});
      fetchPlacas();
    } catch (err) {
      Swal.fire("Error", "No se pudo actualizar la placa", "error");
    }
  };

  const handleEliminar = async (id_placa) => {
    const result = await Swal.fire({
      title: '¿Seguro que quieres eliminar esta placa?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/placas/${id_placa}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        return Swal.fire("Error", err.error || "Error al eliminar placa", "error");
      }
      Swal.fire("Éxito", "Placa eliminada correctamente", "success");
      fetchPlacas();
    } catch (err) {
      Swal.fire("Error", "No se pudo eliminar la placa", "error");
    }
  };

  return (
    <div className="unidades-container">
      <h1>Placas</h1>

      {/* Verificar Unidad y Registrar Nueva Placa */}
      <div className="mb-3">
        <input
          type="number"
          placeholder="ID Unidad"
          name="id_unidad"
          value={form.id_unidad || ""}
          onChange={handleChange}
        />
        <button onClick={verificarUnidad}>Verificar Unidad</button>
        {unidadValida && <span style={{ marginLeft: 10, color: "green" }}>Unidad válida ✅</span>}
      </div>

      {unidadValida && !edit && (
        <div style={{ border: "1px solid #ccc", padding: 10, marginBottom: 20 }}>
          <h3>Registrar Nueva Placa</h3>
          <div>
            <label>Placa:</label>
            <input name="placa" value={form.placa || ""} onChange={handleChange} />
          </div>
          <div>
            <label>Folio:</label>
            <input name="folio" value={form.folio || ""} onChange={handleChange} />
          </div>
          <div>
            <label>Fecha Expedición:</label>
            <input type="date" name="fecha_expedicion" value={form.fecha_expedicion || ""} onChange={handleChange} />
          </div>
          <div>
            <label>Fecha Vigencia:</label>
            <input type="date" name="fecha_vigencia" value={form.fecha_vigencia || ""} onChange={handleChange} />
          </div>
          <div>
            <label>Frontal:</label>
            <input type="file" name="url_placa_frontal" onChange={handleFileChange} />
          </div>
          <div>
            <label>Trasera:</label>
            <input type="file" name="url_placa_trasera" onChange={handleFileChange} />
          </div>
          <div style={{ marginTop: 10 }}>
            <button onClick={handleRegistro}>Registrar Nueva Placa</button>
          </div>
        </div>
      )}

      {/* Tabla y modal de edición se mantiene igual */}

      {/* Tabla de placas */}
      <div className="table-wrapper">
        <table className="elegant-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Unidad</th>
              <th>Placa</th>
              <th>Folio</th>
              <th>Expedición</th>
              <th>Vigencia</th>
              <th>Frontal</th>
              <th>Trasera</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {placas.map((p) => (
              <tr key={p.id_placa}>
                <td>{p.id_placa}</td>
                <td>{p.id_unidad || "N/A"}</td>
                <td>{p.placa}</td>
                <td>{p.folio}</td>
                <td>{p.fecha_expedicion ? new Date(p.fecha_expedicion).toLocaleDateString('es-MX') : "N/A"}</td>
                <td>{p.fecha_vigencia ? new Date(p.fecha_vigencia).toLocaleDateString('es-MX') : "N/A"}</td>
                <td>
                  {p.url_placa_frontal ? (
                    <button  className="btn btn-outline-danger btn-sm" onClick={() => setFileModalUrl(`${API_URL}/${p.url_placa_frontal}`)}>Ver PDF</button>
                  ) : "N/A"}
                </td>
                <td>
                  {p.url_placa_trasera ? (
                    <button  className="btn btn-outline-danger btn-sm" onClick={() => setFileModalUrl(`${API_URL}/${p.url_placa_trasera}`)}>Ver PDF</button>
                  ) : "N/A"}
                </td>
                <td>
                <div className="actions-container">
                    <button onClick={() => handleEdit(p)}>
                    <i className="fa-solid fa-pen-to-square icon-edit"></i>
                    </button>
                    <button onClick={() => handleEliminar(p.id_placa)}>
                    <i className="fa-solid fa-trash icon-delete"></i>
                    </button>
                </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal edición */}
      {edit && (
        <Modal onClose={() => setEdit(null)}>
<div className="edit-placa-container">
  <h2>Editar Placa {edit.id_placa}</h2>
  <div>
    <label>Unidad:</label>
    <select name="id_unidad" value={form.id_unidad} onChange={handleChange}>
      <option value="">Seleccione unidad</option>
      {unidades.map((u) => (
        <option key={u.id_unidad} value={u.id_unidad}>
          {u.vehiculo} {u.marca} {u.modelo}
        </option>
      ))}
    </select>
  </div>
  <div>
    <label>Placa:</label>
    <input name="placa" value={form.placa} onChange={handleChange} />
  </div>
  <div>
    <label>Folio:</label>
    <input name="folio" value={form.folio} onChange={handleChange} />
  </div>
  <div>
    <label>Fecha Expedición:</label>
    <input type="date" name="fecha_expedicion" value={form.fecha_expedicion || ""} onChange={handleChange} />
  </div>
  <div>
    <label>Fecha Vigencia:</label>
    <input type="date" name="fecha_vigencia" value={form.fecha_vigencia || ""} onChange={handleChange} />
  </div>
  <div>
    <label>Frontal:</label>
    <input type="file" name="url_placa_frontal" onChange={handleFileChange} />
  </div>
  <div>
    <label>Trasera:</label>
    <input type="file" name="url_placa_trasera" onChange={handleFileChange} />
  </div>
  <div style={{ marginTop: 10 }}>
    <button onClick={handleActualizar}>Actualizar</button>
    <button onClick={() => setEdit(null)} style={{ marginLeft: 5 }}>Cancelar</button>
  </div>
</div>
        </Modal>
      )}

      {/* Modal de previsualización */}
      {fileModalUrl && <ModalFile url={fileModalUrl} onClose={() => setFileModalUrl(null)} />}

      {/* Paginación */}
      <div className="pagination-controls" style={{ marginTop: 10 }}>
        <button onClick={() => setPage(Math.max(page - 1, 1))} disabled={page === 1}>Anterior</button>
        <button onClick={() => setPage(page * perPage < total ? page + 1 : page)} disabled={page * perPage >= total}>Siguiente</button>
      </div>
    </div>
  );
}
