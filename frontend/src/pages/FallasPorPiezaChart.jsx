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
import { BASE_URL } from "../config"; // Ajusta según tu configuración

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function FallasPorPiezaChart() {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sucursal, setSucursal] = useState("");
  const [sucursalesDisponibles, setSucursalesDisponibles] = useState([]);
  const [limit, setLimit] = useState(10);
  const [mostrarTodas, setMostrarTodas] = useState(false);

  // --- Traer sucursales dinámicamente ---
  useEffect(() => {
    const fetchSucursales = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/sucursales`);
        const result = await res.json();
        setSucursalesDisponibles(result);
      } catch (error) {
        console.error("Error al cargar sucursales:", error);
      }
    };
    fetchSucursales();
  }, []);

  // --- Traer datos de fallas por pieza ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        let url = `${BASE_URL}/api/stats/fallas_por_pieza`;
        if (!mostrarTodas) url += `?limit=${limit}`;
        else url += `?limit=0`;

        if (startDate) url += `&start_date=${startDate}`;
        if (endDate) url += `&end_date=${endDate}`;
        if (sucursal) url += `&sucursal=${encodeURIComponent(sucursal)}`;

        const res = await fetch(url);
        const result = await res.json();
        if (res.ok || res.status === 200) {
          setData(result);
        } else {
          console.error("Error al obtener datos de fallas", result);
          setData([]);
        }
      } catch (error) {
        console.error("Error al cargar datos de fallas:", error);
      }
    };
    fetchData();
  }, [startDate, endDate, sucursal, limit, mostrarTodas]);

  // --- Preparar datos para Chart.js ---
  const labels = data.map(d => d.pieza);
  const valores = data.map(d => d.total_fallas);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Cantidad de fallas",
        data: valores,
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <h3 style={{ textAlign: "center" }}>Fallas por Pieza</h3>

      {/* --- FILTROS --- */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem", marginBottom: "1rem" }}>
        <div>
          <label>Fecha Inicio:</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div>
          <label>Fecha Fin:</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        <div>
          <label>Sucursal:</label>
          <select value={sucursal} onChange={e => setSucursal(e.target.value)}>
            <option value="">Todas</option>
            {sucursalesDisponibles.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Top N:</label>
          <input 
            type="number" 
            min="1" 
            max="100" 
            value={limit} 
            onChange={e => setLimit(e.target.value)} 
            disabled={mostrarTodas}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input type="checkbox" checked={mostrarTodas} onChange={e => setMostrarTodas(e.target.checked)} />
          <label>Mostrar todas las fallas</label>
        </div>
      </div>

      {/* --- GRÁFICA --- */}
      <Bar data={chartData} options={options} />
    </div>
  );
}
