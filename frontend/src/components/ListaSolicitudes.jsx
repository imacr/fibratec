import React, { useState, useEffect, useContext } from "react";
import Swal from "sweetalert2";
import { API_URL } from "../config";
import { NotificationContext } from "./NotificationContext";
import Modal from "./Modal";
import ModalFile from "./ModalFile";
import RegistrarFalla from "./RegistrarFalla";
import "./SolicitudForm.css";

export default function ListaSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { setPendientes } = useContext(NotificationContext);

  const [currentPage, setCurrentPage] = useState(1);

  // Modal registrar falla
  const [solicitudFormActiva, setSolicitudFormActiva] = useState(null);
  const [fallaData, setFallaData] = useState({});

  // Chat y archivos
  const [modalOpen, setModalOpen] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [archivos, setArchivos] = useState({});
  const [modalArchivo, setModalArchivo] = useState(null);

const [itemsPerPage, setItemsPerPage] = useState(5); // ahora sí permite cambios

  // Modal de evidencias
  const [modalEvidenciaSolicitud, setModalEvidenciaSolicitud] = useState({ abierta: false, urls: [] });
  const [archivoModalUrl, setArchivoModalUrl] = useState(null);

  const usuarioId = localStorage.getItem("usuarioId");

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const fetchSolicitudes = async () => {
    try {
      const res = await fetch(`${API_URL}/solicitudes`);
      if (!res.ok) throw new Error("Error al cargar solicitudes");
      const data = await res.json();

      const dataConCompletado = data.map(s => ({ ...s, completada: s.completada || false }));

      dataConCompletado.sort((a, b) => new Date(b.fecha_solicitud) - new Date(a.fecha_solicitud));
      setSolicitudes(dataConCompletado);

      const pendientesCount = dataConCompletado.filter(s => s.estado === "pendiente").length;
      setPendientes(pendientesCount);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

const handleEliminarSolicitud = async (id_solicitud) => {
  const confirm = await Swal.fire({
    title: "¿Eliminar solicitud?",
    text: "Se eliminará la solicitud y TODAS sus evidencias",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  });

  if (!confirm.isConfirmed) return;

  try {
    const res = await fetch(`${API_URL}/solicitudes/${id_solicitud}`, {
      method: "DELETE",
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || "Error al eliminar");

    Swal.fire("Eliminado", data.msg, "success");

    setSolicitudes(prev =>
      prev.filter(s => s.id_solicitud !== id_solicitud)
    );
  } catch (err) {
    Swal.fire("Error", err.message, "error");
  }
};


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

  const handleSubmitFalla = async id_solicitud => {
    const data = fallaData[id_solicitud];
    if (!data) return;

    const fd = new FormData();
    fd.append("id_solicitud", id_solicitud);
    fd.append("proveedor", data.proveedor || "");
    fd.append("tipo_pago", data.tipo_pago || "");
    fd.append("costo", data.costo || "");
    fd.append("observaciones", data.observaciones || "");
    if (data.url_comprobante) fd.append("comprobante", data.url_comprobante);

    try {
      const res = await fetch(`${API_URL}/fallas`, { method: "POST", body: fd });
      const json = await res.json();
      if (res.ok) {
        Swal.fire("Registrado", json.msg, "success");

        // Actualizar solicitud como completada localmente
        setSolicitudes(prev =>
          prev.map(s => s.id_solicitud === id_solicitud
            ? { ...s, completada: true }
            : s
          )
        );

        setFallaData(prev => ({ ...prev, [id_solicitud]: {} }));
        setSolicitudFormActiva(null);
      } else {
        Swal.fire("Error", json.error || "No se pudo registrar la falla", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Error al registrar la falla", "error");
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
        const pendientesCount = nuevos.filter(s => s.estado === "pendiente").length;
        setPendientes(pendientesCount);
        return nuevos;
      });
    } catch (err) {
      Swal.fire("Error", err.message || "No se pudo procesar la solicitud", "error");
    }
  };

  const handleRechazar = async id => {
    try {
      const { value: mensaje, isConfirmed } = await Swal.fire({
        title: "Motivo del rechazo",
        input: "textarea",
        inputPlaceholder: "Escribe el motivo del rechazo...",
        showCancelButton: true,
      });
      if (!isConfirmed) return;
      if (!mensaje || mensaje.trim() === "") {
        Swal.fire("Error", "Debes escribir un mensaje antes de rechazar.", "warning");
        return;
      }

      await fetch(`${API_URL}/solicitudes_mensajes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_solicitud: id, id_usuario: usuarioId, mensaje }),
      });

      await fetch(`${API_URL}/solicitudes/${id}/rechazar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ razon_rechazo: mensaje }),
      });

      Swal.fire("Éxito", "Rechazo enviado al chofer con mensaje", "success");
      fetchSolicitudes();
    } catch (err) {
      Swal.fire("Error", err.message || "No se pudo enviar el mensaje", "error");
    }
  };

  const abrirChat = async solicitud => {
    try {
      const res = await fetch(`${API_URL}/solicitudes/${solicitud.id_solicitud}/mensajes_admin`);
      const data = await res.json();
      setSolicitudSeleccionada({ ...solicitud, mensajes: data });
      setModalOpen(true);
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const handleResponder = async id_solicitud => {
    const mensaje = respuestas[id_solicitud]?.trim();
    const archivo = archivos[id_solicitud];
    if (!mensaje && !archivo) {
      Swal.fire("Error", "Escribe un mensaje o sube un archivo antes de responder", "warning");
      return;
    }
    const formData = new FormData();
    formData.append("id_solicitud", id_solicitud);
    formData.append("id_usuario", usuarioId);
    if (mensaje) formData.append("mensaje", mensaje);
    if (archivo) formData.append("archivo", archivo);

    try {
      const res = await fetch(`${API_URL}/solicitudes_mensajes/responder`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Error al enviar respuesta");
      Swal.fire("Éxito", "Respuesta enviada", "success");
      setRespuestas(prev => ({ ...prev, [id_solicitud]: "" }));
      setArchivos(prev => ({ ...prev, [id_solicitud]: null }));
      abrirChat(solicitudSeleccionada);
    } catch (err) {
      Swal.fire("Error", err.message || "No se pudo enviar respuesta", "error");
    }
  };

  if (loading) return <p>Cargando solicitudes...</p>;
  if (error) return <p>Error: {error}</p>;
  if (solicitudes.length === 0) return <p>No hay solicitudes registradas</p>;

  const totalPages = Math.ceil(solicitudes.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const sortedSolicitudes = [...solicitudes].sort((a, b) => {
    const aPrioridad = a.estado === "pendiente" ? 1 : (a.estado === "aprobada" && !a.completada ? 2 : 3);
    const bPrioridad = b.estado === "pendiente" ? 1 : (b.estado === "aprobada" && !b.completada ? 2 : 3);

    if (aPrioridad === bPrioridad) {
      const fechaA = a.fecha_solicitud ? new Date(a.fecha_solicitud).getTime() : 0;
      const fechaB = b.fecha_solicitud ? new Date(b.fecha_solicitud).getTime() : 0;
      return fechaB - fechaA;
    }
    return aPrioridad - bPrioridad;
  });

  const currentItems = sortedSolicitudes.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="unidades-container">
      <h1><i className="fa-solid fa-car-side"></i> Registro de Solicitudes</h1>
<div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
  <label>Mostrar:</label>
  <select value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
    <option value={5}>5</option>
    <option value={10}>10</option>
    <option value={20}>20</option>
    <option value={solicitudes.length}>Todos</option>
  </select>
</div>

      <div className="table-wrapper overflow-x-auto">
        <table className="elegant-table min-w-full border-collapse">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th>Id solicitud</th>
              <th>Chofer</th>
              <th>Unidad</th>
              <th>Falla reportada</th>
              <th>Tipo de servicio solicitado</th>
              <th>Descripción</th>
              <th>Evidencia</th>
              <th>Estado</th>
              <th>Acciones</th>
              <th>Chat</th>
              <th>Cerrar reporte de la falla</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((s, index) => (
              <tr key={s.id_solicitud} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                <td>{s.id_solicitud}</td>
                <td>{s.chofer?.nombre_chofer || "Sin asignar"}</td>
                <td>{s.cve} {s.marca_auto} {s.unidad}</td>
                <td>{s.pieza}</td>
                <td>{s.tipo_servicio}</td>
                <td>{s.descripcion}</td>
                <td>
                  {s.evidencias?.length ? (
                    <button className="ver-evidencia" onClick={() => setModalEvidenciaSolicitud({ abierta: true, urls: s.evidencias.map(u => `${API_URL}/${u}`) })}>
                      Ver evidencias
                    </button>
                  ) : <span className="sin-evidencia">Sin evidencia</span>}
                </td>
                <td>{s.estado}</td>
                <td>
                  {s.estado === "pendiente" && (
                    <div className="flex-gap">
                      <button className="aceptar" onClick={() => handleAprobar(s.id_solicitud, true)}>Aceptar</button>
                      <button className="rechazar" onClick={() => handleRechazar(s.id_solicitud)}>Rechazar</button>
                    </div>
                  )}
                    {/* BOTÓN ELIMINAR */}
                  <button
                    className="eliminar"
                    onClick={() => handleEliminarSolicitud(s.id_solicitud)}
                    style={{ marginTop: "5px" }}
                  >
                    Eliminar
                  </button>
                </td>
                <td>
                  <button className="ver-chat" onClick={() => abrirChat(s)}>Ver Chat</button>
                </td>
                <td>
                  {s.estado === "aprobada" && !s.completada && (
                    <button className="registrar-falla" onClick={() => setSolicitudFormActiva(s.id_solicitud)}>
                      Cerrar Reporte
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Registrar Falla */}
      {solicitudFormActiva && (
        <Modal onClose={() => setSolicitudFormActiva(null)}>
          <RegistrarFalla
            solicitud={solicitudes.find(s => s.id_solicitud === solicitudFormActiva)}
            fallaData={fallaData}
            handleChangeFalla={handleChangeFalla}
            handleSubmitFalla={handleSubmitFalla}
          />
        </Modal>
      )}

      {/* Modal Chat */}
      {modalOpen && solicitudSeleccionada && (
        <Modal onClose={() => setModalOpen(false)}>
          <h2>Chat de solicitud #{solicitudSeleccionada.id_solicitud}</h2>
          <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {solicitudSeleccionada.mensajes.map(m => {
              const esMiMensaje = String(m.id_usuario) === String(usuarioId);
              const extension = m.archivo_adjunto?.split(".").pop().toLowerCase();
              const urlArchivo = m.archivo_adjunto ? `${API_URL}/uploads/mensajes/${m.archivo_adjunto}` : null;
              return (
                <div key={m.id_mensaje} className={`chat-bubble ${esMiMensaje ? "derecha" : "izquierda"}`} style={{ maxWidth: '80%' }}>
                  <strong>{m.usuario}</strong>
                  {m.archivo_adjunto && (
                    <div style={{ margin: '5px 0', cursor: 'pointer' }}>
                      {["jpg","jpeg","png","gif"].includes(extension) && <img src={urlArchivo} style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }} onClick={() => setModalArchivo({ url: urlArchivo, ext: extension })} />}
                      {["mp4","webm","ogg"].includes(extension) && <video controls style={{ width: '100%', maxHeight: '300px' }} onClick={() => setModalArchivo({ url: urlArchivo, ext: extension })}><source src={urlArchivo} type={`video/${extension}`} /></video>}
                      {extension === "pdf" && <iframe src={urlArchivo} style={{ width: '100%', height: '300px' }} onClick={() => setModalArchivo({ url: urlArchivo, ext: extension })} />}
                    </div>
                  )}
                  {m.mensaje && <p>{m.mensaje}</p>}
                  <span style={{ fontSize: '0.8em', color: '#555' }}>{new Date(m.fecha).toLocaleString()}</span>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <textarea placeholder="Escribe tu respuesta..." value={respuestas[solicitudSeleccionada.id_solicitud] || ""} onChange={e => setRespuestas(prev => ({ ...prev, [solicitudSeleccionada.id_solicitud]: e.target.value }))} rows={2} style={{ width: '100%', padding: '5px', resize: 'vertical' }} />
            <input type="file" accept="image/*,video/*,application/pdf" onChange={e => setArchivos(prev => ({ ...prev, [solicitudSeleccionada.id_solicitud]: e.target.files[0] }))} />
            <button onClick={() => handleResponder(solicitudSeleccionada.id_solicitud)}>Enviar</button>
          </div>

          {modalArchivo && (
            <div className="modal-overlay" onClick={() => setModalArchivo(null)} style={{ position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.7)',display:'flex',justifyContent:'center',alignItems:'center',zIndex:9999 }}>
              <div onClick={e=>e.stopPropagation()} style={{ position:'relative' }}>
                <button onClick={()=>setModalArchivo(null)} style={{ position:'absolute', top:5,right:5, fontSize:'1.5rem', background:'none', border:'none', color:'white', cursor:'pointer' }}>×</button>
                {["jpg","jpeg","png","gif"].includes(modalArchivo.ext) && <img src={modalArchivo.url} style={{ maxWidth:'90vw', maxHeight:'90vh', objectFit:'contain' }} />}
                {["mp4","webm","ogg"].includes(modalArchivo.ext) && <video src={modalArchivo.url} controls autoPlay style={{ maxWidth:'90vw', maxHeight:'90vh' }} />}
                {modalArchivo.ext === "pdf" && <iframe src={modalArchivo.url} style={{ width:'80vw', height:'80vh', border:'none' }} />}
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Modal evidencias */}
      {modalEvidenciaSolicitud.abierta && (
        <Modal onClose={() => setModalEvidenciaSolicitud({ ...modalEvidenciaSolicitud, abierta: false })}>
          <h2>Evidencias de la solicitud</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginTop:'10px' }}>
            {modalEvidenciaSolicitud.urls.map((url, idx) => (
              <button key={idx} onClick={() => setArchivoModalUrl(url)}>Ver evidencia {idx+1}</button>
            ))}
          </div>
        </Modal>
      )}

      {archivoModalUrl && (
        <ModalFile url={archivoModalUrl} onClose={() => setArchivoModalUrl(null)} />
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="pagination flex justify-center items-center mt-3 gap-4">
          <button onClick={() => setCurrentPage(p => Math.max(p-1,1))} disabled={currentPage===1} className="px-3 py-1 border rounded">Anterior</button>
          {[...Array(totalPages)].map((_,i)=>(
            <button key={i} onClick={()=>setCurrentPage(i+1)} className={`px-3 py-1 border rounded ${currentPage===i+1?'bg-blue-500 text-white':''}`}>{i+1}</button>
          ))}
          <button onClick={() => setCurrentPage(p => Math.min(p+1,totalPages))} disabled={currentPage===totalPages} className="px-3 py-1 border rounded">Siguiente</button>
        </div>
      )}
    </div>
  );
}
