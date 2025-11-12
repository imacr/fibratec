import React, { useEffect, useState } from "react"; 
import Swal from "sweetalert2";
import "./Unidades.css";
import { API_URL } from "../config";
import ModalFile from "../components/ModalFile"; // importa tu modal


// Meses por engomado (solo fallback)
const MESES_ENGOMADO = {
  primer_semestre: { amarillo: [1, 2], rosa: [2, 3], rojo: [3, 4], verde: [4, 5], azul: [5, 6] },
  segundo_semestre: { amarillo: [7, 8], rosa: [8, 9], rojo: [9, 10], verde: [10, 11], azul: [11, 12] }
};

const ultimoDiaMes = (año, mes) => new Date(año, mes, 0).getDate();

const calcularFechaPorEngomado = (periodo, engomado, año) => {
  if (!engomado) return "";
  let meses = [];
  if (periodo === "1") meses = MESES_ENGOMADO.primer_semestre[engomado.toLowerCase()] || [];
  else if (periodo === "2") meses = MESES_ENGOMADO.segundo_semestre[engomado.toLowerCase()] || [];
  if (meses.length === 0) return "";
  const ultimoMes = Math.max(...meses);
  const ultimoDia = ultimoDiaMes(año, ultimoMes);
  return new Date(año, ultimoMes - 1, ultimoDia).toISOString().split("T")[0];
};

const calcularInicioPeriodo = (fechaSugerida) => {
  if (!fechaSugerida) return null;
  const fecha = new Date(fechaSugerida);
  fecha.setMonth(fecha.getMonth() - 2); // restar 2 meses
  return fecha;
};

useEffect
const Verificaciones = () => {
  const [verificaciones, setVerificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [idUnidad, setIdUnidad] = useState("");
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("1");
  const [periodoReal, setPeriodoReal] = useState("");
  const [fechaSugerida, setFechaSugerida] = useState("");
  const [holograma, setHolograma] = useState("");
  const [folio, setFolio] = useState("");
  const [engomado, setEngomado] = useState("");
  const [placa, setPlaca] = useState("");
  const [archivo, setArchivo] = useState(null);

  const añoActual = new Date().getFullYear();
  const ultimos3Años = [añoActual, añoActual - 1, añoActual - 2];
  const [usarAñoAnterior, setUsarAñoAnterior] = useState(false);
  const [añoSeleccionado, setAñoSeleccionado] = useState(añoActual);

  const [unidadExiste, setUnidadExiste] = useState(false);
  const [verificacionExistente, setVerificacionExistente] = useState(null);
  const [checkingUnidad, setCheckingUnidad] = useState(false);
  const [formDisabled, setFormDisabled] = useState(false);
  const [modalUrl, setModalUrl] = useState(null);


  const obtenerVerificaciones = async () => {
    try {
      const res = await fetch(`${API_URL}/api/verificaciones`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const dataWithEstado = data.map((v) => {
        let estado = "PENDIENTE";
        if (v.proxima_verificacion) {
          const fechaProx = new Date(v.proxima_verificacion);
          const hoy = new Date();
          estado = hoy > fechaProx ? "ATRASADA" : "EN TIEMPO";
        }
        return { ...v, estado_verificacion: estado, fecha_limite: v.proxima_verificacion || null };
      });

      setVerificaciones(Array.isArray(dataWithEstado) ? dataWithEstado : []);
    } catch (err) {
      console.error("Error al obtener verificaciones:", err);
      Swal.fire({ icon: "error", title: "Error", text: "No se pudieron cargar las verificaciones." });
    } finally {
      setLoading(false);
    }
  };

const checkUnidadLocal = async () => {
  if (!idUnidad) {
    setUnidadExiste(false);
    setVerificacionExistente(null);
    setEngomado("");
    setPlaca("");
    setFechaSugerida("");
    setFormDisabled(false);
    return;
  }

  setCheckingUnidad(true);
FormData
  try {
    const res = await fetch(`${API_URL}/api/unidad/${idUnidad}`);
    if (!res.ok) throw new Error("Unidad no encontrada");
    const data = await res.json();

    setPlaca(data.placa || "");
    setEngomado(data.engomado || "");

    const añoRegistro = usarAñoAnterior ? añoSeleccionado : añoActual;

    // 🔹 Buscar verificación del año registrado
    const found = verificaciones.find(v =>
      String(v.id_unidad) === String(idUnidad) &&
      ((v.periodo_1 && new Date(v.periodo_1).getFullYear() === añoRegistro) ||
       (v.periodo_2 && new Date(v.periodo_2).getFullYear() === añoRegistro))
    );

    // 🔹 Bloqueo por holograma 00 vigente (cualquier año)
    const holograma00 = verificaciones.find(v =>
      String(v.id_unidad) === String(idUnidad) &&
      v.holograma === "00" &&
      v.proxima_verificacion &&
      new Date(v.proxima_verificacion) > new Date()
    );

    if (holograma00) {
      setUnidadExiste(true);
      setVerificacionExistente(holograma00);
      setHolograma("00");
      setFormDisabled(true);
      setPeriodoSeleccionado("1");
      setFechaSugerida(new Date(holograma00.proxima_verificacion).toISOString().split("T")[0]);

      Swal.fire({
        icon: "info",
        title: "Holograma 00 vigente",
        text: `No se puede registrar un nuevo periodo. Holograma 00 vigente hasta ${new Date(holograma00.proxima_verificacion).toLocaleDateString()}.`,
        timer: 4000,
        showConfirmButton: false
      });
      return;
    }

    if (!found) {
      setUnidadExiste(false);
      setVerificacionExistente(null);
      setFormDisabled(false);
      setFechaSugerida("");
      Swal.fire({
        icon: "info",
        title: "Automóvil sin registro",
        text: `Puedes ingresar un nuevo periodo para el año ${añoRegistro}.`,
        timer: 3000,
        showConfirmButton: false
      });
      return;
    }

    // Unidad con verificación del año seleccionado
    setUnidadExiste(true);
    setVerificacionExistente(found);
    setHolograma(found.holograma || "");
    setFolio(found.folio_verificacion || "");

    let bloquear = false;

    if (found.periodo_1 && found.periodo_2) {
      bloquear = true;
      setFormDisabled(true);
      const vigencia = found.proxima_verificacion ? new Date(found.proxima_verificacion) : null;
      Swal.fire({
        icon: "info",
        title: "Periodos completos",
        text: `Esta unidad ya tiene ambos periodos registrados para el año ${añoRegistro}.${vigencia ? ` Vigencia hasta: ${vigencia.toLocaleDateString()}` : ""}`,
        timer: 4000,
        showConfirmButton: false
      });
    } else if (found.periodo_1 && !found.periodo_2) {
      setPeriodoSeleccionado("2");
      Swal.fire({
        icon: "info",
        title: "Aviso",
        text: "El periodo 1 ya está registrado. Se seleccionó automáticamente el periodo 2.",
        timer: 2500,
        showConfirmButton: false
      });
    } else if (!found.periodo_1 && found.periodo_2) {
      setPeriodoSeleccionado("1");
    } else {
      setPeriodoSeleccionado("1");
    }

    setFormDisabled(bloquear);

  } catch (err) {
    console.error(err);
    Swal.fire({ icon: "error", title: "Error", text: "No se encontró la unidad." });
    setEngomado("");
    setPlaca("");
    setUnidadExiste(false);
    setVerificacionExistente(null);
    setFechaSugerida("");
    setFormDisabled(false);
  } finally {
    setCheckingUnidad(false);
  }
};


  const handleIdBlur = () => checkUnidadLocal();
  const handleFileChange = (e) => setArchivo(e.target.files[0] ?? null);

  const resetForm = () => {
    setIdUnidad("");
    setPeriodoSeleccionado("1");
    setPeriodoReal("");
    setFechaSugerida("");
    setHolograma("");
    setFolio("");
    setEngomado("");
    setPlaca("");
    setArchivo(null);
    setUnidadExiste(false);
    setVerificacionExistente(null);
    setFormDisabled(false);
    setUsarAñoAnterior(false);
    setAñoSeleccionado(añoActual);
  };

  // Actualiza fecha sugerida y real editable
  useEffect(() => {
    const año = usarAñoAnterior ? añoSeleccionado : añoActual;
    if (verificacionExistente) {
      const fechaExistente = periodoSeleccionado === "1" ? verificacionExistente.periodo_1_real : verificacionExistente.periodo_2_real;
      const vigencia = verificacionExistente.proxima_verificacion ? new Date(verificacionExistente.proxima_verificacion) : null;
      setFechaSugerida(vigencia ? vigencia.toISOString().split("T")[0] : calcularFechaPorEngomado(periodoSeleccionado, engomado, año));
      setPeriodoReal(fechaExistente || (vigencia ? vigencia.toISOString().split("T")[0] : calcularFechaPorEngomado(periodoSeleccionado, engomado, año)));
    } else {
      setFechaSugerida(calcularFechaPorEngomado(periodoSeleccionado, engomado, año));
      setPeriodoReal(calcularFechaPorEngomado(periodoSeleccionado, engomado, año));
    }
  }, [periodoSeleccionado, engomado, verificacionExistente, usarAñoAnterior, añoSeleccionado]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formDisabled) return;

    if (!idUnidad) return Swal.fire({ icon: "warning", title: "ID requerido", text: "Indica el ID de la unidad." });
    if (!archivo) return Swal.fire({ icon: "warning", title: "Archivo requerido", text: "Debes seleccionar un PDF." });

    if (fechaSugerida && new Date(periodoReal) > new Date(fechaSugerida)) {
      return Swal.fire({ icon: "warning", title: "Fecha inválida", text: "La fecha real no puede superar la fecha límite." });
    }

    const formData = new FormData();
    formData.append("id_unidad", idUnidad);
    formData.append(`periodo_${periodoSeleccionado}`, fechaSugerida);
    formData.append(`periodo_${periodoSeleccionado}_real`, periodoReal);
    if (holograma) formData.append("holograma", holograma);
    if (folio) formData.append("folio_verificacion", folio);
    if (engomado) formData.append("engomado", engomado);
    formData.append("archivo", archivo);

    try {
      const res = await fetch(`${API_URL}/api/verificaciones`, { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok) {
        Swal.fire({ icon: "success", title: "Éxito", text: data.message || "Operación completada." });
        resetForm();
        obtenerVerificaciones();
      } else {
        Swal.fire({ icon: "error", title: "Error", text: data.error || "Fallo en el servidor." });
      }
    } catch (err) {
      console.error("Error al enviar verificación:", err);
      Swal.fire({ icon: "error", title: "Error", text: "Ocurrió un error al enviar la verificación." });
    }
  };

  useEffect(() => { obtenerVerificaciones(); }, []);

  if (loading) return <p className="text-center mt-5 fw-bold">Cargando verificaciones...</p>;

  return (
    <div className="unidades-container mt-4">
      <h2 className="text-center mb-3 text-danger fw-bold">Verificaciones Vehiculares</h2>

      <div className="card mb-4 shadow p-3 rounded">
        <h5 className="fw-bold mb-3 text-center">Registrar / Actualizar Verificación</h5>
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-2">
          <div className="d-flex gap-2">
            <input
              type="number"
              placeholder="ID Unidad"
              value={idUnidad}
              onChange={(e) => setIdUnidad(e.target.value)}
              onBlur={handleIdBlur}
              required
            />
            <button type="button" className="btn btn-outline-danger" onClick={checkUnidadLocal} disabled={checkingUnidad}>
              Comprobar unidad
            </button>
          </div>

          {formDisabled && (
            <div className="alert alert-info py-1">
              Esta unidad no puede registrar otro periodo todavía.
            </div>
          )}

          <input type="text" placeholder="Placa" value={placa} readOnly className="form-control" />
          <input type="text" placeholder="Engomado" value={engomado} readOnly className="form-control" />

          {!formDisabled && (
            <>
              <div className="d-flex gap-2 align-items-center">
                <select className="form-select" value={periodoSeleccionado} onChange={(e) => setPeriodoSeleccionado(e.target.value)}>
                  <option value="1" disabled={verificacionExistente?.periodo_1}>Periodo 1</option>
                  <option value="2" disabled={verificacionExistente?.periodo_2 || (verificacionExistente?.holograma === "00" && new Date() < new Date(fechaSugerida))}>
                    Periodo 2
                  </option>
                </select>

                <label className="mb-0">Año anterior</label>
                <input type="checkbox" checked={usarAñoAnterior} onChange={(e) => setUsarAñoAnterior(e.target.checked)} />
                {usarAñoAnterior && (
                  <select className="form-select" value={añoSeleccionado} onChange={(e) => setAñoSeleccionado(parseInt(e.target.value))}>
                    {ultimos3Años.map(año => <option key={año} value={año}>{año}</option>)}
                  </select>
                )}
              </div>

              <div className="d-flex gap-2 align-items-center">
                <label className="mb-0">Fecha límite sugerida</label>
                <input type="date" value={fechaSugerida} readOnly className="form-control" />

                <label className="mb-0">Fecha real registrada</label>
                <input type="date" value={periodoReal} onChange={(e) => setPeriodoReal(e.target.value)} className="form-control" />
              </div>

              <input type="text" placeholder="Holograma" value={holograma} onChange={(e) => setHolograma(e.target.value)} />
              <input type="text" placeholder="Folio" value={folio} onChange={(e) => setFolio(e.target.value)} />
              <input type="file" accept="application/pdf" onChange={handleFileChange} required />

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-danger fw-bold" disabled={formDisabled}>📄 Registrar Verificación</button>
                <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>Limpiar</button>
              </div>
            </>
          )}
        </form>
      </div>

      {/* Tabla de verificaciones */}
      <div className="table-responsive shadow rounded">
        <table className="elegant-table">
          <thead className="table-dark text-center">
            <tr>
              <th>ID</th><th>ID un</th><th>Unidad</th><th>Placa</th><th>Modelo</th><th>Última</th>
              <th>Periodo 1</th><th>Real 1</th><th>URL 1</th>
              <th>Periodo 2</th><th>Real 2</th><th>URL 2</th>
              <th>Holograma</th><th>Folio</th><th>Engomado</th>
              <th>Estado</th><th>Próxima Verificación</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {verificaciones.length > 0 ? verificaciones.map((v) => (
              <tr key={v.id_verificacion} className={
                v.estado_verificacion === "EN TIEMPO" ? "table-success" :
                v.estado_verificacion === "ATRASADA" ? "table-danger" :
                v.estado_verificacion === "PENDIENTE" ? "table-warning" : ""
              }>
                <td>{v.id_verificacion}</td>
                <td>{v.id_unidad}</td>
                <td>{v.marca} {v.vehiculo}</td>
                <td>{v.placa}</td>
                <td>{v.modelo}</td>
                <td>{v.ultima_verificacion}</td>
                <td>{v.periodo_1}</td>
                <td>{v.periodo_1_real}</td>
                <td>
                  {v.url_verificacion_1 ? (
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => setModalUrl(`${API_URL}/${v.url_verificacion_1}`)}
                    >
                      Ver PDF
                    </button>
                  ) : ""}
                </td>
                <td>{v.periodo_2}</td>
                <td>{v.periodo_2_real}</td>
                <td>
                  {v.url_verificacion_2 ? (
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => setModalUrl(`${API_URL}/${v.url_verificacion_2}`)}
                    >
                      Ver PDF
                    </button>
                  ) : ""}
                </td>
                <td>{v.holograma}</td>
                <td>{v.folio_verificacion}</td>
                <td>{v.engomado}</td>
                <td>{v.estado_verificacion}</td>
                <td>{v.fecha_limite ? new Date(v.fecha_limite).toLocaleDateString() : "—"}</td>
              </tr>
            )) : <tr><td colSpan="16">Sin registros</td></tr>}
          </tbody>
        </table>
        {modalUrl && <ModalFile url={modalUrl} onClose={() => setModalUrl(null)} />}
      </div>
    </div>
  );
};

export default Verificaciones;
