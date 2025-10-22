import React, { useEffect, useState } from "react";
import './Unidades.css';
import './Garantias.css';
import Crudgarantias from './Garantias_CRUD';
import ModalFile from "../components/ModalFile";
import Swal from 'sweetalert2';
import { BASE_URL } from "../config"; // Ajusta la ruta según la ubicación del archivo

const Garantias = () => {
  const [garantias, setGarantias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalFile, setModalFile] = useState(null);
  const [garantiaToEdit, setGarantiaToEdit] = useState(null);
  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const itemsPerPageOptions = [5, 10, 20];

// Filtrado de garantías para la página actual
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentGarantias = garantias.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(garantias.length / itemsPerPage);
  const API_URL = `${BASE_URL}/api/garantias`

  // Función para agregar o actualizar garantía en el estado con alertas
const agregarOActualizarGarantia = (garantia) => {
  const isUpdate = garantias.some(g => g.id_garantia === garantia.id_garantia);

  if (isUpdate) {
    Swal.fire({
      title: '¡Garantía actualizada!',
      text: 'Los datos de la garantía se han actualizado correctamente.',
      icon: 'success',
      confirmButtonColor: '#0d6efd',
      confirmButtonText: 'Aceptar'
    }).then(() => {
      window.location.reload(); // <- recarga toda la página
    });

  } else {
    Swal.fire({
      title: '¡Garantía registrada!',
      text: 'La garantía se ha guardado correctamente.',
      icon: 'success',
      confirmButtonColor: '#198754',
      confirmButtonText: 'Aceptar'
    }).then(() => {
      window.location.reload(); // <- recarga toda la página
    });
  }
};

// Eliminar garantía
const handleDeleteGarantia = async (id_garantia) => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: "Esta acción eliminará la garantía permanentemente.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (!result.isConfirmed) return;

  try {
    const response = await fetch(`${API_URL}/${id_garantia}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Error al eliminar la garantía');

    // Refrescar tabla
    const data = await fetch(API_URL).then(r => r.json());
    setGarantias(data);

    Swal.fire({
      title: '¡Éxito!',
      text: 'Garantía eliminada correctamente',
      icon: 'success',
      iconColor: '#ca0808ff',
      confirmButtonColor: '#28a745'
    });

  } catch (err) {
    Swal.fire({
      title: 'Error',
      text: err.message,
      icon: 'error',
      confirmButtonColor: '#d33'
    });
  }
};

  // Traer todas las garantías al cargar
  useEffect(() => {
    let mounted = true;
    const fetchGarantias = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/garantias`);
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const data = await response.json();
        if (mounted) setGarantias(data);
      } catch (err) {
        setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchGarantias();
    return () => mounted = false;
  }, []);

  if (loading) return <p>Cargando garantías...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="unidades-container">
      <h1><i className="fa-solid fa-file-shield"></i> Garantías</h1>
        <div className="pagination-controls">
  <label>
    Mostrar:
    <select
      value={itemsPerPage}
      onChange={e => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1); // reinicia a página 1 al cambiar el tamaño
      }}
    >
      {itemsPerPageOptions.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </label>
      
      <button onClick={() => setShowModal(true)} className="btn-registrar-garantia">
        Registrar Garantía
        </button>
  </div>
      {/* Tabla de garantías */}
      <div className="table-wrapper">
        <table className="elegant-table">
          <thead>
            <tr>
              <th style={{ display: "none" }}>ID</th>
              <th>Unidad</th>
              <th className="col-chofer">Chofer</th>
              <th>Marca</th>
              <th>Vehículo</th>
              <th>Aseguradora</th>
              <th>Tipo de Garantía</th>
              <th>No. de Póliza</th>
              <th>URL de Póliza</th>
              <th>Suma Asegurada</th>
              <th>Inicio Vigencia</th>
              <th>Vigencia</th>
              <th>Prima</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {garantias.map(g => (
              <tr key={g.id_garantia}>
                <td style={{ display: "none" }}>{g.id_garantia}</td>
                <td>{g.id_unidad}</td>
                <td className="col-chofer">{g.chofer_asignado}</td>
                <td>{g.marca}</td>
                <td>{g.vehiculo}</td>
                <td>{g.aseguradora}</td>
                <td>{g.tipo_garantia}</td>
                <td>{g.no_poliza}</td>
                <td>
                  {g.url_poliza ? (
                    <button onClick={() => setModalFile(`${BASE_URL}${g.url_poliza}`)}>Ver Póliza</button>
                  ) : "—"}
                </td>
                <td>${g.suma_asegurada?.toLocaleString()}</td>
                <td>{g.inicio_vigencia}</td>
                <td>{g.vigencia}</td>
                <td>${g.prima?.toLocaleString()}</td>
                <td>
                  <div className="actions-container">
                    <button onClick={() => { setGarantiaToEdit(g); setShowModal(true); }}>
                      <i className="fa-solid fa-pen-to-square icon-edit"></i>
                    </button>
                    <button onClick={() => handleDeleteGarantia(g.id_garantia)}>
                      <i className="fa-solid fa-trash icon-delete"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tarjetas para móviles */}
      <div className="card-wrapper">
        {garantias.map(g => (
          <div key={g.id_garantia} className="unidad-card">
            <h3>{g.tipo_garantia} ({g.aseguradora})</h3>
            <p><b>ID Garantía:</b> {g.id_garantia}</p>
            <p><b>ID Unidad:</b> {g.id_unidad}</p>
            <p><b>Número de Póliza:</b> {g.no_poliza}</p>
            <p><b>URL Póliza:</b> 
              {g.url_poliza ? (
                    <button onClick={() => setModalFile(`${BASE_URL}${g.url_poliza}`)}>Ver Póliza</button>
                  ) : "—"}
                  
            </p>
            <p><b>Suma Asegurada:</b> ${g.suma_asegurada}</p>
            <p><b>Inicio Vigencia:</b> {new Date(g.inicio_vigencia).toLocaleDateString()}</p>
            <p><b>Vigencia:</b> {new Date(g.vigencia).toLocaleDateString()}</p>
            <p><b>Prima:</b> ${g.prima}</p>

            <div className="actions-container">
              <button onClick={() => { setGarantiaToEdit(g); setShowModal(true); }}>
                <i className="fa-solid fa-pen-to-square icon-edit"></i>
              </button>
              <button onClick={() => handleDeleteGarantia(g.id_garantia)}>
                <i className="fa-solid fa-trash icon-delete"></i>
                </button>

            </div>
          </div>
        ))}
      </div>

      {/* Modal archivo */}
      {modalFile && <ModalFile url={modalFile} onClose={() => setModalFile(null)} />}

      {/* Modal Crear/Actualizar */}
      {showModal && (
        <Crudgarantias
          onClose={() => {
            setShowModal(false);
            setGarantiaToEdit(null);
          }}
          onCreate={agregarOActualizarGarantia} // Alertas al crear o actualizar
          garantia={garantiaToEdit} 
        />
      )}
    </div>
  );
};

export default Garantias;
