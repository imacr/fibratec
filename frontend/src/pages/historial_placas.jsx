import { useEffect, useState } from "react";
import { API_URL } from "../config";
import ModalFile from "../components/ModalFile";

export default function HistorialPlacas() {
  const [historial, setHistorial] = useState([]);
  const [fileModalUrl, setFileModalUrl] = useState(null);

  useEffect(() => {
    fetchHistorial();
  }, []);

  const fetchHistorial = async () => {
    try {
      const res = await fetch(`${API_URL}/placas/historial`);
      const data = await res.json();
      setHistorial(data.historial || []);
    } catch (err) {
      console.error(err);
      alert("No se pudo cargar el historial");
    }
  };

  return (
    <div className="historial-container">
      <h1>Historial de Placas</h1>
      <div className="table-wrapper">
        <table className="elegant-table">
          <thead>
            <tr>
              <th>ID Historial</th>
              <th>ID Placa</th>
              <th>ID Unidad</th>
              <th>Placa</th>
              <th>Folio</th>
              <th>Expedición</th>
              <th>Vigencia</th>
              <th>Frontal</th>
              <th>Trasera</th>
              <th>Usuario</th>
            </tr>
          </thead>
          <tbody>
            {historial.map(h => (
              <tr key={h.id_historial}>
                <td>{h.id_historial}</td>
                <td>{h.id_placa}</td>
                <td>{h.id_unidad}</td>
                <td>{h.placa}</td>
                <td>{h.folio}</td>
                <td>{h.fecha_expedicion || "N/A"}</td>
                <td>{h.fecha_vigencia || "N/A"}</td>
                <td>
                  {h.url_placa_frontal ? (
                    <button
                      className="btn btn-outline-danger btn-sm"
                    
                    onClick={() =>
                        setFileModalUrl(`${API_URL}/uploads/historial_placas/${h.url_placa_frontal.split('/').pop()}`)
                    }
                    >
                    Ver
                    </button>

                  ) : "N/A"}
                </td>
                <td>
                  {h.url_placa_trasera ? (
                    <button className="btn btn-outline-danger btn-sm" onClick={() => setFileModalUrl(`${API_URL}/${h.url_placa_trasera}`)}>Ver</button>
                  ) : "N/A"}
                </td>
                <td>{h.usuario}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {fileModalUrl && <ModalFile url={fileModalUrl} onClose={() => setFileModalUrl(null)} />}
    </div>
  );
}
