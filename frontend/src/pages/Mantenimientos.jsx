import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { API_URL } from "../config"; // Asegúrate que aquí tengas tu backend base, ej: export const API_URL = "http://localhost:5000";

export default function Mantenimientos() {
  const [tipos, setTipos] = useState([]);
  const [form, setForm] = useState({
    id_unidad: "",
    tipo_mantenimiento: "",
    descripcion: "",
    fecha_realizacion: "",
    kilometraje: "",
    realizado_por: "",
    empresa_garantia: "",
    cobertura_garantia: "",
    costo: "",
    observaciones: "",
    url_comprobante: "",
  });

  // Cargar tipos de mantenimiento
  useEffect(() => {
    fetch(`${API_URL}/tipos_mantenimiento`)
      .then((res) => res.json())
      .then(setTipos)
      .catch((err) => console.error("Error cargando tipos:", err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.tipo_mantenimiento || !form.id_unidad || !form.fecha_realizacion) {
      Swal.fire("Campos incompletos", "Llena los obligatorios", "warning");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/mantenimientos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        Swal.fire("Éxito", "Mantenimiento registrado correctamente", "success");
        setForm({
          id_unidad: "",
          tipo_mantenimiento: "",
          descripcion: "",
          fecha_realizacion: "",
          kilometraje: "",
          realizado_por: "",
          empresa_garantia: "",
          cobertura_garantia: "",
          costo: "",
          observaciones: "",
          url_comprobante: "",
        });
      } else {
        Swal.fire("Error", "No se pudo registrar el mantenimiento", "error");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Error de conexión con el servidor", "error");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Registro de Mantenimientos</h2>
      <form onSubmit={handleSubmit} className="p-4 shadow rounded bg-light">
        <div className="row">
          <div className="col-md-4 mb-3">
            <label>Unidad (ID)</label>
            <input
              type="number"
              name="id_unidad"
              value={form.id_unidad}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="col-md-4 mb-3">
            <label>Tipo de Mantenimiento</label>
            <select
              name="tipo_mantenimiento"
              value={form.tipo_mantenimiento}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Selecciona...</option>
              {tipos.map((t) => (
                <option key={t.id_tipo_mantenimiento} value={t.nombre_tipo}>
                  {t.nombre_tipo}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4 mb-3">
            <label>Fecha Realización</label>
            <input
              type="date"
              name="fecha_realizacion"
              value={form.fecha_realizacion}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-4 mb-3">
            <label>Kilometraje</label>
            <input
              type="number"
              name="kilometraje"
              value={form.kilometraje}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="col-md-4 mb-3">
            <label>Realizado por</label>
            <input
              type="text"
              name="realizado_por"
              value={form.realizado_por}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="col-md-4 mb-3">
            <label>Costo (MXN)</label>
            <input
              type="number"
              step="0.01"
              name="costo"
              value={form.costo}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label>Empresa Garantía</label>
            <input
              type="text"
              name="empresa_garantia"
              value={form.empresa_garantia}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>Cobertura Garantía</label>
            <input
              type="text"
              name="cobertura_garantia"
              value={form.cobertura_garantia}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>

        <div className="mb-3">
          <label>Descripción</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            className="form-control"
            rows="3"
          />
        </div>

        <div className="mb-3">
          <label>Observaciones</label>
          <textarea
            name="observaciones"
            value={form.observaciones}
            onChange={handleChange}
            className="form-control"
            rows="2"
          />
        </div>

        <div className="mb-3">
          <label>URL del comprobante</label>
          <input
            type="text"
            name="url_comprobante"
            value={form.url_comprobante}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="text-center">
          <button type="submit" className="btn btn-success">
            Registrar Mantenimiento
          </button>
        </div>
      </form>
    </div>
  );
}
