import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { API_URL } from "../config";
import "./Unidades.css";

export default function FrecuenciasPorMarca() {
  const [frecuencias, setFrecuencias] = useState([]);
  const [marca, setMarca] = useState("");
  const [tipo, setTipo] = useState("");
  const [tiempo, setTiempo] = useState("");
  const [km, setKm] = useState("");
  const [tipos, setTipos] = useState([]);

  // ============================
  // PAGINACIÓN
  // ============================
  const [itemsPorPagina, setItemsPorPagina] = useState(10);
  const [paginaActual, setPaginaActual] = useState(1);

  const totalPaginas =
    itemsPorPagina === "todos"
      ? 1
      : Math.ceil(frecuencias.length / itemsPorPagina);

  const indiceInicial =
    itemsPorPagina === "todos" ? 0 : (paginaActual - 1) * itemsPorPagina;
  const indiceFinal =
    itemsPorPagina === "todos"
      ? frecuencias.length
      : indiceInicial + itemsPorPagina;

  const frecuenciasPaginadas =
    itemsPorPagina === "todos"
      ? frecuencias
      : frecuencias.slice(indiceInicial, indiceFinal);

  // === Obtener Tipos de Mantenimiento ===
  const fetchTipos = async () => {
    try {
      const res = await fetch(`${API_URL}/tipos_mantenimiento`);
      const data = await res.json();
      setTipos(data);
    } catch {
      Swal.fire("Error", "No se pudieron cargar los tipos de mantenimiento", "error");
    }
  };

  // === Obtener Frecuencias ===
  const fetchFrecuencias = async () => {
    try {
      const res = await fetch(`${API_URL}/frecuencias_pormarca`);
      const data = await res.json();
      setFrecuencias(data);
    } catch {
      Swal.fire("Error", "No se pudieron cargar las frecuencias", "error");
    }
  };

  // === Crear nueva frecuencia ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!marca || !tipo || !tiempo || !km)
      return Swal.fire("Error", "Todos los campos son obligatorios", "error");

    try {
      const res = await fetch(`${API_URL}/frecuencias_pormarca`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marca,
          id_tipo_mantenimiento: parseInt(tipo),
          frecuencia_tiempo: parseInt(tiempo),
          frecuencia_kilometraje: parseInt(km),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire("Éxito", "Frecuencia creada correctamente", "success");
        setMarca("");
        setTipo("");
        setTiempo("");
        setKm("");
        fetchFrecuencias();
      } else {
        Swal.fire("Error", data.error || "No se pudo crear la frecuencia", "error");
      }
    } catch {
      Swal.fire("Error", "Error al conectar con el servidor", "error");
    }
  };

  useEffect(() => {
    fetchTipos();
    fetchFrecuencias();
  }, []);

  return (
    <div className="unidades-container">
      <h1>Frecuencias por Marca</h1>

      {/* ============================ */}
      {/* SELECTOR MOSTRAR */}
      {/* ============================ */}
      <div className="paginacion-controles">
        <label>Mostrar:</label>
        <select
          value={itemsPorPagina}
          onChange={(e) => {
            setItemsPorPagina(
              e.target.value === "todos" ? "todos" : parseInt(e.target.value)
            );
            setPaginaActual(1);
          }}
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="todos">Todos</option>
        </select>

        {itemsPorPagina !== "todos" && (
          <span style={{ marginLeft: "10px" }}>
            Página {paginaActual} de {totalPaginas}
          </span>
        )}
      </div>

      {/* === Formulario === */}
      <form onSubmit={handleSubmit} className="form-mantenimiento">
        <input
          type="text"
          placeholder="Marca"
          value={marca}
          onChange={(e) => setMarca(e.target.value)}
          className="form-input"
        />

        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="form-input"
        >
          <option value="">Selecciona tipo</option>
          {tipos.map((t) => (
            <option key={t.id_tipo_mantenimiento} value={t.id_tipo_mantenimiento}>
              {t.nombre_tipo}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Días"
          value={tiempo}
          onChange={(e) => setTiempo(e.target.value)}
          className="form-input"
        />

        <input
          type="number"
          placeholder="Kilometraje"
          value={km}
          onChange={(e) => setKm(e.target.value)}
          className="form-input"
        />

        <button type="submit" className="btn-agregar">
          Agregar
        </button>
      </form>

      {/* === Tabla === */}
      <div className="table-wrapper">
        <table className="elegant-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Marca</th>
              <th>Tipo</th>
              <th>Días</th>
              <th>Kilometraje</th>
            </tr>
          </thead>
          <tbody>
            {frecuenciasPaginadas.length > 0 ? (
              frecuenciasPaginadas.map((f) => {
                const tipoObj = tipos.find(
                  (t) => t.id_tipo_mantenimiento === f.id_tipo_mantenimiento
                );
                return (
                  <tr key={f.id_frecuencia}>
                    <td>{f.id_frecuencia}</td>
                    <td>{f.marca}</td>
                    <td>{tipoObj?.nombre_tipo || "—"}</td>
                    <td>{f.frecuencia_tiempo}</td>
                    <td>{f.frecuencia_kilometraje}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="mensaje-estado">
                  No hay frecuencias registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* === Cards === */}
      <div className="card-wrapper">
        {frecuenciasPaginadas.map((f) => {
          const tipoObj = tipos.find(
            (t) => t.id_tipo_mantenimiento === f.id_tipo_mantenimiento
          );

          return (
            <div key={f.id_frecuencia} className="unidad-card">
              <p><b>ID:</b> {f.id_frecuencia}</p>
              <p><b>Marca:</b> {f.marca}</p>
              <p><b>Tipo:</b> {tipoObj?.nombre_tipo || "—"}</p>
              <p><b>Días:</b> {f.frecuencia_tiempo}</p>
              <p><b>Kilometraje:</b> {f.frecuencia_kilometraje}</p>
            </div>
          );
        })}
      </div>

{/* ============================ */}
{/* BOTONES DE PAGINACIÓN */}
{/* ============================ */}
{itemsPorPagina !== "todos" && (
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
    </div>
);
}

