import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./SolicitudForm.css";
import { API_URL } from "../config";

export default function SolicitudFallaPaso1y2() {
  const [unidades, setUnidades] = useState([]);
  const [piezas, setPiezas] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [lugares, setLugares] = useState([]);
  const [misSolicitudes, setMisSolicitudes] = useState([]);
  const [esperandoAprobacion, setEsperandoAprobacion] = useState(false);
  const [fallaData, setFallaData] = useState({
    id_lugar: "",
    proveedor: "",
    tipo_pago: "",
    costo: "",
    tiempo_uso_pieza: "",
    aplica_poliza: false,
    observaciones: "",
    url_comprobante: null,
  });

  const idChofer = localStorage.getItem("usuarioId");
  const rol = localStorage.getItem("rol");

  const [formData, setFormData] = useState({
    id_unidad: "",
    id_pieza: "",
    id_marca: "",
    tipo_servicio: "",
    descripcion: "",
    id_chofer: idChofer || "",
  });

  const cargarSolicitudes = async () => {
    try {
      const solicitudesRes = await fetch(`${API_URL}/solicitudes/chofer/${idChofer}`).then(r => r.json());
      const solicitudesActivas = solicitudesRes.filter(
        s => s.estado === "pendiente" || (s.estado === "aprobada" && !s.completada)
      );
      setMisSolicitudes(solicitudesActivas);
      setEsperandoAprobacion(solicitudesActivas.some(s => s.estado === "pendiente"));
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudieron cargar las solicitudes", "error");
    }
  };

  useEffect(() => {
    if (!idChofer) return;

    const cargarDatos = async () => {
      try {
        const [piezasRes, marcasRes, lugaresRes] = await Promise.all([
          fetch(`${API_URL}/piezas`).then(r => r.json()),
          fetch(`${API_URL}/marcas`).then(r => r.json()),
          fetch(`${API_URL}/lugares`).then(r => r.json()),
        ]);

        setPiezas(piezasRes);
        setMarcas(marcasRes);
        setLugares(lugaresRes);

        if (rol === "chofer") {
          // 🔹 Llamar al endpoint que devuelve la unidad asignada al chofer
          const res = await fetch(`${API_URL}/unidades/chofer/${idChofer}`);
          const unidadChofer = await res.json();

          if (res.ok && unidadChofer.id_unidad) {
            setUnidades([unidadChofer]);
            setFormData(prev => ({ ...prev, id_unidad: unidadChofer.id_unidad }));
          } else {
            setUnidades([]);
            Swal.fire("Sin asignación", "No tienes una unidad asignada actualmente", "info");
          }
        } else {
          // 🔹 Para admin o usuario normal
          const unidadesRes = await fetch(`${API_URL}/unidades`).then(r => r.json());
          setUnidades(unidadesRes);
        }

        await cargarSolicitudes();
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Error al cargar los datos", "error");
      }
    };

    cargarDatos();
  }, [idChofer, rol]);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleChangeFalla = e => {
    const { name, value, type, checked } = e.target;
    setFallaData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleFileChange = e =>
    setFallaData(prev => ({ ...prev, url_comprobante: e.target.files[0] }));

  const handleSubmitSolicitud = async e => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/solicitudes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        Swal.fire("Enviado", "Solicitud enviada, esperando aprobación", "info");
        setEsperandoAprobacion(true);
        setFormData({
          id_unidad: rol === "chofer" ? unidades[0]?.id_unidad || "" : "",
          id_pieza: "",
          id_marca: "",
          tipo_servicio: "",
          descripcion: "",
          id_chofer: idChofer || "",
        });
        await cargarSolicitudes();
      } else {
        Swal.fire("Error", data.error || "No se pudo enviar la solicitud", "error");
      }
    } catch (err) {
      Swal.fire("Error", "No se pudo enviar la solicitud", "error");
    }
  };

  const handleSubmitFalla = async id_solicitud => {
    const formDataFalla = new FormData();
    formDataFalla.append("id_lugar", fallaData.id_lugar);
    formDataFalla.append("proveedor", fallaData.proveedor);
    formDataFalla.append("tipo_pago", fallaData.tipo_pago);
    formDataFalla.append("costo", fallaData.costo);
    formDataFalla.append("tiempo_uso_pieza", fallaData.tiempo_uso_pieza);
    formDataFalla.append("aplica_poliza", fallaData.aplica_poliza ? "true" : "false");
    formDataFalla.append("observaciones", fallaData.observaciones);
    if (fallaData.url_comprobante) formDataFalla.append("comprobante", fallaData.url_comprobante);
    formDataFalla.append("id_solicitud", id_solicitud);

    try {
      const res = await fetch(`${API_URL}/fallas`, { method: "POST", body: formDataFalla });
      const data = await res.json();
      if (res.ok) {
        Swal.fire("Registrado", data.msg, "success");
        setFallaData({
          id_lugar: "",
          proveedor: "",
          tipo_pago: "",
          costo: "",
          tiempo_uso_pieza: "",
          aplica_poliza: false,
          observaciones: "",
          url_comprobante: null,
        });
        await cargarSolicitudes();
      } else {
        Swal.fire("Error", data.error || "No se pudo registrar la falla", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Error al registrar la falla", "error");
    }
  };

  return (
    <div className="form-container">
      {/* FORMULARIO 1 */}
      {rol === "chofer" && unidades.length === 0 ? (
        <div className="form-card">
          <h3>No tienes unidad asignada</h3>
          <p>No puedes registrar fallas porque no tienes ninguna unidad asignada.</p>
        </div>
      ) : esperandoAprobacion ? (
        <div className="form-card">
          <h3>Solicitud enviada</h3>
          <p>Tu solicitud ha sido enviada y está esperando aprobación.</p>
        </div>
      ) : misSolicitudes.length === 0 ? (
        <div className="form-card">
          <h2 className="form-title">Solicitud de Falla Mecánica</h2>
          <form onSubmit={handleSubmitSolicitud} className="form-grid-2cols">
            <div className="form-group">
              <label>Unidad:</label>
              {rol === "chofer" ? (
                <input type="text" value={unidades[0]?.vehiculo || ""} readOnly />
              ) : (
                <select name="id_unidad" value={formData.id_unidad} onChange={handleChange} required>
                  <option value="">Seleccione</option>
                  {unidades.map(u => (
                    <option key={u.id_unidad} value={u.id_unidad}>{u.vehiculo}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="form-group">
              <label>Pieza:</label>
              <select name="id_pieza" value={formData.id_pieza} onChange={handleChange} required>
                <option value="">Seleccione</option>
                {piezas.map(p => (
                  <option key={p.id_pieza} value={p.id_pieza}>{p.nombre_pieza}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Marca:</label>
              <select name="id_marca" value={formData.id_marca} onChange={handleChange} required>
                <option value="">Seleccione</option>
                {marcas.map(m => (
                  <option key={m.id_marca} value={m.id_marca}>{m.nombre_marca}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Tipo de servicio:</label>
              <input type="text" name="tipo_servicio" value={formData.tipo_servicio} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Descripción:</label>
              <textarea name="descripcion" value={formData.descripcion} onChange={handleChange}></textarea>
            </div>
            <div className="form-group full-width-btn">
              <button type="submit" className="submit-btn">Enviar Solicitud</button>
            </div>
          </form>
        </div>
      ) : null}

      {/* FORMULARIO 2 */}
      {misSolicitudes.map(s => s.estado === "aprobada" && !s.completada && (
        <div key={s.id_solicitud} className="form-card mb-4">
          <h3 className="form-title">Registrar Falla</h3>
          <div className="form-grid-2cols">
            <div className="form-group">
              <label>Unidad:</label>
              <input type="text" value={s.unidad} readOnly />
            </div>
            <div className="form-group">
              <label>Pieza:</label>
              <input type="text" value={s.pieza} readOnly />
            </div>
            <div className="form-group">
              <label>Marca:</label>
              <input type="text" value={s.marca} readOnly />
            </div>
            <div className="form-group">
              <label>Tipo de servicio:</label>
              <input type="text" value={s.tipo_servicio} readOnly />
            </div>
            <div className="form-group">
              <label>Descripción:</label>
              <textarea value={s.descripcion} readOnly />
            </div>
          </div>

          <form onSubmit={e => { e.preventDefault(); handleSubmitFalla(s.id_solicitud); }} className="form-grid-2cols mt-4">
            <div className="form-group">
              <label>Lugar de reparación:</label>
              <select name="id_lugar" value={fallaData.id_lugar} onChange={handleChangeFalla} required>
                <option value="">Seleccione</option>
                {lugares.map(l => <option key={l.id_lugar} value={l.id_lugar}>{l.nombre_lugar}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Proveedor:</label>
              <input type="text" name="proveedor" value={fallaData.proveedor} onChange={handleChangeFalla} />
            </div>
            <div className="form-group">
              <label>Tipo de pago:</label>
              <input type="text" name="tipo_pago" value={fallaData.tipo_pago} onChange={handleChangeFalla} />
            </div>
            <div className="form-group">
              <label>Costo:</label>
              <input type="number" name="costo" value={fallaData.costo} onChange={handleChangeFalla} />
            </div>
            <div className="form-group">
              <label>Tiempo de uso de la pieza:</label>
              <input type="text" name="tiempo_uso_pieza" value={fallaData.tiempo_uso_pieza} onChange={handleChangeFalla} />
            </div>
            <div className="form-group">
              <label>
                <input type="checkbox" name="aplica_poliza" checked={fallaData.aplica_poliza} onChange={handleChangeFalla} />
                Aplica póliza
              </label>
            </div>
            <div className="form-group">
              <label>Observaciones:</label>
              <textarea name="observaciones" value={fallaData.observaciones} onChange={handleChangeFalla}></textarea>
            </div>
            <div className="form-group">
              <label>Comprobante (PDF):</label>
              <input type="file" name="comprobante" accept="application/pdf" onChange={handleFileChange} />
            </div>
            <div className="form-group full-width-btn">
              <button type="submit" className="submit-btn">Registrar Falla</button>
            </div>
          </form>
        </div>
      ))}
    </div>
  );
}
