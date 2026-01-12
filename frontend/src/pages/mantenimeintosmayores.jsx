import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { API_URL } from "../config";
import Mantenimientos from "./Mantenimientos";
import "./Unidades.css";
import Modal from "../components/Modal";

export default function MantenimientosMayores() {
  const [programados, setProgramados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [registroSeleccionado, setRegistroSeleccionado] = useState(null);
    const [registroEditar, setRegistroEditar] = useState(null);
  // Filtros
  const [filtroID, setFiltroID] = useState("");
  const [filtroMarca, setFiltroMarca] = useState("");
  const [filtroClase, setFiltroClase] = useState("");

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(5);

  const fetchProgramados = async () => {
    try {
      const res = await fetch(`${API_URL}/mantenimientos_programados`);
      if (!res.ok) throw new Error("Error al obtener los mantenimientos");
      const data = await res.json();
      setProgramados(data.filter(p => p.tipo.toLowerCase() === "mayor"));
      setError(false);
    } catch (err) {
      console.error(err);
      setError(true);
      Swal.fire("Error", "No se pudieron cargar los mantenimientos mayores", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgramados();
  }, []);

  const handleRegistrar = (p) => {
    Swal.fire({
      title: "Registrar mantenimiento",
      text: `¿Deseas registrar el mantenimiento mayor para la unidad ${p.id_unidad} - ${p.marca} ${p.clase_tipo}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) setRegistroSeleccionado(p);
    });
  };

  const diasRestantes = (fecha) => {
    if (!fecha) return null;
    const hoy = new Date();
    const proxima = new Date(fecha);
    return Math.ceil((proxima - hoy) / (1000 * 60 * 60 * 24));
  };

  // Filtrado dinámico
  const filtrados = programados.filter(p => {
    return (
      (filtroID === "" || p.id_unidad.toString().includes(filtroID)) &&
      (filtroMarca === "" || p.marca.toLowerCase().includes(filtroMarca.toLowerCase())) &&
      (filtroClase === "" || p.clase_tipo.toLowerCase().includes(filtroClase.toLowerCase()))
    );
  });

  // Paginación
  const totalPaginas = itemsPorPagina === "all" ? 1 : Math.ceil(filtrados.length / itemsPorPagina);
  const mostrarFilas = itemsPorPagina === "all"
    ? filtrados
    : filtrados.slice((paginaActual - 1) * itemsPorPagina, paginaActual * itemsPorPagina);

    const handleEdit = (p) => {
      setRegistroSeleccionado(null); // 🔴 cerrar registrar
      setRegistroEditar(p);          // 🟢 abrir editar
    };
    
      const handleDelete = async (registro) => {
        Swal.fire({
          title: "Eliminar mantenimiento",
          text: `¿Deseas eliminar el mantenimiento de la unidad ${registro.cve} - ${registro.marca} ${registro.clase_tipo}?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Sí, eliminar",
          cancelButtonText: "Cancelar",
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              const res = await fetch(`${API_URL}/mantenimientos_programados/${registro.id_mantenimiento_programado}`, {
                method: "DELETE",
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || "Error al eliminar");
              Swal.fire("Eliminado", data.message, "success");
              fetchProgramados();
            } catch (err) {
              console.error(err);
              Swal.fire("Error", err.message, "error");
            }
          }
        });
      };
    
      // --- FORMULARIO DE EDITAR ---
      const FormularioEditar = ({ registro, onClose }) => {
        const [fechaUltimo, setFechaUltimo] = useState(registro.fecha_ultimo_mantenimiento || "");
        const [kmUltimo, setKmUltimo] = useState(registro.kilometraje_ultimo || "");
        const [proximoFecha, setProximoFecha] = useState(registro.proximo_mantenimiento || "");
        const [proximoKm, setProximoKm] = useState(registro.proximo_kilometraje || "");
    
        const handleSubmit = async (e) => {
          e.preventDefault();
          try {
            const res = await fetch(`${API_URL}/mantenimientos_programados/${registro.id_mantenimiento_programado}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                fecha_ultimo_mantenimiento: fechaUltimo,
                kilometraje_ultimo: kmUltimo,
                proximo_mantenimiento: proximoFecha,
                proximo_kilometraje: proximoKm,
              }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Error al actualizar");
            Swal.fire("Actualizado", data.message, "success");
            fetchProgramados();
            onClose();
          } catch (err) {
            console.error(err);
            Swal.fire("Error", err.message, "error");
          }
        };
    
        return (
          <form onSubmit={handleSubmit} className="form-editar">
            <h3>Editar Mantenimiento</h3>
            <label>Último mantenimiento:</label>
            <input type="date" value={fechaUltimo} onChange={(e) => setFechaUltimo(e.target.value)} />
            <label>Kilometraje último:</label>
            <input type="number" value={kmUltimo} onChange={(e) => setKmUltimo(e.target.value)} />
            <label>Próximo mantenimiento:</label>
            <input type="date" value={proximoFecha} onChange={(e) => setProximoFecha(e.target.value)} />
            <label>Próximo kilometraje:</label>
            <input type="number" value={proximoKm} onChange={(e) => setProximoKm(e.target.value)} />
            <div className="botones-form">
              <button type="submit" className="btn btn-primary">Guardar</button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            </div>
          </form>
        );
      };
    
  return (
    <div className="unidades-container">
      <h1>Mantenimientos Mayores</h1>

      {/* Filtros */}
      <div className="filtros">
        <input type="text" placeholder="Filtrar por ID" value={filtroID} onChange={(e) => setFiltroID(e.target.value)} />
        <input type="text" placeholder="Filtrar por Marca" value={filtroMarca} onChange={(e) => setFiltroMarca(e.target.value)} />
        <input type="text" placeholder="Filtrar por Clase" value={filtroClase} onChange={(e) => setFiltroClase(e.target.value)} />
      </div>

      {/* Selección de items por página */}
      <div className="paginacion-control">
        <label>Mostrar: </label>
        <select value={itemsPorPagina} onChange={(e) => { setItemsPorPagina(e.target.value === "all" ? "all" : parseInt(e.target.value)); setPaginaActual(1); }}>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value="all">Todos</option>
        </select>
      </div>

      {loading ? (
        <div className="mensaje-estado">Cargando datos...</div>
      ) : error ? (
        <div className="mensaje-estado error">Error al cargar los datos.</div>
      ) : (
        <div className="table-wrapper">
          <table className="elegant-table">
            <thead>
              <tr>
                <th>CVE</th>
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
              {mostrarFilas.length > 0 ? (
                mostrarFilas.map((p) => {
                  const dias = diasRestantes(p.proximo_mantenimiento);
                  const kmActual = parseInt(p.kilometraje_actual, 10);
                  const kmProximo = parseInt(p.proximo_kilometraje, 10);

                  const kmRestante =
                    !isNaN(kmActual) && !isNaN(kmProximo)
                      ? kmProximo - kmActual
                      : null;

                  const activar = dias !== null && kmRestante !== null && (dias <= 7 || kmRestante <= 500 || dias < 0 || kmRestante < 0);

                  const alerta =
                    dias < 0 || kmRestante < 0
                      ? "alerta-vencido-menor"
                      : dias <= 7 || kmRestante <= 500
                      ? "alerta-proximo-menor"
                      : "";

                  return (
                    <tr key={p.id_mantenimiento_programado} className={alerta}>
                      <td>{p.cve}</td>
                      <td>{p.marca} {p.version} {p.clase_tipo}</td>
                      <td>{p.tipo}</td>
                      <td>{p.fecha_ultimo_mantenimiento || "-"}</td>
                      <td>{p.kilometraje_ultimo || "-"}</td>
                      <td>{p.proximo_mantenimiento || "-"}</td>
                      <td>{p.proximo_kilometraje || "-"}</td>
                      <td>{dias !== null ? (dias >= 0 ? `${dias} días` : "Vencido") : "-"}</td>
                      <td>
                        <button
                          className="btn-registrar"
                          disabled={!activar}
                          onClick={() => handleRegistrar(p)}
                        >
                          Registrar
                        </button>
                      <button onClick={() => handleEdit(p)}><i className="fa-solid fa-pen-to-square icon-edit"></i></button>

                      <button onClick={() => handleDelete(p)}><i className="fa-solid fa-trash icon-delete"></i></button>

                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" style={{ textAlign: "center" }}>
                    No hay mantenimientos mayores programados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Paginación */}
          {itemsPorPagina !== "all" && (
            <div className="paginacion">
              <button onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))} disabled={paginaActual === 1}>
                {"<"}
              </button>
              <span>Página {paginaActual} de {totalPaginas}</span>
              <button onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))} disabled={paginaActual === totalPaginas}>
                {">"}
              </button>
            </div>
          )}
        </div>
      )}
<div className="card-wrapper">
  {mostrarFilas.length > 0 ? mostrarFilas
    .slice((paginaActual - 1) * itemsPorPagina, paginaActual * itemsPorPagina)
    .map((p) => {
      const dias = diasRestantes(p.proximo_mantenimiento);
      const kmRestante = (p.proximo_kilometraje || 0) - (p.kilometraje_ultimo || 0);
      const activar =
        dias !== null &&
        kmRestante !== null &&
        (dias <= 7 || kmRestante <= 500 || dias < 0 || kmRestante < 0);

      const alerta =
        dias < 0 || kmRestante < 0
          ? "card-vencido-mayor"
          : dias <= 7 || kmRestante <= 500
          ? "card-proximo-mayor"
          : "card-normal";

      return (
        <div key={p.id_mantenimiento_programado} className={`unidad-card ${alerta}`}>
          <h3>{p.marca} - {p.tipo}</h3>
          <p><b>ID Unidad:</b> {p.id_unidad}</p>
          <p><b>Clase tipo:</b>{p.marca} {p.version} {p.clase_tipo} </p>
          <p><b>Último Mantenimiento:</b> {p.fecha_ultimo_mantenimiento || "-"}</p>
          <p><b>Kilometraje Último:</b> {p.kilometraje_ultimo || "-"}</p>
          <p><b>Próximo Mantenimiento:</b> {p.proximo_mantenimiento || "-"}</p>
          <p><b>Próximo Kilometraje:</b> {p.proximo_kilometraje || "-"}</p>
          <p><b>Días Restantes:</b> {dias !== null ? (dias >= 0 ? `${dias} días` : "Vencido") : "-"}</p>

          <div className="actions-container">
            <button
              className="btn btn-registrar"
              disabled={!activar}
              onClick={() => handleRegistrar(p)}
            >
              Registrar
            </button>
            <button onClick={() => handleEdit(p)}><i className="fa-solid fa-pen-to-square icon-edit"></i></button>

            <button onClick={() => handleDelete(p)}><i className="fa-solid fa-trash icon-delete"></i></button>

          </div>
        </div>
      );
    })
    : <p>No hay mantenimientos mayores programados.</p>
  }

  {/* Paginación */}
  {itemsPorPagina !== "all" && mostrarFilas.length > itemsPorPagina && (
    <div className="paginacion">
      <button onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))} disabled={paginaActual === 1}>
        {"<"}
      </button>
      <span>Página {paginaActual} de {Math.ceil(mostrarFilas.length / itemsPorPagina)}</span>
      <button onClick={() => setPaginaActual(prev => Math.min(prev + 1, Math.ceil(mostrarFilas.length / itemsPorPagina)))} disabled={paginaActual === Math.ceil(mostrarFilas.length / itemsPorPagina)}>
        {">"}
      </button>
    </div>
  )}
</div>

{registroEditar ? (
  <Modal onClose={() => setRegistroEditar(null)}>
    <FormularioEditar
      registro={registroEditar}
      onClose={() => setRegistroEditar(null)}
    />
  </Modal>
) : registroSeleccionado ? (
  <Modal onClose={() => setRegistroSeleccionado(null)}>
    <Mantenimientos
      registroPrellenado={registroSeleccionado}
      onSuccess={() => {
        setRegistroSeleccionado(null);
        fetchProgramados();
      }}
    />


  </Modal>
) : null}



    </div>
  );
}
