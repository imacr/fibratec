import React from "react";
import CostosMantenimientoChart from "./CostosMantenimientoChart";
import FallasPorPiezaChart from "./FallasPorPiezaChart";
import VerificacionesChart from "./chasrverificaciones";
import "./Dashboard.css";

export default function Dashboard() {
  return (
    <div className="dashboard-grid">
      <div className="chart-wrapper">
        <CostosMantenimientoChart />
      </div>
      <div className="chart-wrapper">
        <FallasPorPiezaChart />
      </div>
      <div className="chart-wrapper">
        <VerificacionesChart />
      </div>
    </div>
  );
}
