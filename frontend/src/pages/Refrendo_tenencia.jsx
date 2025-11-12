import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Select from "react-select";
import { API_URL } from "../config";
import Modal from "../components/Modal";
import ModalFile from "../components/ModalFile"; // <-- Importa el modal de archivos
import  "./refrendo.css"

export default function RegistroPago() {
  const [unidades, setUnidades] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [form, setForm] = useState({
    id_unidad: "",
    fecha_pago: "",
    monto: "",
    monto_refrendo: "",
    monto_tenencia: "",
    url_factura_refrendo: null,
    url_factura_tenencia: null,
    observaciones: "",
    usuario: localStorage.getItem("usuarioId") || "",
  });
  const [tipoPago, setTipoPago] = useState("REFRENDO");
  const [canRegister, setCanRegister] = useState(false);
  const [paidRefrendo, setPaidRefrendo] = useState(false);
  const [paidTenencia, setPaidTenencia] = useState(false);
  const [loadingCheck, setLoadingCheck] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editForm, setEditForm] = useState(null);

  // ----------------------------
  // Modal para visualizar archivos PDF o imagenes
  // ----------------------------
  const [showFileModal, setShowFileModal] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);

  // ----------------------------
  // Cargar unidades y pagos
  // ----------------------------
  useEffect(() => {
    fetch(`${API_URL}/unidades`)
      .then(res => res.json())
      .then(data => setUnidades(data || []))
      .catch(() => Swal.fire("Error", "No se pudieron cargar las unidades", "error"));

    fetchPagos();
  }, []);

  const fetchPagos = () => {
    fetch(`${API_URL}/refrendo_tenencia`)
      .then(res => res.json())
      .then(data => setPagos(data || []))
      .catch(() => Swal.fire("Error", "No se pudieron cargar los pagos", "error"));
  };

  // ----------------------------
  // Manejo de cambios en formularios
  // ----------------------------
  const handleChange = (e, targetForm = form, setTargetForm = setForm) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setTargetForm(prev => ({ ...prev, [name]: files[0] || null }));
    } else {
      setTargetForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFechaChange = (e, targetForm = form, setTargetForm = setForm) => {
    const fecha = e.target.value;
    setTargetForm(prev => ({ ...prev, fecha_pago: fecha }));

    if (!fecha) {
      setTipoPago("REFRENDO");
      return;
    }
    const fechaPago = new Date(fecha);
    const limiteRefrendo = new Date(fechaPago.getFullYear(), 2, 31); // 31 marzo
    setTipoPago(fechaPago > limiteRefrendo ? "AMBOS" : "REFRENDO");
  };

  // ----------------------------
  // Validar si la unidad puede pagar
  // ----------------------------
  const handleValidarUnidad = async () => {
    if (!form.id_unidad) return Swal.fire("Advertencia", "Selecciona una unidad", "warning");
    setLoadingCheck(true);
    try {
      const res = await fetch(`${API_URL}/refrendo_tenencia/check/${form.id_unidad}`);
      const data = await res.json();
      if (data.ok) {
        Swal.fire("Éxito", data.mensaje || "Se puede registrar pago", "success");
        setCanRegister(true);
        setPaidRefrendo(Boolean(data.refrendo));
        setPaidTenencia(Boolean(data.tenencia));
      } else {
        Swal.fire("Atención", data.mensaje || "No se puede registrar aún", "info");
        setCanRegister(false);
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo validar la unidad", "error");
      setCanRegister(false);
    } finally {
      setLoadingCheck(false);
    }
  };

  // ----------------------------
  // Registrar pago
  // ----------------------------
  const handleRegistro = async () => {
    if (!canRegister) return Swal.fire("Advertencia", "Primero valida la unidad", "warning");
    if (!form.fecha_pago) return Swal.fire("Advertencia", "Fecha de pago es obligatoria", "warning");

    let tipo_pago = "REFRENDO";
    const fechaPago = new Date(form.fecha_pago);
    const limiteRefrendo = new Date(fechaPago.getFullYear(), 2, 31);
    if (fechaPago > limiteRefrendo) tipo_pago = "AMBOS";

    const fd = new FormData();
    fd.append("id_unidad", form.id_unidad);
    fd.append("fecha_pago", form.fecha_pago);
    fd.append("monto", form.monto || "0");
    fd.append("monto_refrendo", form.monto_refrendo || "0");
    fd.append("tipo_pago", tipo_pago);
    if (tipo_pago === "AMBOS") fd.append("monto_tenencia", form.monto_tenencia || "0");
    if (form.url_factura_refrendo) fd.append("url_factura_refrendo", form.url_factura_refrendo);
    if (form.url_factura_tenencia && tipo_pago === "AMBOS") fd.append("url_factura_tenencia", form.url_factura_tenencia);
    fd.append("observaciones", form.observaciones || "");
    fd.append("usuario", form.usuario);

    try {
      const res = await fetch(`${API_URL}/refrendo_tenencia`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) return Swal.fire("Error", data.error || "Error al registrar pago", "error");

      Swal.fire("Éxito", data.message || "Pago registrado", "success");

      setForm({
        id_unidad: "",
        fecha_pago: "",
        monto: "",
        monto_refrendo: "",
        monto_tenencia: "",
        url_factura_refrendo: null,
        url_factura_tenencia: null,
        observaciones: "",
        usuario: localStorage.getItem("usuarioId") || "",
      });
      setTipoPago("REFRENDO");
      setCanRegister(false);
      setPaidRefrendo(false);
      setPaidTenencia(false);
      fetchPagos();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo registrar el pago", "error");
    }
  };

  // ----------------------------
  // Modal de edición
  // ----------------------------
  const getPagoByUnidad = (id) => pagos.find(p => p.id_unidad === id) || {};
  const handleEdit = (pago) => {
    setEditForm({ ...pago, usuario: localStorage.getItem("usuarioId") || "" });
    setShowModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm?.fecha_pago) return Swal.fire("Advertencia", "Fecha de pago es obligatoria", "warning");

    const fd = new FormData();
    fd.append("id_pago", editForm.id_pago);
    fd.append("fecha_pago", editForm.fecha_pago);
    fd.append("monto_refrendo", editForm.monto_refrendo || 0);
    fd.append("monto_tenencia", editForm.monto_tenencia || 0);
    fd.append("observaciones", editForm.observaciones || "");
    fd.append("usuario", editForm.usuario);
    if (editForm.url_factura_refrendo instanceof File) fd.append("url_factura_refrendo", editForm.url_factura_refrendo);
    if (editForm.url_factura_tenencia instanceof File) fd.append("url_factura_tenencia", editForm.url_factura_tenencia);

    try {
      const res = await fetch(`${API_URL}/refrendo_tenencia/${editForm.id_pago}`, { method: "PUT", body: fd });
      const data = await res.json();
      if (!res.ok) return Swal.fire("Error", data.error || "Error al actualizar pago", "error");

      Swal.fire("Éxito", data.message || "Pago actualizado", "success");
      setShowModal(false);
      setEditForm(null);
      fetchPagos();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo actualizar el pago", "error");
    }
  };

  // ----------------------------
  // Render
  // ----------------------------
  return (
    <div className="unidades-container">
      <h1>Registrar Pago Refrendo / Tenencia</h1>

      {/* Formulario principal */}
      <div className="form-container">
  {/* Unidad y Validar */}
  <div className="form-row" style={{ marginBottom: 15 }}>
    <div className="form-group" style={{ flex: 1 }}>
      <label>Unidad:</label>
      <Select
        options={unidades.map(u => ({
          value: u.id_unidad,
          label: `${u.id_unidad} - ${u.marca} ${u.vehiculo} ${u.modelo}`
        }))}
        onChange={opt => setForm(prev => ({ ...prev, id_unidad: opt.value }))}
        value={form.id_unidad ? { value: form.id_unidad, label: (() => {
          const selected = unidades.find(u => u.id_unidad === form.id_unidad);
          return selected ? `${selected.id_unidad} - ${selected.marca} ${selected.vehiculo} ${selected.modelo}` : form.id_unidad;
        })() } : null}
        isClearable
        placeholder="Busca o selecciona unidad"
        isSearchable
      />
    </div>
    <button onClick={handleValidarUnidad} disabled={loadingCheck} style={{ height: 38, alignSelf: "end" }}>
      {loadingCheck ? "Validando..." : "Validar Unidad"}
    </button>
  </div>

  {/* Campos adicionales */}
  {canRegister && (
    <>
      <div className="form-row" style={{ marginBottom: 15 }}>
        <div className="form-group">
          <label>Fecha de pago:</label>
          <input type="date" name="fecha_pago" value={form.fecha_pago} onChange={handleFechaChange} />
        </div>
        <div className="form-group">
          <label>Monto general (opcional):</label>
          <input type="number" name="monto" value={form.monto} onChange={handleChange} />
        </div>
      </div>

      {/* Refrendo */}
      {(tipoPago === "REFRENDO" || tipoPago === "AMBOS") && (
        <div style={{ padding: 10, marginBottom: 10, background: "#f9f9f9", borderRadius: 6 }}>
          <h4>REFRENDO</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Monto Refrendo:</label>
              <input type="number" name="monto_refrendo" value={form.monto_refrendo} onChange={handleChange} disabled={paidRefrendo} />
            </div>
            <div className="form-group">
              <label>Factura Refrendo (PDF):</label>
              <input type="file" name="url_factura_refrendo" accept="application/pdf" onChange={handleChange} disabled={paidRefrendo} />
            </div>
          </div>
        </div>
      )}

      {/* Tenencia */}
      {tipoPago === "AMBOS" && (
        <div style={{ padding: 10, marginBottom: 10, background: "#f0f0f0", borderRadius: 6 }}>
          <h4>TENENCIA</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Monto Tenencia:</label>
              <input type="number" name="monto_tenencia" value={form.monto_tenencia} onChange={handleChange} disabled={paidTenencia} />
            </div>
            <div className="form-group">
              <label>Factura Tenencia (PDF):</label>
              <input type="file" name="url_factura_tenencia" accept="application/pdf" onChange={handleChange} disabled={paidTenencia} />
            </div>
          </div>
        </div>
      )}

      {/* Observaciones y Usuario */}
      <div className="form-row" style={{ marginBottom: 15 }}>
        <div className="form-group" style={{ flex: 2 }}>
          <label>Observaciones:</label>
          <textarea name="observaciones" value={form.observaciones} onChange={handleChange}></textarea>
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Usuario:</label>
          <input name="usuario" value={form.usuario} disabled />
        </div>
      </div>

      <div style={{ textAlign: "right" }}>
        <button className="update-btn" onClick={handleRegistro}>Registrar Pago</button>
      </div>
    </>
  )}
</div>


      {/* Tabla de pagos */}
      <div className="table-wrapper">
        <table className="elegant-table">
          <thead>
            <tr>
              <th>ID Unidad</th>
              <th>Vehículo</th>
              <th>Modelo</th>
              <th>Fecha Pago</th>
              <th>Tipo Pago</th>
              <th>Monto Refrendo</th>
              <th>Factura Refrendo</th>
              <th>Monto Tenencia</th>
              <th>Factura Tenencia</th>
              <th>Usuario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {unidades.length === 0 ? (
              <tr><td colSpan={11} className="mensaje-estado">No hay unidades registradas</td></tr>
            ) : (
              unidades.map(u => {
                const pago = getPagoByUnidad(u.id_unidad);
                return (
                  <tr key={u.id_unidad}>
                    <td>{u.id_unidad}</td>
                    <td>{u.marca} {u.vehiculo}</td>
                    <td>{u.modelo}</td>
                    <td>{pago.fecha_pago || "-"}</td>
                    <td>{pago.tipo_pago || "-"}</td>
                    <td>{pago.monto_refrendo ? pago.monto_refrendo.toFixed(2) : "-"}</td>
                    <td>
                      {pago.url_factura_refrendo ? (
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => { setFileUrl(`${API_URL}/${pago.url_factura_refrendo}`); setShowFileModal(true); }}
                        >
                          Ver PDF
                        </button>
                      ) : "-"}
                    </td>
                    <td>{pago.monto_tenencia ? pago.monto_tenencia.toFixed(2) : "-"}</td>
                    <td>
                      {pago.url_factura_tenencia ? (
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => { setFileUrl(`${API_URL}/${pago.url_factura_tenencia}`); setShowFileModal(true); }}
                        >
                          Ver PDF
                        </button>
                      ) : "-"}
                    </td>
                    <td>{pago.usuario || "-"}</td>
                    <td>
                      {pago.id_pago && <button onClick={() => handleEdit(pago)}>Editar</button>}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de edición */}
      {showModal && editForm && (
<Modal onClose={() => setShowModal(false)}>
  <div className="edit-placa-container">
    <h2>Editar Pago - Unidad {editForm.id_unidad}</h2>

    <div>
      <label>Unidad:</label>
      <p>
        {(() => {
          const u = unidades.find(u => u.id_unidad === editForm.id_unidad);
          return u ? `${u.id_unidad} - ${u.marca} ${u.vehiculo} ${u.modelo}` : editForm.id_unidad;
        })()}
      </p>
    </div>

    <div>
      <label>Fecha de pago:</label>
      <input
        type="date"
        name="fecha_pago"
        value={editForm.fecha_pago || ""}
        onChange={(e) => handleFechaChange(e, editForm, setEditForm)}
      />
    </div>

    {(() => {
      const fechaPago = editForm.fecha_pago ? new Date(editForm.fecha_pago) : null;
      const limiteRefrendo = fechaPago ? new Date(fechaPago.getFullYear(), 2, 31) : null;
      const tipo = fechaPago && fechaPago > limiteRefrendo ? "AMBOS" : "REFRENDO";
      return tipo;
    })() === "REFRENDO" && (
      <div>
        <h4>REFRENDO</h4>
        <div>
          <label>Monto Refrendo:</label>
          <input
            type="number"
            name="monto_refrendo"
            value={editForm.monto_refrendo || 0}
            onChange={(e) => handleChange(e, editForm, setEditForm)}
            disabled={paidRefrendo}
          />
        </div>
        <div>
          <label>Factura Refrendo (PDF):</label>
          <input
            type="file"
            name="url_factura_refrendo"
            accept="application/pdf"
            onChange={(e) => handleChange(e, editForm, setEditForm)}
            disabled={paidRefrendo}
          />
          {editForm.url_factura_refrendo && !(editForm.url_factura_refrendo instanceof File) && (
            <button
              type="button"
              className="update-btn"
              onClick={() => {
                setFileUrl(`${API_URL}/${editForm.url_factura_refrendo}`);
                setShowFileModal(true);
              }}
            >
              Ver PDF actual
            </button>
          )}
        </div>
      </div>
    )}

    {(() => {
      const fechaPago = editForm.fecha_pago ? new Date(editForm.fecha_pago) : null;
      const limiteRefrendo = fechaPago ? new Date(fechaPago.getFullYear(), 2, 31) : null;
      const tipo = fechaPago && fechaPago > limiteRefrendo ? "AMBOS" : "REFRENDO";
      return tipo;
    })() === "AMBOS" && (
      <>
        <div>
          <h4>REFRENDO</h4>
          <div>
            <label>Monto Refrendo:</label>
            <input
              type="number"
              name="monto_refrendo"
              value={editForm.monto_refrendo || 0}
              onChange={(e) => handleChange(e, editForm, setEditForm)}
              disabled={paidRefrendo}
            />
          </div>
          <div>
            <label>Factura Refrendo (PDF):</label>
            <input
              type="file"
              name="url_factura_refrendo"
              accept="application/pdf"
              onChange={(e) => handleChange(e, editForm, setEditForm)}
              disabled={paidRefrendo}
            />
            {editForm.url_factura_refrendo && !(editForm.url_factura_refrendo instanceof File) && (
              <button
                type="button"
                className="update-btn"
                onClick={() => {
                  setFileUrl(`${API_URL}/${editForm.url_factura_refrendo}`);
                  setShowFileModal(true);
                }}
              >
                Ver PDF actual
              </button>
            )}
          </div>
        </div>

        <div>
          <h4>TENENCIA</h4>
          <div>
            <label>Monto Tenencia:</label>
            <input
              type="number"
              name="monto_tenencia"
              value={editForm.monto_tenencia || 0}
              onChange={(e) => handleChange(e, editForm, setEditForm)}
              disabled={paidTenencia}
            />
          </div>
          <div>
            <label>Factura Tenencia (PDF):</label>
            <input
              type="file"
              name="url_factura_tenencia"
              accept="application/pdf"
              onChange={(e) => handleChange(e, editForm, setEditForm)}
              disabled={paidTenencia}
            />
            {editForm.url_factura_tenencia && !(editForm.url_factura_tenencia instanceof File) && (
              <button
                type="button"
                className="update-btn"
                onClick={() => {
                  setFileUrl(`${API_URL}/${editForm.url_factura_tenencia}`);
                  setShowFileModal(true);
                }}
              >
                Ver PDF actual
              </button>
            )}
          </div>
        </div>
      </>
    )}

    <div>
      <label>Observaciones:</label>
      <textarea
        name="observaciones"
        value={editForm.observaciones || ""}
        onChange={(e) => handleChange(e, editForm, setEditForm)}
      ></textarea>
    </div>

    <div>
      <label>Usuario:</label>
      <input
        name="usuario"
        value={editForm.usuario || ""}
        disabled
      />
    </div>

    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "15px" }}>
      <button className="update-btn" onClick={handleSaveEdit}>Guardar Cambios</button>
      <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancelar</button>
    </div>
  </div>
</Modal>


      )}

      {/* Modal para visualizar archivos PDF */}
      {showFileModal && fileUrl && (
        <ModalFile url={fileUrl} onClose={() => setShowFileModal(false)} />
      )}
    </div>
  );
}










