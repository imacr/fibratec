import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { API_URL } from "../config";
import "./Unidades.css";

export default function AsignacionesActivas() {
  const [asignaciones, setAsignaciones] = useState([]);
  const [choferes, setChoferes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [administradores, setAdministradores] = useState([]);
  const [unidadesUsuario, setUnidadesUsuario] = useState([]);
  const [unidadesChofer, setUnidadesChofer] = useState([]);

  const [loading, setLoading] = useState(true);

  const [choferSeleccionado, setChoferSeleccionado] = useState("");
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState("");
  const [unidadSeleccionada, setUnidadSeleccionada] = useState("");

  // ---------------- PAGINACIÓN ----------------
  const [itemsPorPagina, setItemsPorPagina] = useState(10);
  const [paginaActual, setPaginaActual] = useState(1);

  const indexInicio = itemsPorPagina === "all"
    ? 0
    : (paginaActual - 1) * itemsPorPagina;

  const indexFin = itemsPorPagina === "all"
    ? asignaciones.length
    : indexInicio + itemsPorPagina;

  const asignacionesPaginadas = itemsPorPagina === "all"
    ? asignaciones
    : asignaciones.slice(indexInicio, indexFin);

  const totalPaginas = itemsPorPagina === "all"
    ? 1
    : Math.ceil(asignaciones.length / itemsPorPagina);

  const fetchDatos = async () => {
    try {
      const [
        resAsign,
        resChofer,
        resUsuarios,
        resUsuarioLibre,
        resChoferLibre
      ] = await Promise.all([
        fetch(`${API_URL}/asignaciones`),
        fetch(`${API_URL}/choferes`),
        fetch(`${API_URL}/api/usuarios/admins`),
        fetch(`${API_URL}/unidades/libres_usuario`),
        fetch(`${API_URL}/unidades/libres_chofer`)
      ]);

      const [
        asignData,
        choferData,
        usuariosData,
        libresUsuarioData,
        libresChoferData
      ] = await Promise.all([
        resAsign.json(),
        resChofer.json(),
        resUsuarios.json(),
        resUsuarioLibre.json(),
        resChoferLibre.json()
      ]);
      
      setAsignaciones(
        asignData.map(a => {
          const chofer = choferData.find(c => c.id_chofer === a.id_chofer);
          const usuario = usuariosData.find(u => u.id_usuario === a.id_usuario);

          return {
            ...a,
            nombre_asignado: chofer?.nombre || usuario?.nombre || "Desconocido"
          };
        })
      );

      setChoferes(choferData);
      setUsuarios(usuariosData);
      setUnidadesUsuario(libresUsuarioData);
      setUnidadesChofer(libresChoferData);

      const admins = usuariosData.filter(
        u => !choferData.some(c => c.id_usuario === u.id_usuario)
      );
      setAdministradores(admins);

    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudieron cargar los datos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDatos(); }, []);

  const unidadesFiltradas = () => {
    if (choferSeleccionado) return unidadesChofer;
    if (usuarioSeleccionado) return unidadesUsuario;
    return [];
  };

  const asignar = async () => {
    if (!unidadSeleccionada) {
      Swal.fire("Atención", "Selecciona una unidad", "warning");
      return;
    }

    if (!choferSeleccionado && !usuarioSeleccionado) {
      Swal.fire("Atención", "Selecciona un chofer o un usuario", "warning");
      return;
    }

    if (choferSeleccionado && usuarioSeleccionado) {
      Swal.fire("Atención", "Solo puedes elegir uno: chofer o usuario", "warning");
      return;
    }

    const payload = {
      id_unidad: unidadSeleccionada,
      id_chofer: choferSeleccionado || null,
      id_usuario: usuarioSeleccionado || null
    };

    try {
      const res = await fetch(`${API_URL}/asignaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) Swal.fire("Éxito", data.message, "success");
      else Swal.fire("Error", data.error, "error");

      setChoferSeleccionado("");
      setUsuarioSeleccionado("");
      setUnidadSeleccionada("");
      fetchDatos();

    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo asignar", "error");
    }
  };

  const finalizarAsignacion = async (id_asignacion) => {
    try {
      const res = await fetch(`${API_URL}/asignaciones/${id_asignacion}/finalizar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario: "admin" })
      });

      const data = await res.json();
      if (res.ok) Swal.fire("Éxito", data.message, "success");
      else Swal.fire("Error", data.error, "error");

      fetchDatos();

    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo finalizar asignación", "error");
    }
  };

  if (loading) return <p>Cargando datos...</p>;

  return (
    <div className="unidades-container">
      <h2>Asignaciones Activas</h2>

      <h4 style={{ marginTop: "30px" }}>Nueva asignación</h4>

      <div className="asignar-form"
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          alignItems: "center",
          marginTop: "10px",
          padding: "15px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          backgroundColor: "#f9f9f9"
        }}
      >

        {/* SELECT CHOFER */}
        <select
          value={choferSeleccionado}
          onChange={e => {
            setChoferSeleccionado(e.target.value);
            setUsuarioSeleccionado("");
            setUnidadSeleccionada("");
          }}
          style={{ padding: "8px", borderRadius: "5px", minWidth: "200px" }}
        >
          <option value="">--Asignar a Chofer--</option>
          {choferes.map(c => (
            <option key={c.id_chofer} value={c.id_chofer}>
              {c.nombre}
            </option>
          ))}
        </select>

        {/* SELECT USUARIO */}
        <select
          value={usuarioSeleccionado}
          onChange={e => {
            setUsuarioSeleccionado(e.target.value);
            setChoferSeleccionado("");
            setUnidadSeleccionada("");
          }}
          style={{ padding: "8px", borderRadius: "5px", minWidth: "200px" }}
        >
          <option value="">--Asignar a Administrador --</option>
          {administradores.map(u => (
            <option key={u.id_usuario} value={u.id_usuario}>
              {u.nombre}
            </option>
          ))}
        </select>

        {/* SELECT UNIDAD */}
        <select
          value={unidadSeleccionada}
          onChange={e => setUnidadSeleccionada(e.target.value)}
          style={{ padding: "8px", borderRadius: "5px", minWidth: "200px" }}
        >
          <option value="">--Selecciona Unidad--</option>
          {unidadesFiltradas().map(u => (
            <option key={u.id_unidad} value={u.id_unidad}>
              {u.id_unidad} - {u.nombre}
            </option>
          ))}
        </select>

        <button
          onClick={asignar}
          style={{
            padding: "8px 15px",
            backgroundColor: "#4caf50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Asignar
        </button>
      </div>

      {/* ---------------- SELECT DE MOSTRAR X ---------------- */}
      <div style={{ marginTop: "25px", marginBottom: "10px" }}>
        <label>Mostrar: </label>
        <select
          value={itemsPorPagina}
          onChange={e => {
            const val = e.target.value === "all" ? "all" : parseInt(e.target.value);
            setItemsPorPagina(val);
            setPaginaActual(1);
          }}
          style={{ padding: "6px", borderRadius: "5px" }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value="all">Todos</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table className="elegant-table" style={{ marginTop: "20px" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Asignado a</th>
              <th>Unidad</th>
              <th>Fecha Asignación</th>
              <th>Fecha Fin</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {asignacionesPaginadas.length > 0 ? asignacionesPaginadas.map(a => (
              <tr key={a.id_asignacion}>
                <td>{a.id_asignacion}</td>
                <td>{a.nombre_asignado}</td>
                <td>{a.cve} {a.marca} {a.version}</td>
                <td>{a.fecha_asignacion}</td>
                <td>{a.fecha_fin || "-"}</td>
                <td>
                  {!a.fecha_fin ? (
                    <button
                      className="btn-finalizar"
                      onClick={() => finalizarAsignacion(a.id_asignacion)}
                    >
                      Desasignar
                    </button>
                  ) : (
                    <span>Finalizada</span>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No hay asignaciones
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---------------- PAGINACIÓN ---------------- */}
      {itemsPorPagina !== "all" && (
        <div className="pagination">
          <button
            onClick={() => setPaginaActual(p => Math.max(p - 1, 1))}
            disabled={paginaActual === 1}
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>

          <span>Página {paginaActual} de {totalPaginas}</span>

          <button
            onClick={() => setPaginaActual(p => Math.min(p + 1, totalPaginas))}
            disabled={paginaActual === totalPaginas}
          >
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      )}

      <div className="card-wrapper">
        {asignacionesPaginadas.length === 0 ? (
          <p className="mensaje-estado">No hay asignaciones</p>
        ) : (
          asignacionesPaginadas.map(a => (
            <div key={a.id_asignacion} className="unidad-card">
              <h3>Asignación #{a.id_asignacion}</h3>
              <p><b>Asignado a:</b> {a.nombre_asignado}</p>
              <p><b>Unidad:</b> {a.cve} {a.marca} {a.version}</p>
              <p><b>Fecha Asignación:</b> {a.fecha_asignacion}</p>
              <p><b>Fecha Fin:</b> {a.fecha_fin || "-"}</p>
              <div className="actions-container">
                {!a.fecha_fin ? (
                  <button
                    className="btn-finalizar"
                    onClick={() => finalizarAsignacion(a.id_asignacion)}
                  >
                    Desasignar
                  </button>
                ) : (
                  <span>Finalizada</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
