import React, { useEffect, useState } from "react";
import { API_URL } from "../config";
import "./Calendario.css";

export default function CalendarioEstiloMunicipal() {
  const [calendario, setCalendario] = useState([]);

  const colorMap = {
    amarillo: "#f7dc6f",
    rojo: "#e74c3c",
    verde: "#27ae60",
    rosa: "#f1948a",
    azul: "#3498db"
  };

  useEffect(() => {
    const fetchCalendario = async () => {
      try {
        const res = await fetch(`${API_URL}/api/calendario`);
        const data = await res.json();
        const safeData = data.map(c => ({
          mes: c.mes,
          color: Array.isArray(c.color) ? c.color : [c.color]
        }));
        setCalendario(safeData);
      } catch (err) {
        console.error("Error al cargar calendario:", err);
      }
    };
    fetchCalendario();
  }, []);

  const getMesColors = (mes) => {
    const mesData = calendario.find(c => c.mes === mes);
    return mesData?.color || [];
  };

  const diasSemana = ["L", "M", "M", "J", "V", "S", "D"];

  return (
    <div className="calendario-municipal">
      {Array.from({ length: 12 }, (_, i) => i + 1).map(mes => {
        const fecha = new Date(2025, mes - 1, 1);
        const diasMes = new Date(2025, mes, 0).getDate();
        const primerDiaSemana = fecha.getDay() === 0 ? 6 : fecha.getDay() - 1; // lunes=0
        const coloresMes = getMesColors(mes);

        return (
          <div key={mes} className="mes">
            <div className="nombre-mes">
              {fecha.toLocaleString("es", { month: "long" }).toUpperCase()}
            </div>
            <div className="dias-semana">
              {diasSemana.map(d => (
                <div key={d} className="dia-nombre">{d}</div>
              ))}
            </div>
            <div className="dias-mes">
              {/* días vacíos antes del primer día */}
              {Array.from({ length: primerDiaSemana }, (_, idx) => (
                <div key={`empty-${idx}`} className="dia vacio"></div>
              ))}
              {/* días del mes */}
              {Array.from({ length: diasMes }, (_, d) => {
                const indexColor = Math.floor((d * coloresMes.length) / diasMes);
                const color = coloresMes.length > 0 ? colorMap[coloresMes[indexColor]] : "transparent";
                return (
                  <div
                    key={d}
                    className="dia"
                    style={{ backgroundColor: color }}
                  >
                    {d + 1}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
