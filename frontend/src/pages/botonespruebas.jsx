import { useState } from "react";
import { API_URL } from "../config";

export default function ProbarAlertas() {
  const [alertas, setAlertas] = useState([]);

  const obtenerAlertas = async () => {
    try {
      const res = await fetch(`${API_URL}/refrendo_tenencia/test_alertas`);
      const data = await res.json();
      console.log("Alertas recibidas:", data);
      setAlertas(data);
    } catch (err) {
      console.error("Error al obtener alertas:", err);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <button
        onClick={obtenerAlertas}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Probar alertas
      </button>

      {alertas.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          {alertas.map((grupo, i) => (
            <div key={i} style={{ marginBottom: "15px", border: "1px solid #ccc", padding: "10px", borderRadius: "5px" }}>
              <strong>Correo: {grupo.correo}</strong>
              <ul style={{ marginTop: "10px" }}>
                {grupo.vehiculos.map((v, j) => (
                  <li key={j}>
                    {v.vehiculo} {v.modelo} - {v.mensaje}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
