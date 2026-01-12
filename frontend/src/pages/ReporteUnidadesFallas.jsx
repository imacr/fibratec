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

  useEffect(() => {
    fetch(`${BASE_URL}/reportes/unidades-mas-fallas`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then(res => res.json())
      .then(res => {
        setData(
          res.map(u => ({
            cve: u.cve,
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
  const promedio = data.length
    ? (totalFallas / data.length).toFixed(1)
    : 0;

  /* ===== PDF TABULAR ===== */
  const exportarPDF = () => {
    const pdf = new jsPDF("landscape", "pt", "a4");

    pdf.setFontSize(18);
    pdf.text("Reporte de Fallas mecanicas por Unidad", 40, 40);

    pdf.setFontSize(11);
    pdf.text(`Total de unidades: ${data.length}`, 40, 65);
    pdf.text(`Total de fallas: ${totalFallas}`, 260, 65);
    pdf.text(`Costo total generado: $${costoTotal.toLocaleString()}`, 480, 65);

    const rows = data.map(u => ([
      u.cve,
      u.unidad,
      u.fallas,
      `$${u.costo.toLocaleString()}`,
      u.ultimaFalla
    ]));

    autoTable(pdf, {
      startY: 90,
      head: [[
        "CVE",
        "Unidad",
        "Fallas totales",
        "Costo generado",
        "Última falla"
      ]],
      body: rows,
      styles: {
        fontSize: 10,
        cellPadding: 6
      },
      headStyles: {
        fillColor: [99, 102, 241],
        textColor: 255,
        halign: "center"
      },
      columnStyles: {
        2: { halign: "center" },
        3: { halign: "right" }
      }
    });

    pdf.save("reporte_mantenimientos_unidades.pdf");
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

        <span className={styles.hint}>
          Mostrando {dataFiltrada.length} de {data.length}
        </span>
         <button className={styles.pdfBtn} onClick={exportarPDF}>
          Exportar PDF
        </button>
      </div>

      {/* GRÁFICA (SOLO VISUAL) */}
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
              formatter={(value) => [value, "Fallas"]}
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
