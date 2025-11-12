import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { API_URL } from "../config";

export default function TiposMantenimiento() {
  const [tipos, setTipos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // === Cargar Tipos de Mantenimiento ===
  const fetchTipos = async () => {
    try {
      const res = await fetch(`${API_URL}/tipos_mantenimiento`);
      const data = await res.json();
      setTipos(data);
    } catch (err) {
      Swal.fire("Error", "No se pudo cargar la lista de tipos de mantenimiento", "error");
    }
  };

  // === Crear nuevo tipo ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim())
      return Swal.fire("Error", "El campo 'Nombre' es obligatorio", "error");

    try {
      const res = await fetch(`${API_URL}/tipos_mantenimiento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_tipo: nombre, descripcion }),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire("Éxito", "Tipo de mantenimiento creado correctamente", "success");
        setNombre("");
        setDescripcion("");
        fetchTipos();
      } else {
        Swal.fire("Error", data.error || "No se pudo crear el tipo de mantenimiento", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Error al conectar con el servidor", "error");
    }
  };

  useEffect(() => {
    fetchTipos();
  }, []);

  return (
    <div className="unidades-container">
      <h1>Tipos de Mantenimiento</h1>

      <form onSubmit={handleSubmit} className="form-mantenimiento">
        <input
          type="text"
          placeholder="Nombre del tipo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="form-input"
        />
        <input
          type="text"
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="form-input"
        />
        <button type="submit" className="btn-agregar">
          Agregar
        </button>
      </form>

      <div className="table-wrapper">
        <table className="elegant-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            {tipos.length > 0 ? (
              tipos.map((t) => (
                <tr key={t.id_tipo_mantenimiento}>
                  <td>{t.id_tipo_mantenimiento}</td>
                  <td>{t.nombre_tipo}</td>
                  <td>{t.descripcion || "—"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No hay tipos de mantenimiento registrados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
