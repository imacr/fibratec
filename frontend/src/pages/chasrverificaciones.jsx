import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";
import { API_URL } from "../config";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const calcularEstado = (prox) => {
  if (!prox) return "PENDIENTE";
  return new Date() > prox ? "ATRASADA" : "EN TIEMPO";
};

const filtrarVerificaciones = (verificaciones, sucursal, año, holograma) => {
  return verificaciones.filter(v => {
    if (sucursal && v.sucursal !== sucursal) return false;
    if (holograma && v.holograma !== holograma) return false;
    if (año && año !== "Todos") {
      return v.proxima_verificacion && v.proxima_verificacion.getFullYear() === parseInt(año);
    }
    return true;
  });
};

export default function VerificacionesChart() {
  const [verificaciones, setVerificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sucursal, setSucursal] = useState("");
  const [holograma, setHolograma] = useState("");
  const [año, setAño] = useState("Todos");
  const [viewMode, setViewMode] = useState("grafica"); // "grafica" o "vehiculos"
  const [sucursalesDisponibles, setSucursalesDisponibles] = useState([]);
  const [añosDisponibles, setAñosDisponibles] = useState([]);

  useEffect(() => {
    const fetchSucursales = async () => {
      try {
        const res = await fetch(`${API_URL}/api/sucursales`);
        const data = await res.json();
        setSucursalesDisponibles(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSucursales();
  }, []);

  useEffect(() => {
    const fetchVerificaciones = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/verificaciones`);
        const data = await res.json();

        const dataConFechas = data.map(v => {
          const prox = v.proxima_verificacion ? new Date(v.proxima_verificacion) : null;
          return {
            ...v,
            proxima_verificacion: prox,
            estado_verificacion: calcularEstado(prox)
          };
        });

        setVerificaciones(dataConFechas);

        const añosSet = new Set(["Todos"]);
        dataConFechas.forEach(v => {
          if (v.proxima_verificacion) añosSet.add(v.proxima_verificacion.getFullYear());
        });
        setAñosDisponibles(Array.from(añosSet).sort((a, b) => b - a));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVerificaciones();
  }, []);

  if (loading) return <p className="text-center mt-5 fw-bold">Cargando verificaciones...</p>;

  const verificacionesFiltradas = filtrarVerificaciones(verificaciones, sucursal, año, holograma);

  const estadosCount = { "EN TIEMPO": 0, "ATRASADA": 0, "PENDIENTE": 0 };
  verificacionesFiltradas.forEach(v => {
    if (v.estado_verificacion in estadosCount) estadosCount[v.estado_verificacion]++;
  });

  const chartData = {
    labels: Object.keys(estadosCount),
    datasets: [{
      label: "Cantidad de vehículos",
      data: Object.values(estadosCount),
      backgroundColor: ["#198754", "#dc3545", "#ffc107"],
      borderColor: ["#198754", "#dc3545", "#ffc107"],
      borderWidth: 1
    }]
  };

  const options = {
    responsive: true,
    plugins: { legend: { position: "top" }, tooltip: { mode: "index", intersect: false } },
    scales: { y: { beginAtZero: true } }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <h3 className="text-center mb-3">Estado de Verificaciones Vehiculares</h3>

      {/* Filtros */}
      <div className="d-flex justify-content-center mb-3 gap-2 flex-wrap">
        <label>Sucursal:</label>
        <select value={sucursal} onChange={e => setSucursal(e.target.value)} className="form-select w-auto">
          <option value="">Todas</option>
          {sucursalesDisponibles.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <label>Año:</label>
        <select value={año} onChange={e => setAño(e.target.value)} className="form-select w-auto">
          {añosDisponibles.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <label>Holograma:</label>
        <select value={holograma} onChange={e => setHolograma(e.target.value)} className="form-select w-auto">
          <option value="">Todos</option>
          <option value="00">00</option>
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>

        {/* Selector de vista */}
        <label>Vista:</label>
        <select value={viewMode} onChange={e => setViewMode(e.target.value)} className="form-select w-auto">
          <option value="grafica">Gráfica</option>
          <option value="vehiculos">Ver por vehículos</option>
        </select>
      </div>

      {viewMode === "grafica" ? (
        <Bar data={chartData} options={options} />
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Marca / Tipo</th>
                <th>Placa</th>
                <th>Holograma</th>
                <th>Engomado</th>
                <th>Próxima Verificación</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {verificacionesFiltradas.map(v => (
                <tr key={v.id_verificacion}>
                  <td>{v.id_verificacion}</td>
                  <td>{v.marca} {v.vehiculo}</td>
                  <td>{v.placa}</td>
                  <td>{v.holograma}</td>
                  <td>{v.engomado}</td>
                  <td>{v.proxima_verificacion ? v.proxima_verificacion.toLocaleDateString() : "-"}</td>
                  <td>{v.estado_verificacion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
