import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { API_URL } from "../config";
import "./Unidades.css";

export default function Asignaciones() {
  const [asignaciones, setAsignaciones] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [choferes, setChoferes] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);

  const [choferSeleccionado, setChoferSeleccionado] = useState("");
  const [unidadSeleccionada, setUnidadSeleccionada] = useState("");

  // -------------------- Fetch de datos --------------------
  const fetchDatos = async () => {
    try {
      const [resAsign, resChofer, resUnidades, resHistorial] = await Promise.all([
        fetch(`${API_URL}/asignaciones`),
        fetch(`${API_URL}/choferes`),
        fetch(`${API_URL}/unidades/libres`), // <-- Usamos la nueva ruta
        fetch(`${API_URL}/historial_asignaciones`)
      ]);

      setAsignaciones(await resAsign.json());
      setChoferes(await resChofer.json());
      setUnidades(await resUnidades.json()); // Unidades libres
      setHistorial(await resHistorial.json());
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudieron cargar los datos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDatos(); }, []);

  // -------------------- Asignar chofer --------------------
  const asignarChofer = async () => {
    if (!choferSeleccionado || !unidadSeleccionada) {
      Swal.fire("Atención", "Selecciona chofer y unidad", "warning");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/asignaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_chofer: choferSeleccionado,
          id_unidad: unidadSeleccionada,
          usuario: "admin"
        })
      });
      const data = await res.json();
      if (res.ok) Swal.fire("Éxito", data.message, "success");
      else Swal.fire("Error", data.error, "error");

      // Limpiar selección y refrescar datos
      setChoferSeleccionado("");
      setUnidadSeleccionada("");
      fetchDatos();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo asignar", "error");
    }
  };

  // -------------------- Finalizar asignación --------------------
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

  // -------------------- Render --------------------
  return (
    <div className="unidades-container">
      <h1>Asignaciones de Choferes</h1>

      <h2>Asignaciones Activas</h2>
      <table className="elegant-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Chofer</th>
            <th>Unidad</th>
            <th>Fecha Asignación</th>
            <th>Fecha Fin</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {asignaciones.length > 0 ? (
            asignaciones.map(a => (
              <tr key={a.id_asignacion}>
                <td>{a.id_asignacion}</td>
                <td>{a.id_chofer}</td>
                <td>{a.id_unidad}</td>
                <td>{a.fecha_asignacion}</td>
                <td>{a.fecha_fin || "-"}</td>
                <td>
                  {!a.fecha_fin ? (
                    <button onClick={() => finalizarAsignacion(a.id_asignacion)}>Desasignar</button>
                  ) : (
                    <span>Finalizada</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>No hay asignaciones</td>
            </tr>
          )}
        </tbody>
      </table>

      <h2>Asignar Chofer a Unidad</h2>
      <div className="asignar-form">
        <select value={choferSeleccionado} onChange={e => setChoferSeleccionado(e.target.value)}>
          <option value="">--Selecciona Chofer--</option>
          {choferes.map(c => (
            <option key={c.id_chofer} value={c.id_chofer}>{c.nombre}</option>
          ))}
        </select>

        <select value={unidadSeleccionada} onChange={e => setUnidadSeleccionada(e.target.value)}>
          <option value="">--Selecciona Unidad--</option>
          {unidades.map(u => (
            <option key={u.id_unidad} value={u.id_unidad}>
              {u.id_unidad} - {u.nombre}
            </option>
          ))}
        </select>

        <button onClick={asignarChofer}>Asignar</button>
      </div>

      <h2>Historial de Asignaciones</h2>
      <table className="elegant-table">
        <thead>
          <tr>
            <th>ID Historial</th>
            <th>ID Asignación</th>
            <th>Chofer</th>
            <th>Fecha Asignación</th>
            <th>Fecha Fin</th>
            <th>Usuario</th>
            <th>Fecha Cambio</th>
          </tr>
        </thead>
        <tbody>
          {historial.length > 0 ? (
            historial.map(h => (
              <tr key={h.id_historial}>
                <td>{h.id_historial}</td>
                <td>{h.id_asignacion}</td>
                <td>{h.id_chofer}</td>
                <td>{h.fecha_asignacion || "-"}</td>
                <td>{h.fecha_fin || "-"}</td>
                <td>{h.usuario}</td>
                <td>{h.fecha_cambio}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>No hay historial</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
