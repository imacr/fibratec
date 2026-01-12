import { useState } from "react";
import { API_URL } from "../config";

export default function ProbarAlertas() {
  /* =======================
     ESTADOS
  ======================= */
  const [alertas, setAlertas] = useState([]);
  const [mensajeMantenimiento, setMensajeMantenimiento] = useState("");
  const [mensajeDepuracion, setMensajeDepuracion] = useState("");
  const [dias, setDias] = useState("");
  const [meses, setMeses] = useState("");

  // NUEVO: scheduler
  const [jobs, setJobs] = useState([]);

  /* =======================
     FUNCIONES API
  ======================= */
  const obtenerAlertas = async () => {
    const res = await fetch(`${API_URL}/refrendo_tenencia/test_alertas`);
    const data = await res.json();
    setAlertas(data);
  };

  const generarMantenimientos = async () => {
    const res = await fetch(`${API_URL}/mantenimientos/generar`, {
      method: "POST",
    });
    const data = await res.json();
    setMensajeMantenimiento(
      `✔ ${data.msg} (Registros insertados: ${data.registros_insertados})`
    );
  };

  const depurarMensajes = async () => {
    let query = "";
    if (meses) query = `?meses=${meses}`;
    else if (dias) query = `?dias=${dias}`;

    const res = await fetch(
      `${API_URL}/solicitudes_mensajes/depurar${query}`,
      { method: "DELETE" }
    );
    const data = await res.json();

    setMensajeDepuracion(
      `✔ ${data.msg} | Eliminados: ${data.mensajes_eliminados}`
    );
  };

  // NUEVO: obtener estado del scheduler
  const obtenerScheduler = async () => {
    const res = await fetch(`${API_URL}/scheduler/tiempos`);
    const data = await res.json();
    setJobs(data);
  };

  /* =======================
     UI
  ======================= */
  return (
    <div style={container}>
      <h2>Herramientas de prueba y mantenimiento</h2>

      {/* ===== SCHEDULER ===== */}
      <section style={section}>
        <h3>Estado del scheduler</h3>
        <button onClick={obtenerScheduler} style={btnBlue}>
          Ver próximas ejecuciones
        </button>

        {jobs.length > 0 && (
          <div style={{ marginTop: "15px" }}>
            {jobs.map((job) => (
              <div key={job.id} style={card}>
                <strong>{job.nombre}</strong>
                <p>
                  Próxima ejecución:<br />
                  {new Date(job.proxima_ejecucion).toLocaleString()}
                </p>
                <p>
                  Tiempo restante:<br />
                  <strong>{job.restante}</strong>
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== ALERTAS ===== */}
      <section style={section}>
        <h3>Alertas de refrendo / tenencia</h3>
        <button onClick={obtenerAlertas} style={btnBlue}>
          Probar alertas
        </button>
      </section>

      {/* ===== MANTENIMIENTOS ===== */}
      <section style={section}>
        <h3>Mantenimientos programados</h3>
        <button onClick={generarMantenimientos} style={btnGreen}>
          Generar mantenimientos
        </button>
        {mensajeMantenimiento && (
          <p style={msgOk}>{mensajeMantenimiento}</p>
        )}
      </section>

      {/* ===== DEPURACIÓN ===== */}
      <section style={section}>
        <h3>Depuración de mensajes</h3>

        <div style={row}>
          <input
            type="number"
            placeholder="Meses (ej. 3)"
            value={meses}
            onChange={(e) => {
              setMeses(e.target.value);
              setDias("");
            }}
            style={input}
          />
          <input
            type="number"
            placeholder="Días (ej. 90)"
            value={dias}
            onChange={(e) => {
              setDias(e.target.value);
              setMeses("");
            }}
            style={input}
          />
        </div>

        <button onClick={depurarMensajes} style={btnRed}>
          Depurar mensajes
        </button>

        {mensajeDepuracion && (
          <p style={msgOk}>{mensajeDepuracion}</p>
        )}
      </section>

      {/* ===== RESULTADO ALERTAS ===== */}
      {alertas.length > 0 && (
        <section style={section}>
          <h3>Resultado de alertas</h3>
          {alertas.map((grupo, i) => (
            <div key={i} style={card}>
              <strong>Correo: {grupo.correo}</strong>
              <ul>
                {grupo.vehiculos.map((v, j) => (
                  <li key={j}>
                    {v.vehiculo} {v.modelo} – {v.mensaje}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

/* =======================
   ESTILOS
======================= */
const container = {
  padding: "20px",
  fontFamily: "Arial, sans-serif",
};

const section = {
  marginBottom: "25px",
  paddingBottom: "15px",
  borderBottom: "1px solid #ddd",
};

const row = {
  display: "flex",
  gap: "10px",
  marginBottom: "10px",
};

const btnBlue = {
  padding: "10px 15px",
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};

const btnGreen = {
  padding: "10px 15px",
  backgroundColor: "#28a745",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};

const btnRed = {
  padding: "10px 15px",
  backgroundColor: "#dc3545",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};

const input = {
  padding: "6px",
  width: "150px",
};

const card = {
  border: "1px solid #ccc",
  borderRadius: "4px",
  padding: "10px",
  marginBottom: "10px",
};

const msgOk = {
  marginTop: "10px",
  fontWeight: "bold",
};
