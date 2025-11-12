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
import { BASE_URL } from "../config"; // <-- Aquí importas la URL del backend

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function CostosMantenimientoChart() {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sucursal, setSucursal] = useState("");
  const [sucursalesDisponibles, setSucursalesDisponibles] = useState([]);

  // --- Traer sucursales dinámicamente ---
  useEffect(() => {
    const fetchSucursales = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/sucursales`);
        if (!response.ok) throw new Error("Error al obtener sucursales");
        const result = await response.json();
        console.log("Sucursales obtenidas:", result);
        setSucursalesDisponibles(result);
      } catch (error) {
        console.error("Error al cargar sucursales:", error);
      }
    };
    fetchSucursales();
  }, []);

  // --- Traer datos de mantenimiento según filtros ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        let url = `${BASE_URL}/api/stats/costos_mantenimiento_por_mes?`;
        if (startDate) url += `start_date=${startDate}&`;
        if (endDate) url += `end_date=${endDate}&`;
        if (sucursal) url += `sucursal=${encodeURIComponent(sucursal)}&`;

        console.log("URL para fetch datos:", url);
        const response = await fetch(url);
        if (!response.ok) throw new Error("Error al obtener datos de mantenimiento");
        const result = await response.json();
        console.log("Datos mantenimiento obtenidos:", result);
        setData(result);
      } catch (error) {
        console.error("Error al cargar datos de mantenimiento:", error);
      }
    };
    fetchData();
  }, [startDate, endDate, sucursal]);

  // --- Preparar datos para Chart.js ---
  const labels = data.map(d => d.mes);
  const valores = data.map(d => d.total_costo);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Costo total de mantenimiento ($)",
        data: valores,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
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
      <h3 style={{ textAlign: "center" }}>Costo de Mantenimiento por Mes</h3>

      {/* --- FILTROS --- */}
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "1rem" }}>
        <div>
          <label>Fecha Inicio:</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label>Fecha Fin:</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
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
      </div>

      {/* --- GRÁFICA --- */}
      <Bar data={chartData} options={options} />
    </div>
  );
}
