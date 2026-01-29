import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { BASE_URL } from "../config";
import styles from "./dashboardrefrendo.module.css";

export default function DashboardRefrendo() {
  const [dashboardData, setDashboardData] = useState(null);
  const [filtro, setFiltro] = useState("TODOS"); // Todos, Completo, Corriente, Pendiente
  const [tabla, setTabla] = useState([]);

  useEffect(() => {
    fetch(`${BASE_URL}/dashboard/refrendo`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(res => {
        setDashboardData(res);
        setTabla(res.data_actual);
      })
      .catch(err => console.error("Error dashboard:", err));
  }, []);

  if (!dashboardData) return <p>Cargando...</p>;

  const { total_unidades, completos, al_corriente, pendientes, falta_doc, data_actual, pendientes_anteriores, avance_mensual, anio } = dashboardData;

  const chartData = [
    { name: "Completo", count: completos },
    { name: "Al corriente", count: al_corriente },
    { name: "Pendiente", count: pendientes },
    { name: "Falta Doc", count: falta_doc },
  ];

const handleCardClick = (estado) => {
  setFiltro(estado);

  switch(estado){
    case "TODOS":
      setTabla(dashboardData.data_actual);
      break;
    case "COMPLETO":
    case "CORRIENTE":
    case "PENDIENTE":
      setTabla(dashboardData.data_actual.filter(u => u.estado === estado));
      break;
    case "FALTA_DOC":
      setTabla(dashboardData.data_actual.filter(u => u.estado === "FALTA_DOC"));
      break;
    case "PENDIENTES_ANTERIORES":
      setTabla(dashboardData.pendientes_anteriores);
      break;
    default:
      setTabla([]);
  }
};

  const exportPDF = () => {
    const pdf = new jsPDF("landscape");
    pdf.text("Dashboard Refrendo/Tenencia", 20, 20);

    const rows = tabla.map(u => filtro === "PENDIENTES_ANTERIORES"
      ? [u.cve, u.unidad, u.ultimo_pago, u.estado]
      : [u.cve, u.unidad, u.estado, u.fecha_pago, u.limite_pago, u.monto]);

    const head = filtro === "PENDIENTES_ANTERIORES"
      ? ["CVE", "Unidad", "Último Pago", "Estado"]
      : ["CVE", "Unidad", "Estado", "Fecha pago", "Límite pago", "Monto"];

    autoTable(pdf, { head: [head], body: rows, startY: 30 });
    pdf.save(`dashboard_refrendo_${filtro}.pdf`);
  };

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Dashboard de Refrendo/Tenencia</h1>

      {/* TARJETAS */}
      <div className={styles.cards}>
        <motion.div onClick={() => handleCardClick("TODOS")} className={styles.cardBlue}>
          <span>Total unidades</span><strong>{total_unidades}</strong>
        </motion.div>
        <motion.div onClick={() => handleCardClick("COMPLETO")} className={styles.cardGreen}>
          <span>Documentación completa</span><strong>{completos}</strong>
        </motion.div>

        <motion.div onClick={() => handleCardClick("PENDIENTE")} className={styles.cardRed}>
          <span>Pendientes de este año</span><strong>{pendientes}</strong>
        </motion.div>
        <motion.div onClick={() => handleCardClick("FALTA_DOC")} className={styles.cardOrange}>
          <span>Con registro pero falta documentación</span><strong>{falta_doc}</strong>
        </motion.div>
        <motion.div onClick={() => handleCardClick("PENDIENTES_ANTERIORES")} className={styles.cardPurple}>
          <span>Pagos pendientes años anteriores</span><strong>{pendientes_anteriores.length}</strong>
        </motion.div>
      </div>

      {/* GRAFICA BARRAS */}
      <div className={styles.chartBox}>
        <h2>Distribución de estados</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid stroke="#f5f5f5" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#6366f1" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* AVANCE MENSUAL */}
      <div className={styles.chartBox}>
        <h2>Avance de pagos ({anio})</h2>
        <ResponsiveContainer width="100%" height={300}>
        <LineChart data={avance_mensual}>
            <CartesianGrid stroke="#f5f5f5" />
            <XAxis dataKey="mes" tickFormatter={m => `Mes ${m}`} />
            <YAxis domain={[0,100]} unit="%" />
            <Tooltip formatter={value => `${value}%`} />
            <Line type="monotone" dataKey="porcentaje" stroke="#22d3ee" strokeWidth={3} dot={{r:5}} />
        </LineChart>
        </ResponsiveContainer>

      </div>

      {/* TABLA DETALLE */}
      <div className={styles.tableBox}>
        <h3>Detalle: {filtro}</h3>
        <button onClick={exportPDF}>Exportar PDF</button>
        <table className={styles.table}>
          <thead>
            <tr>
              {filtro === "PENDIENTES_ANTERIORES" 
                ? ["CVE","Unidad","Último Pago","Estado"].map(h => <th key={h}>{h}</th>)
                : ["CVE","Unidad","Estado","Fecha pago","Límite pago","Monto"].map(h => <th key={h}>{h}</th>)
              }
            </tr>
          </thead>
          <tbody>
            {tabla.map(u => (
              <tr key={u.id_unidad || u.cve}>
                {filtro === "PENDIENTES_ANTERIORES"
                  ? <>
                      <td>{u.cve}</td>
                      <td>{u.unidad}</td>
                      <td>{u.ultimo_pago}</td>
                      <td>{u.estado}</td>
                    </>
                  : <>
                      <td>{u.cve}</td>
                      <td>{u.unidad}</td>
                      <td>{u.estado}</td>
                      <td>{u.fecha_pago}</td>
                      <td>{u.limite_pago}</td>
                      <td>${u.monto}</td>
                    </>
                }
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
