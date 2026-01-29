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
  const [busqueda, setBusqueda] = useState("");


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

const frecuenciasFiltradas = frecuencias.filter((f) => {
  const texto = busqueda.toLowerCase();

  const unidadTexto = f.unidad
    ? `${f.unidad.cve} ${f.unidad.marca} ${f.unidad.version}`
        .toLowerCase()
    : "";

  const tipoNombre =
    tipos.find(t => t.id_tipo_mantenimiento === f.id_tipo_mantenimiento)
      ?.nombre_tipo.toLowerCase() || "";

  return (
    unidadTexto.includes(texto) ||
    tipoNombre.includes(texto)
  );
});


  return (
    <div className="unidades-container">
      <h1>Frecuencias por Marca</h1>

      {/* === Tabla === */}
      <div className="filtros">
      <input
        type="text"
        placeholder="Buscar por CVE, marca, versión o tipo"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
    </div>

      <div className="table-wrapper">
        <table className="elegant-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Unidad</th>
              <th>Tipo</th>
              <th>Días</th>
              <th>Kilometraje</th>
            </tr>
          </thead>
          <tbody>
            {frecuenciasFiltradas.length > 0 ? (

              frecuenciasFiltradas.map((f) => {
                const tipoObj = tipos.find(
                  (t) => t.id_tipo_mantenimiento === f.id_tipo_mantenimiento
                );
                return (
                  <tr key={f.id_frecuencia}>
                    <td>{f.id_frecuencia}</td>
                    <td>
                      {f.unidad
                        ? `${f.unidad.cve} - ${f.unidad.marca} ${f.unidad.modelo} ${f.unidad.version}`
                        : ""}
                    </td>
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
