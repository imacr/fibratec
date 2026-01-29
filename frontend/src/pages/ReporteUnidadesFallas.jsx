import React, { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import styles from "./Reportes.module.css";
import { BASE_URL } from "../config";

export default function DashboardFallasNice() {
  const [data, setData] = useState([]);
  const [limit, setLimit] = useState(10);
  const [unidadSeleccionada, setUnidadSeleccionada] = useState(""); // CVE de la unidad

  useEffect(() => {
    fetch(`${BASE_URL}/reportes/unidades-mas-fallas`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then(res => res.json())
      .then(res => {
        setData(
          res.map(u => ({
            cve: u.cve,
            marca: u.marca,
            modelo: u.modelo,
            unidad: `${u.marca} ${u.modelo}`,
            fallas: u.total_fallas,
            costo: u.costo_total ?? 0,
            ultimaFalla: u.ultima_falla ?? "N/A"
          }))
        );
      });
  }, []);

  const dataFiltrada = useMemo(() => {
    if (limit === 0) return data;
    return data.slice(0, limit);
  }, [data, limit]);

  const totalFallas = data.reduce((a, b) => a + b.fallas, 0);
  const costoTotal = data.reduce((a, b) => a + b.costo, 0);
  const promedio = data.length ? (totalFallas / data.length).toFixed(1) : 0;

  /* ===== EXPORTAR PDF ===== */
  const exportarPDF = async () => {
    const res = await fetch(`${BASE_URL}/reportes/fallas-detalladas`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const fallas = await res.json();

    // Filtrar según Top o unidad específica
    const fallasFiltradas = unidadSeleccionada
      ? fallas.filter(f => f.cve === unidadSeleccionada)
      : fallas.filter(f => dataFiltrada.some(u => u.cve === f.cve));

    if (fallasFiltradas.length === 0) {
      alert("No hay fallas para exportar con el filtro seleccionado.");
      return;
    }

    const pdf = new jsPDF("landscape", "pt", "a4");
    const totalFallasPDF = fallasFiltradas.length;
    const costoTotalPDF = fallasFiltradas.reduce((a, f) => a + (f.costo || 0), 0);

    pdf.setFontSize(18);
    pdf.text("Reporte de Fallas Mecánicas (Detalle)", 40, 40);
    pdf.setFontSize(11);
    pdf.text(`Fallas registradas: ${totalFallasPDF}`, 40, 65);
    pdf.text(`Costo total: $${costoTotalPDF.toLocaleString()}`, 300, 65);

    // Agrupar por unidad
    const fallasPorUnidad = {};
    fallasFiltradas.forEach(f => {
      if (!fallasPorUnidad[f.unidad]) fallasPorUnidad[f.unidad] = [];
      fallasPorUnidad[f.unidad].push(f);
    });

    let startY = 85;
    Object.keys(fallasPorUnidad).forEach(unidad => {
      pdf.setFontSize(12);
      pdf.text(`Unidad: ${unidad}`, 40, startY);
      startY += 15;

      autoTable(pdf, {
        startY,
        head: [["Fecha", "Pieza", "Marca", "Tipo", "Descripción", "Lugar", "Costo"]],
        body: fallasPorUnidad[unidad].map(f => [
          f.fecha,
          f.pieza || "-",
          f.marca_pieza || "-",
          f.tipo_servicio,
          f.descripcion || "-",
          f.proveedor || "-",
          `$${(f.costo || 0).toLocaleString()}`
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [0, 0, 0], textColor: 255 },
        columnStyles: { 0: { halign: "center" }, 6: { halign: "right" } },
        theme: "grid",
        margin: { left: 40, right: 40 },
      });

      startY = pdf.lastAutoTable.finalY + 20;
    });

    pdf.save("reporte_fallas_detallado.pdf");
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.title}>Reporte de fallas mecanicas</h1>
      </div>

      {/* TARJETAS */}
      <div className={styles.cards}>
        <motion.div whileHover={{ y: -6 }} className={styles.cardBlue}>
          <span>Total unidades</span>
          <strong>{data.length}</strong>
        </motion.div>

        <motion.div whileHover={{ y: -6 }} className={styles.cardPurple}>
          <span>Fallas registradas</span>
          <strong>{totalFallas}</strong>
        </motion.div>

        <motion.div whileHover={{ y: -6 }} className={styles.cardGreen}>
          <span>Promedio por unidad</span>
          <strong>{promedio}</strong>
        </motion.div>
      </div>

      {/* FILTROS */}
      <div className={styles.filters}>
        <label>Mostrar:</label>
        <select value={limit} onChange={e => setLimit(Number(e.target.value))}>
          <option value={5}>Top 5</option>
          <option value={10}>Top 10</option>
          <option value={20}>Top 20</option>
          <option value={0}>Todas</option>
        </select>

        <label style={{ marginLeft: 20 }}>Unidad específica:</label>
        <select
          value={unidadSeleccionada}
          onChange={e => setUnidadSeleccionada(e.target.value)}
        >
          <option value="">-- Todas en Top --</option>
          {data.map(u => (
            <option key={u.cve} value={u.cve}>{u.unidad}</option>
          ))}
        </select>

        <span className={styles.hint}>
          Mostrando {dataFiltrada.length} de {data.length}
        </span>

        <button className={styles.pdfBtn} onClick={exportarPDF}>
          Exportar PDF
        </button>
      </div>

      {/* GRÁFICA */}
      <motion.div
        className={styles.chartBox}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2>Unidades con más fallas mecanicas</h2>

        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={dataFiltrada}>
            <defs>
              <linearGradient id="niceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" />
            <XAxis dataKey="cve" />
            <YAxis />
            <Tooltip
              contentStyle={{
                background: "#fff",
                borderRadius: 14,
                border: "1px solid #e5e7eb",
                boxShadow: "0 10px 25px rgba(0,0,0,.1)"
              }}
              formatter={value => [value, "Fallas"]}
              labelFormatter={(_, payload) => {
                const d = payload?.[0]?.payload;
                if (!d) return "";
                return `${d.cve} | ${d.unidad}
Costo: $${d.costo.toLocaleString()}
Última falla: ${d.ultimaFalla}`;
              }}
            />

            <Bar
              dataKey="fallas"
              fill="url(#niceGradient)"
              radius={[10, 10, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
