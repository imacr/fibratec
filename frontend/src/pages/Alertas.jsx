import { useEffect, useState } from "react";

export default function AlertasPlacas() {
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    async function fetchAlertas() {
      const res = await fetch("/alertas_placas");
      const data = await res.json();
      setAlertas(data);
    }
    fetchAlertas();
  }, []);

  return (
    <div>
      <h3>Placas que requieren renovación</h3>
      <ul>
        {alertas.map(a => (
          <li key={a.id_placa}>
            Unidad {a.id_unidad} - Vigencia: {a.fecha_vigencia}
          </li>
        ))}
      </ul>
    </div>
  );
}






useEffect(() => {
  fetch(`${BASE_URL}/api/unidades`)
    .then(res => res.json())
    .then(data => setUnidades(data))
    .catch(err => setError(err.message))
    .finally(() => setLoading(false));
}, []);

const indexOfLast = currentPage * itemsPerPage;
const indexOfFirst = indexOfLast - itemsPerPage;
const currentUnidades = unidades.slice(indexOfFirst, indexOfLast);
const totalPages = Math.ceil(unidades.length / itemsPerPage);























