import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./SolicitudForm.css";
import RegistrarFalla from "./RegistrarFalla";

import { API_URL } from "../config";

export default function SolicitudFallaPaso1y2() {
  const [unidades, setUnidades] = useState([]);
  const [piezas, setPiezas] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [lugares, setLugares] = useState([]);
  const [misSolicitudes, setMisSolicitudes] = useState([]);
  const [fallaData, setFallaData] = useState({}); // por solicitud
  const [comprobanteSolicitud, setComprobanteSolicitud] = useState(null);

  const idChofer = localStorage.getItem("usuarioId");
  const rol = localStorage.getItem("rol");

  const [formData, setFormData] = useState({
    id_unidad: "",
    id_pieza: "",
    id_marca: "",
    descripcion: "",
    tipo_servicio: "",
    id_usuario: idChofer || "",
  });

  // Carga de solicitudes del chofer
  const cargarSolicitudes = async () => {
    if (!idChofer) return;
    try {
      const res = await fetch(`${API_URL}/solicitudes/chofer/${idChofer}`);
      const data = await res.json();
      const filtradas = data.filter(
        s => s.estado === "pendiente" || (s.estado === "aprobada" && !s.completada)
      );
      setMisSolicitudes(filtradas);
      console.log("Solicitudes recibidas:", data);


    } catch (err) {
      Swal.fire("Error", "No se pudieron cargar las solicitudes", "error");
    }
  };

  // Carga inicial de datos
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

        if (rol === "Conductor") {
          const resUnidad = await fetch(`${API_URL}/unidades/chofer/${idChofer}`);
          const unidadChofer = await resUnidad.json();

          if (resUnidad.ok && unidadChofer.id_unidad) {
            setUnidades([unidadChofer]);
            setFormData(prev => ({ ...prev, id_unidad: unidadChofer.id_unidad }));
          } else {
            setUnidades([]);
            Swal.fire("Sin asignación", "No tienes una unidad asignada actualmente", "info");
          }
        } else {
          const unidadesRes = await fetch(`${API_URL}/unidades`).then(r => r.json());
          setUnidades(unidadesRes);
        }

        await cargarSolicitudes();
      } catch (err) {
        Swal.fire("Error", "Error al cargar los datos", "error");
      }
    };

    cargarDatos();
  }, [idChofer, rol]);

  // Manejo de inputs principales
  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Manejo de inputs de fallas por solicitud
  const handleChangeFalla = (e, id_solicitud) => {
    const { name, value, type, checked, files } = e.target;
    setFallaData(prev => ({
      ...prev,
      [id_solicitud]: {
        ...prev[id_solicitud],
        [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value,
      },
    }));
  };

  // Enviar nueva solicitud
const handleSubmitSolicitud = async e => {
  e.preventDefault();

  let id_pieza_final = formData.id_pieza;

  // Si seleccionó "Otro", primero crear la pieza
  if (formData.id_pieza === "otro" && formData.nuevo_pieza?.trim()) {
    try {
      const resPieza = await fetch(`${API_URL}/piezas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_pieza: formData.nuevo_pieza.trim() })
      });

      const dataPieza = await resPieza.json();
      if (!resPieza.ok) throw new Error(dataPieza.error || "Error al crear la pieza");

      id_pieza_final = dataPieza.id; // usar el ID de la nueva pieza
    } catch (err) {
      Swal.fire("Error", err.message, "error");
      return; // detener envío de solicitud si falla la creación
    }
  }

  const fd = new FormData();
  fd.append("id_unidad", formData.id_unidad);
  fd.append("id_pieza", id_pieza_final);
  fd.append("descripcion", formData.descripcion || "");
  fd.append("id_usuario", idChofer);
  fd.append("tipo_servicio", formData.tipo_servicio || "");

  if (comprobanteSolicitud && comprobanteSolicitud.length > 0) {
    for (let i = 0; i < comprobanteSolicitud.length; i++) {
      fd.append("comprobante", comprobanteSolicitud[i]);
    }
  }

  try {
    const res = await fetch(`${API_URL}/solicitudes`, { method: "POST", body: fd });
    const data = await res.json();

    if (res.ok) {
      Swal.fire("Enviado", "Solicitud enviada correctamente", "success");
      setFormData({
        id_unidad: rol === "Conductor" ? unidades[0]?.id_unidad || "" : "",
        id_pieza: "",
        descripcion: "",
        tipo_servicio: "",
        evidencia: "",
        id_usuario: idChofer,
        nuevo_pieza: "" // limpiar campo de nuevo
      });
      setComprobanteSolicitud(null);
      await cargarSolicitudes();
    } else {
      Swal.fire("Error", data.error || "No se pudo enviar la solicitud", "error");
    }
  } catch (err) {
    Swal.fire("Error", "No se pudo enviar la solicitud", "error");
  }
};


  // Registrar falla
  const handleSubmitFalla = async id_solicitud => {
    const data = fallaData[id_solicitud];
    if (!data) return;

    const fd = new FormData();
    fd.append("id_solicitud", id_solicitud);
    fd.append("id_lugar", data.id_lugar || "");
    fd.append("proveedor", data.proveedor || "");
    fd.append("tipo_pago", data.tipo_pago || "");
    fd.append("costo", data.costo || "");
    fd.append("tiempo_uso_pieza", data.tiempo_uso_pieza || "");
    fd.append("aplica_poliza", data.aplica_poliza ? "true" : "false");
    fd.append("observaciones", data.observaciones || "");
    if (data.url_comprobante) fd.append("comprobante", data.url_comprobante);

    try {
      const res = await fetch(`${API_URL}/fallas`, { method: "POST", body: fd });
      const json = await res.json();
      if (res.ok) {
        Swal.fire("Registrado", json.msg, "success");
        setFallaData(prev => ({ ...prev, [id_solicitud]: {} }));
        await cargarSolicitudes();
      } else {
        Swal.fire("Error", json.error || "No se pudo registrar la falla", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Error al registrar la falla", "error");
    }
  };

  return (
    <div className="form-container">

      {/* FORMULARIO PRINCIPAL - siempre visible */}
      {rol === "Conductor" && unidades.length === 0 ? (
        <div className="form-card">
          <h3>No tienes unidad asignada</h3>
        </div>
      ) : (
        <div className="form-card">
          <h2 className="form-title">Solicitud de Falla Mecánica</h2>
          <form onSubmit={handleSubmitSolicitud} className="form-grid-2cols">
            <div className="form-group">
  <label>Unidad:</label>
  {rol === "Conductor" ? (
    <input type="text" value={`${unidades[0]?.cve || ""}  ${unidades[0]?.marca || ""} ${unidades[0]?.vehiculo || ""} ${unidades[0]?.modelo || ""} `.trim()} readOnly />
  ) : (
    <select name="id_unidad" value={formData.id_unidad} onChange={handleChange} required>
      <option value="">Seleccione</option>
      {unidades.map(u => (
        <option key={u.id_unidad} value={u.id_unidad}>
          {u.cve} {u.marca} {u.vehiculo} {u.modelo}
        </option>
      ))}
    </select>
  )}
</div>



 <div className="form-group">
  <label>Tipo de falla:</label>
  <select
    name="id_pieza"
    value={formData.id_pieza}
    onChange={handleChange}
    required
  >
    <option value="">Seleccione</option>
    {piezas.map(p => (
      <option key={p.id_pieza} value={p.id_pieza}>{p.nombre_pieza}</option>
    ))}
    <option value="otro">Otro...</option>
  </select>

  {/* Mostrar input si selecciona "Otro" */}
  {formData.id_pieza === "otro" && (
    <input
      type="text"
      name="nuevo_pieza"
      placeholder="Que falla presenta?"
      value={formData.nuevo_pieza || ""}
      onChange={handleChange}
      required
    />
  )}
</div>


            <div className="form-group">
              <label>Tipo de servicio:</label>
              <select
                name="tipo_servicio"
                value={formData.tipo_servicio}
                onChange={e => {
                  handleChange(e);
                  // Reiniciar el valor personalizado si no es "Otros"
                  if (e.target.value !== "OTROS") {
                    setFormData(prev => ({ ...prev, otro_tipo_servicio: "" }));
                  }
                }}
                required
              >
                <option value="">Selecciona una opción</option>
                <option value="CORRECTIVO">Correctivo</option>
                <option value="PREVENTIVO">Preventivo</option>
                <option value="TALACHA">Talacha</option>
                <option value="OTROS">Otros</option>
              </select>
            </div>


            <div className="form-group">
              <label>Adjuntar evidencia:</label>
              <input
                type="file"
                accept="image/*,video/*"
                name="evidencia"
                multiple
                onChange={(e) => setComprobanteSolicitud(e.target.files)}
                required
              />
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
      )}

      {/* FORMULARIOS PARA REGISTRAR FALLAS DE SOLICITUDES APROBADAS */}
      {misSolicitudes.filter(s => s.estado === "aprobada" && !s.completada)  .filter(s => s.tipo_servicio === "TALACHA" || s.tipo_servicio === "OTRO") // <-- Filtra TALACHA u otros
      .map(s => (
        <div key={s.id_solicitud} className="form-card mb-4">
          <h3 className="form-title">Registrar Falla para solicitud #{s.id_solicitud}</h3>

          <div className="form-grid-2cols">
            <div className="form-group">
              <label>Unidad:</label>
              <input type="text" value={`${s.cve} ${s.marca_auto} ${s.version} ${s.unidad || ""}`}
 readOnly />
            </div>

            <div className="form-group">
              <label>Tipo de servicio realizado:</label>
              <input type="text" value={s.pieza} readOnly />
            </div>
            
            <div className="form-group">
              <label>Servicio:</label>
              <input type="text" value={s.tipo_servicio} readOnly />
            </div>

            <div className="form-group">
              <label>Descripción:</label>
              <textarea value={s.descripcion} readOnly />
            </div>
          </div>

          {/* Formulario de registrar falla */}
          <form onSubmit={e => { e.preventDefault(); handleSubmitFalla(s.id_solicitud); }} className="form-grid-2cols mt-4">


            <div className="form-group">
              <label>Proveedor:</label>
              <input type="text" name="proveedor" value={fallaData[s.id_solicitud]?.proveedor || ""} onChange={e => handleChangeFalla(e, s.id_solicitud)} required/>
            </div>

            <div className="form-group">
              <label>Tipo de pago:</label>
              <select
                name="tipo_pago"
                value={fallaData[s.id_solicitud]?.tipo_pago || ""}
                onChange={e => handleChangeFalla(e, s.id_solicitud)}
              required>
                <option value="">Seleccione un tipo de pago</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Crédito">Crédito</option>
                <option value="Transferencia">Transferencia</option>
              </select>
            </div>


            <div className="form-group">
              <label>Costo:</label>
              <input type="number" name="costo" value={fallaData[s.id_solicitud]?.costo || ""} onChange={e => handleChangeFalla(e, s.id_solicitud)} required />
            </div>

            <div className="form-group">
              <label>Observaciones:</label>
              <textarea name="observaciones" value={fallaData[s.id_solicitud]?.observaciones || ""} onChange={e => handleChangeFalla(e, s.id_solicitud)}></textarea>
            </div>

            <div className="form-group">
              <label>Comprobante del que se realizo:</label>
              <input type="file" name="url_comprobante" accept="image/*,application/pdf" onChange={e => handleChangeFalla(e, s.id_solicitud)} required />
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
