import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { API_URL } from "../config";
import "./Unidades.css";

export default function MantenimientosProgramados() {
  const [programados, setProgramados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchProgramados = async () => {
    try {
      const res = await fetch(`${API_URL}/mantenimientos_programados`);
      if (!res.ok) throw new Error("Error al obtener los mantenimientos");
      const data = await res.json();
      setProgramados(data);
      setError(false);
    } catch (err) {
      console.error(err);
      setError(true);
      Swal.fire("Error", "No se pudieron cargar los mantenimientos programados", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgramados();
  }, []);

  // 🔧 Función para registrar mantenimiento (luego se conectará a tu modal o POST real)
  const handleRegistrar = (p) => {
    Swal.fire({
      title: "Registrar mantenimiento",
      text: `¿Deseas registrar el mantenimiento de ${p.tipo} para la unidad ${p.placa}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, registrar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        // Aquí luego harás tu POST /mantenimientos
        Swal.fire("Registrado", "Mantenimiento marcado como realizado.", "success");
      }
    });
  };

  // 🔢 Función para calcular días restantes
  const diasRestantes = (fecha) => {
    if (!fecha) return null;
    const hoy = new Date();
    const proxima = new Date(fecha);
    const diffMs = proxima - hoy;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="unidades-container">
      <h1>Mantenimientos Programados</h1>

      {loading ? (
        <div className="mensaje-estado">Cargando datos...</div>
      ) : error ? (
        <div className="mensaje-estado error">Error al cargar los datos.</div>
      ) : (
        <div className="table-wrapper">
          <table className="elegant-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Unidad</th>
                <th>Marca</th>
                <th>Tipo</th>
                <th>Último Mantenimiento</th>
                <th>Kilometraje Último</th>
                <th>Próximo Mantenimiento</th>
                <th>Próximo Kilometraje</th>
                <th>Días Restantes</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {programados.length > 0 ? (
                programados.map((p) => {
                  const dias = diasRestantes(p.proximo_mantenimiento);
                  const activar = dias !== null && dias <= 7 && dias >= 0; // 🔥 Activa si faltan ≤7 días

                  return (
                    <tr
                      key={p.id_mantenimiento_programado}
                      className={activar ? "alerta-proximo" : ""}
                    >
                      <td>{p.id_mantenimiento_programado}</td>
                      <td>{p.placa}</td>
                      <td>{p.marca}</td>
                      <td>{p.tipo}</td>
                      <td>{p.fecha_ultimo_mantenimiento || "-"}</td>
                      <td>{p.kilometraje_ultimo || "-"}</td>
                      <td>{p.proximo_mantenimiento || "-"}</td>
                      <td>{p.proximo_kilometraje || "-"}</td>
                      <td>
                        {dias !== null
                          ? dias > 0
                            ? `${dias} días`
                            : "Vencido"
                          : "-"}
                      </td>
                      <td>
                        <button
                          className="btn-registrar"
                          disabled={!activar}
                          onClick={() => handleRegistrar(p)}
                        >
                          Registrar
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" style={{ textAlign: "center" }}>
                    No hay mantenimientos programados registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
