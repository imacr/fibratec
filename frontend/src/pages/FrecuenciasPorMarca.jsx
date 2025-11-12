import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { API_URL } from "../config";
import "./Unidades.css"; // ✅ reutilizamos los estilos globales

export default function FrecuenciasPorMarca() {
  const [frecuencias, setFrecuencias] = useState([]);
  const [marca, setMarca] = useState("");
  const [tipo, setTipo] = useState("");
  const [tiempo, setTiempo] = useState("");
  const [km, setKm] = useState("");
  const [tipos, setTipos] = useState([]);

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
            {frecuencias.length > 0 ? (
              frecuencias.map((f) => {
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
    </div>
  );
}
