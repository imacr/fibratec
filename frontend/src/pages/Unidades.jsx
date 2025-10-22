// Unidades.jsx
import React, { useEffect, useState } from 'react';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Modal from '../components/Modal'; // Ajusta la ruta según tu estructura
import '../../src/App.css';
import './Unidades.css';
import seces from '../assets/image.png';
import { BASE_URL } from "../config"; // Ajusta la ruta según la ubicación del archivo

const Unidades = () => {
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [unidadToEdit, setUnidadToEdit] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPageOptions = [5, 10, 20];
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const MySwal = withReactContent(Swal);
  
  const API_URL = `${BASE_URL}/api/unidades`;

//----------------------------------------------------------------------------------
//estado para nueva unidad
const [nuevaUnidad, setNuevaUnidad] = useState({
  marca: "",
  vehiculo: "",
  modelo: "",
  clase_tipo: "",
  niv: "",
  motor: "",
  transmision: "",
  combustible: "",
  color: "",
  telefono_gps: "",
  sim_gps: "",
  uid: "",
  propietario: "",
  sucursal: "",
  compra_arrendado: "",
  fecha_adquisicion: "",
  // Datos de placa
  folio: "",
  placa: "",
  fecha_expedicion: "",
  fecha_vigencia: "",
});

//----------------------------------------------------------------------------------
// Obtener unidades
  useEffect(() => {
    const fetchUnidades = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Error al obtener datos');
        const data = await response.json();
        setUnidades(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUnidades();
  }, []);

  if (loading) return <div className="mensaje-estado">Cargando...</div>;
  if (error) return <div className="mensaje-estado error">{error}</div>;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentUnidades = unidades.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(unidades.length / itemsPerPage);
  

  

  const toggleModal = () => setShowModal(!showModal);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUnidadToEdit(prev => ({ ...prev, [name]: value }));
    };

//----------------------------------------------------------------------------------
//manejar cambios en nueva unidad

const handleChangeNuevaUnidad = (e) => {
  const { name, value } = e.target;
  setNuevaUnidad(prev => ({ ...prev, [name]: value }));
};





//----------------------------------------------------------------------------------
// Actualizar unidad
const handleUpdateUnidad = async (e) => {
  e.preventDefault();
  try {
    console.log("ID de unidad a actualizar:", unidadToEdit?.id_unidad);
    
    const payload = {
      marca: unidadToEdit.marca,
      vehiculo: unidadToEdit.vehiculo,
      modelo: unidadToEdit.modelo,
      niv: unidadToEdit.niv,
      fecha_adquisicion: unidadToEdit.fecha_adquisicion,
      color: unidadToEdit.mas_datos?.color,
      clase_tipo: unidadToEdit.mas_datos?.clase_tipo,
      motor: unidadToEdit.mas_datos?.motor,
      transmision: unidadToEdit.mas_datos?.transmision,
      combustible: unidadToEdit.mas_datos?.combustible,
      sucursal: unidadToEdit.mas_datos?.sucursal,
      compra_arrendado: unidadToEdit.mas_datos?.compra_arrendado,
      propietario: unidadToEdit.mas_datos?.propietario,
      uid: unidadToEdit.mas_datos?.uid,
      telefono_gps: unidadToEdit.mas_datos?.telefono_gps,
      sim_gps: unidadToEdit.mas_datos?.sim_gps,
    };

    console.log("Payload a enviar:", payload);

    const response = await fetch(`${API_URL}/${unidadToEdit.id_unidad}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error("Error de la API:", errorResponse);
      throw new Error('Error al actualizar unidad');
    }

    console.log("Respuesta de la API:", response);
    setShowModal(false);
    MySwal.fire({
      title: '¡Éxito!',
      text: 'Unidad actualizada correctamente',
      icon: 'success',
      iconColor: '#3edb56ff',
      color: '#000000',
      confirmButtonColor: '#28a745', // verde, puedes poner cualquier color hex

      confirmButtonText: 'Aceptar',
    }).then(() => {
      setShowSuccessModal(false); // Esto se ejecuta al cerrar el alert
    });
    setUnidadToEdit(null);

    // Refrescar lista
    const data = await fetch(API_URL).then(r => r.json());
    console.log("Datos de unidades después de la actualización:", data);
    setUnidades(data);
  } catch (err) {
    alert(err.message);
  }
};

//----------------------------------------------------------------------------------
// Eliminar unidad

const handleDeleteUnidad = async (id_unidad) => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: "Esta acción eliminará la unidad permanentemente.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',  // rojo
    cancelButtonColor: '#3085d6', // azul
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (!result.isConfirmed) return; // <- Si el usuario cancela, NO se elimina

  try {
    const response = await fetch(`${API_URL}/${id_unidad}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Error al eliminar la unidad');

    // Refrescar lista
    const data = await fetch(API_URL).then(r => r.json());
    setUnidades(data);

    Swal.fire({
      title: '¡Éxito!',
      text: 'Unidad eliminada correctamente',
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

//----------------------------------------------------------------------------------
// Agregar nueva unidad
const handleAgregarUnidad = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevaUnidad),
    });
    if (!response.ok) throw new Error("Error al agregar unidad y placa");

    const data = await response.json();
    setShowModal(false);
    Swal.fire({
      title: "¡Éxito!",
      text: "Unidad y placa agregadas correctamente",
      icon: "success",
      confirmButtonColor: "#28a745"
    });

    setUnidades(prev => [...prev, data]);

    setNuevaUnidad({
      marca: "",
      vehiculo: "",
      modelo: "",
      clase_tipo: "",
      niv: "",
      motor: "",
      transmision: "",
      combustible: "",
      color: "",
      telefono_gps: "",
      sim_gps: "",
      uid: "",
      propietario: "",
      sucursal: "",
      compra_arrendado: "",
      fecha_adquisicion: "",
      folio: "",
      placa: "",
      fecha_expedicion: "",
      fecha_vigencia: "",
    });

  } catch (err) {
    
    Swal.fire({
      title: "Error",
      text: err.message,
      icon: "error",
      confirmButtonColor: "#d33"
    });
  }
};



  return (
    <div className="unidades-container">
      <h1><i className="fa-solid fa-car-side"></i> Unidades</h1>

      <div className="pagination-controls">
          <label className='pagination-label'>
            Mostrar:
            <select className="pagination-select"
              value={itemsPerPage}
              onChange={e => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              {itemsPerPageOptions.map(opt => (
                <option className='' key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </label>
        <button  className="btn-open-modal btn-registrar-garantia" onClick={() => { setShowModal(true);
            setUnidadToEdit(null);  // Para abrir en modo "Agregar"
            setNuevaUnidad({});     // Inicializa campos vacíos para agregar
            setModalData(null);     // Limpia detalles
          }} >
          Agregar Nueva Unidad
        </button>
      </div>

      {/* Tabla para pantallas grandes */}
      <div className="table-wrapper">
        <table className="elegant-table">
          <thead>
            <tr>
              <th textAlign="center">ID</th>
              <th>Chofer Asignado</th>
              <th>Marca</th>
              <th>Vehículo</th>
              <th>Modelo</th>
              <th >NIV</th>
              <th>Placa</th>
              <th>Fecha Adquisición</th>
              <th>Vencimiento Tarjeta</th>
              <th>Estado</th>
              <th>Engomado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentUnidades.map(u => (
              <tr key={u.id_unidad}>
                <td>{u.id_unidad}</td>
                <td>{u.chofer_asignado}</td>
                <td>{u.marca}</td>
                <td>{u.vehiculo}</td>
                <td>{u.modelo}</td>
                <td>{u.niv}</td>
                <td>{u.placa}</td>
                <td>{u.fecha_adquisicion}</td>
                <td>{u.fecha_vencimiento_tarjeta}</td>
                <td>{u.estado_tarjeta}</td>
                <td>{u.engomado}</td>
                <td>
                   <div className="actions-container">
                    {/* ACTUALIZAR (Verde) */}
                    <button onClick={() => { setUnidadToEdit(u); setShowModal(true); }}>
                    <i className="fa-solid fa-pen-to-square icon-edit"></i>
                    </button>

                    {/* ELIMINAR (Rojo) */}
                    <button onClick={() => handleDeleteUnidad(u.id_unidad)}>
                      <i className="fa-solid fa-trash icon-delete"></i>
                    </button>

                    {/* DETALLES/MÁS DATOS (Azul) */}
                    <button onClick={() => { setModalData(u.mas_datos); setShowModal(true); }}>
                    {/* Usé 'icon-details' para la acción de ver más */}
                    <i className="fa-solid fa-plus-minus icon-details"></i>
                    </button>
                </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tarjetas para pantallas pequeñas */}
      <div className="card-wrapper">
        {currentUnidades.map(u => (
          <div key={u.id_unidad} className="unidad-card">
            <h3>{u.vehiculo} ({u.marca})</h3>
            <p><b>ID:</b> {u.id_unidad}</p>
            <p><b>Modelo:</b> {u.modelo}</p>
            <p><b>NIV:</b> {u.niv}</p>
            <p><b>Placa:</b> {u.placa}</p>
            <p><b>Fecha Adquisición:</b> {u.fecha_adquisicion}</p>
            <p><b>Vencimiento Tarjeta:</b> {u.fecha_vencimiento_tarjeta}</p>
            <p><b>Estado:</b> {u.estado_tarjeta}</p>
            <p><b>Engomado:</b> {u.engomado}</p>
            <p><b>Chofer:</b> {u.chofer_asignado}</p>
            <div className="actions-container">
                     {/* ACTUALIZAR (Verde) */}
                    <button onClick={() => { setUnidadToEdit(u); setShowModal(true); }}>
                    <i className="fa-solid fa-pen-to-square icon-edit"></i>
                    </button>

                    {/* ELIMINAR (Rojo) */}
                    <button onClick={() => handleDeleteUnidad(u.id_unidad)}>
                      <i className="fa-solid fa-trash icon-delete"></i>
                    </button>


                    {/* DETALLES/MÁS DATOS (Azul) */}
                    <button onClick={() => { setModalData(u.mas_datos); setShowModal(true); }}>
                    {/* Usé 'icon-details' para la acción de ver más */}
                    <i className="fa-solid fa-plus-minus icon-details"></i>
                    </button>
                </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      <div className="pagination">
        <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}><i class="fa-solid fa-arrow-left"></i></button>
        <span>Página {currentPage} de {totalPages}</span>
        <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}><i class="fa-solid fa-arrow-right"></i></button>
      </div>



  {showModal && (
    <div className='modal-container'>
    <Modal onClose={() => { setShowModal(false); setUnidadToEdit(null); setNuevaUnidad(null); }}>
        {unidadToEdit ? (
          <>
            <h2 style={{ textAlign: 'center' }}>Editar Unidad</h2>
          <form onSubmit={handleUpdateUnidad} className="form-container">
          
          <div className="form-row">
            <div className="form-group">
              <label>Marca</label>
              <input
                type="text"
                value={unidadToEdit.marca || ""}
                onChange={e => setUnidadToEdit({...unidadToEdit, marca: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Vehículo</label>
              <input
                type="text"
                value={unidadToEdit.vehiculo || ""}
                onChange={e => setUnidadToEdit({...unidadToEdit, vehiculo: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Modelo</label>
              <input
                type="text"
                value={unidadToEdit.modelo || ""}
                onChange={e => setUnidadToEdit({...unidadToEdit, modelo: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>NIV</label>
              <input
                type="text"
                value={unidadToEdit.niv || ""}
                onChange={e => setUnidadToEdit({...unidadToEdit, niv: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Fecha Adquisición</label>
              <input
                type="date"
                value={unidadToEdit.fecha_adquisicion || ""}
                onChange={e => setUnidadToEdit({...unidadToEdit, fecha_adquisicion: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Color</label>
              <input
                type="text"
                value={unidadToEdit.mas_datos?.color || ""}
                onChange={e => setUnidadToEdit({...unidadToEdit, mas_datos: {...unidadToEdit.mas_datos, color: e.target.value}})}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Clase Tipo</label>
              <input
                type="text"
                value={unidadToEdit.mas_datos?.clase_tipo || ""}
                onChange={e => setUnidadToEdit({...unidadToEdit, mas_datos: {...unidadToEdit.mas_datos, clase_tipo: e.target.value}})}
                required
              />
            </div>

            <div className="form-group">
              <label>Motor</label>
              <input
                type="text"
                value={unidadToEdit.mas_datos?.motor || ""}
                onChange={e => setUnidadToEdit({...unidadToEdit, mas_datos: {...unidadToEdit.mas_datos, motor: e.target.value}})}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Transmisión</label>
              <input
                type="text"
                value={unidadToEdit.mas_datos?.transmision || ""}
                onChange={e => setUnidadToEdit({...unidadToEdit, mas_datos: {...unidadToEdit.mas_datos, transmision: e.target.value}})}
                required
              />
            </div>

            <div className="form-group">
              <label>Combustible</label>
              <input
                type="text"
                value={unidadToEdit.mas_datos?.combustible || ""}
                onChange={e => setUnidadToEdit({...unidadToEdit, mas_datos: {...unidadToEdit.mas_datos, combustible: e.target.value}})}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Sucursal</label>
              <input
                type="text"
                value={unidadToEdit.mas_datos?.sucursal || ""}
                onChange={e => setUnidadToEdit({...unidadToEdit, mas_datos: {...unidadToEdit.mas_datos, sucursal: e.target.value}})}
                required
              />
            </div>

            <div className="form-group">
              <label>Compra/Arrendado</label>
              <input
                type="text"
                value={unidadToEdit.mas_datos?.compra_arrendado || ""}
                onChange={e => setUnidadToEdit({...unidadToEdit, mas_datos: {...unidadToEdit.mas_datos, compra_arrendado: e.target.value}})}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Propietario</label>
              <input
                type="text"
                value={unidadToEdit.mas_datos?.propietario || ""}
                onChange={e => setUnidadToEdit({...unidadToEdit, mas_datos: {...unidadToEdit.mas_datos, propietario: e.target.value}})}
                required
              />
            </div>

            <div className="form-group">
              <label>UID</label>
              <input
                type="text"
                value={unidadToEdit.mas_datos?.uid || ""}
                onChange={e => setUnidadToEdit({...unidadToEdit, mas_datos: {...unidadToEdit.mas_datos, uid: e.target.value}})}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Teléfono GPS</label>
              <input
                type="text"
                value={unidadToEdit.mas_datos?.telefono_gps || ""}
                onChange={e => setUnidadToEdit({...unidadToEdit, mas_datos: {...unidadToEdit.mas_datos, telefono_gps: e.target.value}})}
                required
              />
            </div>

            <div className="form-group">
              <label>SIM GPS</label>
              <input
                type="text"
                value={unidadToEdit.mas_datos?.sim_gps || ""}
                onChange={e => setUnidadToEdit({...unidadToEdit, mas_datos: {...unidadToEdit.mas_datos, sim_gps: e.target.value}})}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-save">Guardar</button>
        </form>
          </>
        ) : nuevaUnidad ? (
        <>
          <h2 style={{ textAlign: 'center' }}>Agregar Nueva Unidad con Placa</h2>
          <form onSubmit={handleAgregarUnidad} className="form-container">

            {/* Fila 1: Marca y Vehículo */}
            <div className="form-row">
              <div className="form-group">
                <label>Marca</label>
                <input
                  type="text"
                  name="marca"
                  value={nuevaUnidad.marca || ""}
                  onChange={handleChangeNuevaUnidad}
                  required
                />
              </div>
              <div className="form-group">
                <label>Vehículo</label>
                <input
                  type="text"
                  name="vehiculo"
                  value={nuevaUnidad.vehiculo || ""}
                  onChange={handleChangeNuevaUnidad}
                  required
                />
              </div>
            </div>

            {/* Fila 2: Modelo y Clase Tipo */}
            <div className="form-row">
              <div className="form-group">
                <label>Modelo</label>
                <input
                  type="text"
                  name="modelo"
                  value={nuevaUnidad.modelo || ""}
                  onChange={handleChangeNuevaUnidad}
                  required
                />
              </div>
              <div className="form-group">
                <label>Clase Tipo</label>
                <input
                  type="text"
                  name="clase_tipo"
                  value={nuevaUnidad.clase_tipo || ""}
                  onChange={handleChangeNuevaUnidad}
                  required
                />
              </div>
            </div>

            {/* Fila 3: NIV y Motor */}
            <div className="form-row">
              <div className="form-group">
                <label>NIV</label>
                <input
                  type="text"
                  name="niv"
                  value={nuevaUnidad.niv || ""}
                  onChange={handleChangeNuevaUnidad}
                  required
                />
              </div>
              <div className="form-group">
                <label>Motor</label>
                <input
                  type="text"
                  name="motor"
                  value={nuevaUnidad.motor || ""}
                  onChange={handleChangeNuevaUnidad}
                  required
                />
              </div>
            </div>

            {/* Fila 4: Transmisión y Combustible */}
            <div className="form-row">
              <div className="form-group">
                <label>Transmisión</label>
                <input
                  type="text"
                  name="transmision"
                  value={nuevaUnidad.transmision || ""}
                  onChange={handleChangeNuevaUnidad}
                  required
                />
              </div>
              <div className="form-group">
                <label>Combustible</label>
                <input
                  type="text"
                  name="combustible"
                  value={nuevaUnidad.combustible || ""}
                  onChange={handleChangeNuevaUnidad}
                  required
                />
              </div>
            </div>

            {/* Fila 5: Color y Fecha Adquisición */}
            <div className="form-row">
              <div className="form-group">
                <label>Color</label>
                <input
                  type="text"
                  name="color"
                  value={nuevaUnidad.color || ""}
                  onChange={handleChangeNuevaUnidad}
                  required
                />
              </div>
              <div className="form-group">
                <label>Fecha Adquisición</label>
                <input
                  type="date"
                  name="fecha_adquisicion"
                  value={nuevaUnidad.fecha_adquisicion || ""}
                  onChange={handleChangeNuevaUnidad}
                  required
                />
              </div>
            </div>

            {/* Fila 6: Propietario y UID */}
            <div className="form-row">
              <div className="form-group">
                <label>Propietario</label>
                <input
                  type="text"
                  name="propietario"
                  value={nuevaUnidad.propietario || ""}
                  onChange={handleChangeNuevaUnidad}
                  required
                />
              </div>
              <div className="form-group">
                <label>UID</label>
                <input
                  type="text"
                  name="uid"
                  value={nuevaUnidad.uid || ""}
                  onChange={handleChangeNuevaUnidad}
                  required
                />
              </div>
            </div>

            {/* Fila 7: Teléfono GPS y SIM GPS */}
            <div className="form-row">
              <div className="form-group">
                <label>Teléfono GPS</label>
                <input
                  type="text"
                  name="telefono_gps"
                  value={nuevaUnidad.telefono_gps || ""}
                  onChange={handleChangeNuevaUnidad}
                  required
                />
              </div>
              <div className="form-group">
                <label>SIM GPS</label>
                <input
                  type="text"
                  name="sim_gps"
                  value={nuevaUnidad.sim_gps || ""}
                  onChange={handleChangeNuevaUnidad}
                  required
                />
              </div>
            </div>

            {/* Fila 8: Sucursal y Compra/Arrendado */}
            <div className="form-row">
              <div className="form-group">
                <label>Sucursal</label>
                <input
                  type="text"
                  name="sucursal"
                  value={nuevaUnidad.sucursal || ""}
                  onChange={handleChangeNuevaUnidad}
                  required
                />
              </div>
              <div className="form-group">
                <label>Compra/Arrendado</label>
                <input
                  type="text"
                  name="compra_arrendado"
                  value={nuevaUnidad.compra_arrendado || ""}
                  onChange={handleChangeNuevaUnidad}
                  required
                />
              </div>
            </div>

            {/* Fila 9: Placa y Folio */}
            <div className="form-row">
              <div className="form-group">
                <label>Placa</label>
                <input
                  type="text"
                  name="placa"
                  value={nuevaUnidad.placa || ""}
                  onChange={handleChangeNuevaUnidad}
                  required
                />
              </div>
              <div className="form-group">
                <label>Folio</label>
                <input
                  type="text"
                  name="folio"
                  value={nuevaUnidad.folio || ""}
                  onChange={handleChangeNuevaUnidad}
                />
              </div>
            </div>

            {/* Fila 10: Fecha Expedición y Fecha Vigencia */}
            <div className="form-row">
              <div className="form-group">
                <label>Fecha Expedición</label>
                <input
                  type="date"
                  name="fecha_expedicion"
                  value={nuevaUnidad.fecha_expedicion || ""}
                  onChange={handleChangeNuevaUnidad}
                />
              </div>
              <div className="form-group">
                <label>Fecha Vigencia</label>
                <input
                  type="date"
                  name="fecha_vigencia"
                  value={nuevaUnidad.fecha_vigencia || ""}
                  onChange={handleChangeNuevaUnidad}
                />
              </div>
            </div>

            <button type="submit" className="btn-save">Agregar Unidad</button>
          </form>
        </>
      ) :(
          <>
             <h2 className="details-header">Detalles adicionales</h2> {/* Aplicar clase aquí */}
          <div className="details-container">
            {modalData ? (
              Object.entries(modalData).map(([key, value]) => (
                <div key={key} className="detail-item">
                  <strong>{key.replace(/_/g, ' ')}:</strong>
                  <span>{value ? value.toString() : 'N/A'}</span>
                </div>
              ))
            ) : (
              <p>No hay datos para mostrar.</p>
            )}
          </div>
          </>

        )}

        
      </Modal>
    </div>
  )}
   
    </div>
  );
};

export default Unidades;