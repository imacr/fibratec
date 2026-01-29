// Unidades.jsx
import React, { useEffect, useState } from 'react';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Modal from '../components/Modal'; // Ajusta la ruta según tu estructura
import ModalFile from "../components/ModalFile";

import "./Unidades.css"; // Tus estilos
import seces from '../assets/image.png';
import { BASE_URL } from "../config"; // Ajusta la ruta según la ubicación del archivo

const Unidades = () => {
  const [fileModalData, setFileModalData] = useState(null);

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
  const [pdfFrontal, setPdfFrontal] = useState(null);
  const [pdfTrasero, setPdfTrasero] = useState(null);
  const [agregarPlacas, setAgregarPlacas] = useState(false);
  const [fotoUnidad, setFotoUnidad] = useState(null);
  const [fotoFrontal, setFotoFrontal] = useState(null);
  const [fotoTrasera, setFotoTrasera] = useState(null);
  const [fotoLateralizq, setFotoLateralizq] = useState(null);
  const [fotoLateralder, setFotoLateralder] = useState(null);
  const [fotoTablero, setFotoTablero] = useState(null);
  const [pdfFactura, setPdfFactura] = useState(null);
  const [empresas, setEmpresas] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [sucursalesFiltradas, setSucursalesFiltradas] = useState([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState('');
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState('');
  const [comprobantePago, setComprobantePago] = useState(null);
  const [tarjetaCirculacion, setTarjetaCirculacion] = useState(null);
  const [modalMode, setModalMode] = useState(null);
    const [historial, setHistorial] = useState([]);
  const [fileModalUrl, setFileModalUrl] = useState(null);
  const [search, setSearch] = useState("");
  const [imagenesVehiculo, setImagenesVehiculo] = useState(null);
  const [modalImagenesUnidad, setModalImagenesUnidad] = useState({
  abierta: false,
  urls: []
});
const [archivoModalUrl, setArchivoModalUrl] = useState(null);


// "edit" | "add" | "details"

  const unidadesFiltradas = unidades.filter(u => {
    const texto = search.toLowerCase();

    return (
      u.cve?.toLowerCase().includes(texto) ||
      u.marca?.toLowerCase().includes(texto) ||
      u.version?.toLowerCase().includes(texto) ||
      u.niv?.toLowerCase().includes(texto) ||
      u.chofer_asignado?.toLowerCase().includes(texto)
    );
  });

// "add", "edit", "details"

const [combustibles, setCombustibles] = useState([]);
  const [selectedCombustible, setSelectedCombustible] = useState("");

  useEffect(() => {
    fetch(`${BASE_URL}/combustible`)
      .then((res) => res.json())
      .then((data) => setCombustibles(data))
      .catch((err) => console.error("Error al cargar combustibles:", err));
  }, []);



  const API_URL = `${BASE_URL}/unidades`;

const [archivos, setArchivos] = useState({});

const handleChangeArchivo = (e) => {
  setArchivos({
    ...archivos,
    [e.target.name]: e.target.files[0]  // guarda solo un archivo por input
  });
};

useEffect(() => {
  // Cargar empresas
  fetch(`${BASE_URL}/empresas`)
    .then(res => res.json())
    .then(data => setEmpresas(data))
    .catch(err => console.error(err));

  // Cargar todas las sucursales (luego filtraremos)
  
}, []);

useEffect(() => {
  fetch(`${BASE_URL}/sucursaless`)
    .then(res => res.json())
    .then(data => setSucursales(data))
    .catch(err => console.error(err));
}, []);




//----------------------------------------------------------------------------------
const [nuevaUnidad, setNuevaUnidad] = useState({
  // Organización
  id_empresa: "",
  id_sucursal: "",

  // Datos del vehículo
  cve: "",
  marca: "",
  version: "",
  tipo: "",
  clase: "",
  modelo: "",
  niv: "",
  motor: "",
  transmision: "",
  id_combustible: "",
  color: "",

  // GPS
  telefono_gps: "",
  sim_gps: "",
  uid: "",

  // Propiedad
  propietario: "",
  compra_arrendado: "",

  // Información financiera / documentos
  fecha_adquisicion: "",
  valor_factura: "",
  folio: "",
  placa: "",
  fecha_expedicion: "",
  fecha_vigencia: "",
  monto_pago: "",

  // Control operativo
  kilometraje_actual: "",
  litros_actuales: "",
  tolerancia: "",
  capacidad_tanque: "",
  kilometraje_por_litro: "",
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
  const currentUnidades = unidadesFiltradas.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(unidadesFiltradas.length / itemsPerPage);



  

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
    const formData = new FormData();

    // =============================
    // Inicializar mas_datos si no existe
    // =============================
    const masDatos = {
      clase: "",
      motor: "",
      transmision: "",
      combustible: "",
      color: "",
      propietario: "",
      compra_arrendado: "",
      telefono_gps: "",
      sim_gps: "",
      uid: "",
      id_combustible: "",
      ...(unidadToEdit.mas_datos || {})
    };

    // =============================
    // Campos directos de unidadToEdit
    // =============================
    const camposDirectos = [
  "marca","cve","version", "tipo", "modelo", "fecha_adquisicion","clase","año",
  "valor_factura", "kilometraje_actual", "id_empresa", "id_sucursal",
  "id_combustible", // ← AGREGADO
  "niv", "litros_actuales", "tolerancia", "capacidad_tanque", "kilometraje_por_litro"
];

    camposDirectos.forEach(field => {
      let valor = unidadToEdit[field];
      formData.append(field, valor !== undefined && valor !== null ? valor.toString() : "");
    });

    // =============================
    // Campos dentro de mas_datos
    // =============================
    const camposMasDatos = [
   "motor", "transmision",
  "color", "propietario", "compra_arrendado", 
  "telefono_gps", "sim_gps", "uid",
  "litros_actuales", "tolerancia", "capacidad_tanque", "kilometraje_por_litro", "es_utilitario" // <-- agregar aquí

];


    camposMasDatos.forEach(field => {
      let valor = masDatos[field];
      formData.append(field, valor !== undefined && valor !== null ? valor.toString() : "");
    });

    // =============================
    // Campos de placas opcionales
    // =============================
    if (agregarPlacas) {
      const camposPlacas = [
        "placa", "folio", "fecha_expedicion", "fecha_vigencia", "monto_pago"
      ];
      camposPlacas.forEach(field => {
        let valor = unidadToEdit[field];
        formData.append(field, valor !== undefined && valor !== null ? valor.toString() : "");
      });
    }

    // =============================
    // Archivos opcionales
    // =============================
    if (fotoUnidad) formData.append("foto_unidad", fotoUnidad);
    if (pdfFactura) formData.append("pdf_factura", pdfFactura);
    if (fotoFrontal) formData.append("foto_frontal", fotoFrontal);
    if (fotoTrasera) formData.append("foto_trasera", fotoTrasera);
    if (fotoLateralizq) formData.append("foto_lateral_izq", fotoLateralizq);
    if (fotoLateralder) formData.append("foto_lateral_der", fotoLateralder);
    if (fotoTablero) formData.append("foto_tablero_nivel", fotoTablero);
    if (agregarPlacas) {
      if (pdfFrontal) formData.append("pdf_frontal", pdfFrontal);
      if (pdfTrasero) formData.append("pdf_trasero", pdfTrasero);
      if (tarjetaCirculacion) formData.append("tarjeta_circulacion", tarjetaCirculacion);
      if (comprobantePago) formData.append("comprobante_pago", comprobantePago);
    }



    // =============================
    // Petición PUT al backend
    // =============================
    const response = await fetch(`${API_URL}/${unidadToEdit.id_unidad}`, {
      method: "PUT",
      body: formData
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.error || "Error al actualizar unidad");
    }

    const data = await response.json();
    console.log("Unidad actualizada:", data);

    // =============================
    // Refrescar lista y cerrar modal
    // =============================
    const unidadesActualizadas = await fetch(API_URL).then(r => r.json());
    setUnidades(unidadesActualizadas);
    setShowModal(false);
    setUnidadToEdit(null);

    Swal.fire({
      title: "¡Éxito!",
      text: "Unidad actualizada correctamente",
      icon: "success",
      confirmButtonColor: "#28a745",
    });

  } catch (err) {
    console.error(err);
    Swal.fire({
      title: "Error",
      text: err.message,
      icon: "error",
      confirmButtonColor: "#d33",
    });
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
const handleAgregarUnidad = async (e) => {
  e.preventDefault();

  try {
    // Validaciones básicas
    if (!nuevaUnidad.id_empresa) throw new Error("Seleccione una empresa");
    if (!nuevaUnidad.id_sucursal) throw new Error("Seleccione una sucursal");

    const formData = new FormData();

    // Agregar campos de texto y números
    const camposTexto = [
      "cve", "marca", "version", "tipo", "clase",
      "niv", "motor", "transmision", "color",
      "telefono_gps", "sim_gps", "uid", "propietario", "compra_arrendado",
      "fecha_adquisicion","modelo"
    ];

    camposTexto.forEach(c => {
      if (nuevaUnidad[c]) formData.append(c, nuevaUnidad[c]);
    });

    const camposNumericos = [
       "valor_factura", "kilometraje_actual",
      "litros_actuales","tolerancia", "capacidad_tanque",
      "kilometraje_por_litro", "monto_pago","año","id_combustible"
    ];
    
    camposNumericos.forEach(c => {
      if (nuevaUnidad[c] !== "" && nuevaUnidad[c] !== null) {
        formData.append(c, nuevaUnidad[c]);
      }
    });

    // IDs de empresa y sucursal
    formData.append("empresa", parseInt(nuevaUnidad.id_empresa));
    formData.append("sucursal", parseInt(nuevaUnidad.id_sucursal));
    formData.append("id_combustible", parseInt(nuevaUnidad.id_combustible));
    formData.append("es_utilitario", nuevaUnidad.es_utilitario || "No Utilitario");
    formData.append("estado_unidad", agregarPlacas ? "Asignado" : "Sin_Placas");

    // Archivos opcionales
    if (fotoUnidad) formData.append("foto_unidad", fotoUnidad);
    if (pdfFactura) formData.append("pdf_factura", pdfFactura);
    if (fotoFrontal) formData.append("foto_frontal", fotoFrontal);
    if (fotoTrasera) formData.append("foto_trasera", fotoTrasera);
    if (fotoLateralizq) formData.append("foto_lateral_izq", fotoLateralizq);
    if (fotoLateralder) formData.append("foto_lateral_der", fotoLateralder);
    if (fotoTablero) formData.append("foto_tablero", fotoTablero);

    if (agregarPlacas) {
      if (nuevaUnidad.placa) formData.append("placa", nuevaUnidad.placa);
      if (nuevaUnidad.folio) formData.append("folio", nuevaUnidad.folio);
      if (nuevaUnidad.fecha_expedicion) formData.append("fecha_adquisicion", nuevaUnidad.fecha_adquisicion);

      if (nuevaUnidad.fecha_expedicion) formData.append("fecha_expedicion", nuevaUnidad.fecha_expedicion);
      if (nuevaUnidad.fecha_vigencia) formData.append("fecha_vigencia", nuevaUnidad.fecha_vigencia);
      if (pdfFrontal) formData.append("pdf_frontal", pdfFrontal);
      if (pdfTrasero) formData.append("pdf_trasero", pdfTrasero);
      if (comprobantePago) formData.append("comprobante", comprobantePago);
      if (tarjetaCirculacion) formData.append("tarjeta_circulacion", tarjetaCirculacion);
    }

    // Enviar a la API
    const response = await fetch(`${BASE_URL}/unidades`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorRes = await response.json();
      throw new Error(errorRes.error || "Error al agregar unidad");
    }

    const data = await response.json();

    // Actualizar lista de unidades en frontend
    setUnidades(prev => [...prev, data.unidad]);

    Swal.fire({
      title: "¡Éxito!",
      text: "Unidad agregada correctamente",
      icon: "success",
      confirmButtonColor: "#28a745",
    });

    // Limpiar formulario
    setNuevaUnidad({
      id_empresa: "",
      id_sucursal: "",
      cve: "",
      marca: "",
      version: "",
      tipo: "",
      clase: "",
      modelo: "",
      niv: "",
      motor: "",
      transmision: "",
      combustible: "",
      color: "",
      telefono_gps: "",
      sim_gps: "",
      uid: "",
      propietario: "",
      compra_arrendado: "",
      fecha_adquisicion: "",
      valor_factura: "",
      folio: "",
      placa: "",
      fecha_expedicion: "",
      fecha_vigencia: "",
      monto_pago: "",
      kilometraje_actual: "",
      litros_actuales: "",
      tolerancia: "",
      capacidad_tanque: "",
      kilometraje_por_litro: ""
    });

    setFotoUnidad(null);
    setFotoFrontal(null);
    setFotoTrasera(null);
    setFotoLateralizq(null);
    setFotoLateralder(null);
    setFotoTablero(null);
    setPdfFactura(null);
    setPdfFrontal(null);
    setPdfTrasero(null);
    setComprobantePago(null);
    setTarjetaCirculacion(null);
    setAgregarPlacas(false);
    setShowModal(false);

  } catch (err) {
    Swal.fire({
      title: "Error",
      text: err.message,
      icon: "error",
      confirmButtonColor: "#d33"
    });
  }
};

const handleMasDatosChange = (field, value) => {
  setUnidadToEdit(prev => ({
    ...prev,
    mas_datos: {
      ...(prev.mas_datos || {}),   // si es null, usa un objeto vacío
      [field]: value
    }
  }));
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
         <div className="search-box">
          <i className="search-icon">🔍</i>
          <input
            type="text"
            placeholder="Buscar por CVE, marca, versión, NIV o chofer"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>



        <button  className="btn-open-modal btn-registrar-garantia" onClick={() => {
  setModalMode("add");
  setNuevaUnidad({});
  setUnidadToEdit(null);
  setModalData(null);
  setShowModal(true);
}}
 >
          Agregar Nueva Unidad
        </button>
      </div>



      {/* Tabla para pantallas grandes */}
      <div className="table-wrapper">
        <table className="elegant-table">
          <thead>
            <tr>
              <th>CVE</th>
              <th>Chofer Asignado</th>
              <th>Marca</th>
              <th>Vehículo</th>
              <th>Modelo</th>
              <th >NIV</th>
              <th>Placa</th>
              <th>Fecha Adquisición</th>
              <th>Imangenes Auto</th>
              <th>Factura</th>
              <th>Engomado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentUnidades.map(u => (
              <tr key={u.id_unidad}>
                <td>{u.cve}</td>
                <td>{u.chofer_asignado}</td>
                <td>{u.marca}</td>
                <td>{u.vehiculo}</td>
                <td>{u.modelo}</td>
                <td>{u.niv}</td>
                <td>{u.placa}</td>
                <td>{u.fecha_adquisicion}</td>
                
                <td>
                  {(u.foto_frontal ||
                    u.foto_trasera ||
                    u.foto_lateral_izq ||
                    u.foto_lateral_der ||
                    u.foto_tablero_nivel) ? (

                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() =>
                        setModalImagenesUnidad({
                          abierta: true,
                          imagenes: [
                            { label: "Vista frontal", url: u.foto_frontal },
                            { label: "Vista trasera", url: u.foto_trasera },
                            { label: "Lateral izquierdo", url: u.foto_lateral_izq },
                            { label: "Lateral derecho", url: u.foto_lateral_der },
                            { label: "Tablero / Nivel", url: u.foto_tablero_nivel }
                          ]
                            .filter(i => i.url)
                            .map(i => ({
                              ...i,
                              url: `${BASE_URL}/${i.url}`
                            }))
                        })
                      }
                    >
                      Ver imágenes
                    </button>

                  ) : (
                    "Sin imágenes"
                  )}
                </td>

              

                <td> {u.url_factura ? (
                          <button className="btn btn-outline-danger btn-sm" onClick={() => setFileModalUrl(`${BASE_URL}/${u.url_factura}`)}>Ver</button>
                        ) : "N/A"}</td>
                <td>{u.engomado}</td>
                <td>
                   <div className="actions-container">
                    {/* ACTUALIZAR (Verde) */}
                    <button onClick={() => {
                                setModalMode("edit");
                                setUnidadToEdit(u);
                                setNuevaUnidad(null);
                                setModalData(null);
                                setShowModal(true);
                              }}
>
                    <i className="fa-solid fa-pen-to-square icon-edit"></i>
                    </button>

                    {/* ELIMINAR (Rojo) */}
                    <button onClick={() => handleDeleteUnidad(u.id_unidad)}>
                      <i className="fa-solid fa-trash icon-delete"></i>
                    </button>

                    {/* DETALLES/MÁS DATOS (Azul) */}
                    <button onClick={() => {
                        setModalMode("details");
                        setModalData(u.mas_datos);
                        setUnidadToEdit(null);
                        setNuevaUnidad(null);
                        setShowModal(true);
                      }}
                      >
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
            <p><b>CVE:</b> {u.cve}</p>
            <p><b>Modelo:</b> {u.modelo}</p>
            <p><b>NIV:</b> {u.niv}</p>
            <p><b>Placa:</b> {u.placa}</p>
            <p><b>Fecha Adquisición:</b> {u.fecha_adquisicion}</p>
            <p><b>Vencimiento Tarjeta:</b> {u.fecha_vencimiento_tarjeta}</p>
            <p><b>Factura:</b> {u.url_factura ? (
                          <button className="btn btn-outline-danger btn-sm" onClick={() => setFileModalUrl(`${BASE_URL}/${u.url_factura}`)}>Ver</button>
                        ) : "N/A"}</p>
            <p><b>Engomado:</b> {u.engomado}</p>
            <p><b>Chofer:</b> {u.chofer_asignado}</p>
            <div className="actions-container">
                     <button onClick={() => {
                                setModalMode("edit");
                                setUnidadToEdit(u);
                                setNuevaUnidad(null);
                                setModalData(null);
                                setShowModal(true);
                              }}
>
                    <i className="fa-solid fa-pen-to-square icon-edit"></i>
                    </button>

                    {/* ELIMINAR (Rojo) */}
                    <button onClick={() => handleDeleteUnidad(u.id_unidad)}>
                      <i className="fa-solid fa-trash icon-delete"></i>
                    </button>


                    {/* DETALLES/MÁS DATOS (Azul) */}
                   <button onClick={() => {
                        setModalMode("details");
                        setModalData(u.mas_datos);
                        setUnidadToEdit(null);
                        setNuevaUnidad(null);
                        setShowModal(true);
                      }}
                      >
                      <i className="fa-solid fa-plus-minus icon-details"></i>
                    </button>
                </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      <div className="pagination">
        <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}><i className="fa-solid fa-arrow-left"></i></button>
        <span>Página {currentPage} de {totalPages}</span>
        <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}><i className="fa-solid fa-arrow-right"></i></button>
      </div>



{showModal && (
  <div className='modal-container'>
    <Modal onClose={() => { 
      setShowModal(false); 
      setUnidadToEdit(null); 
      setNuevaUnidad(null); 
      setModalData(null); // Asegúrate de limpiar el estado aquí también
    }}>
      {unidadToEdit ? (
          <>
            <h2 style={{ textAlign: 'center' }}>Editar Unidad</h2>

<form onSubmit={handleUpdateUnidad} className="form-container">

     {/* SELECCIÓN DE EMPRESA Y SUCURSAL */}
      <h4>Empresa y Sucursal</h4>
      <div className="form-group">
        <label>Empresa</label>
        <select
          value={unidadToEdit.id_empresa || ""}
          onChange={e => {
            const empresaId = e.target.value;
            setUnidadToEdit(prev => ({
              ...prev,
              id_empresa: empresaId,
              id_sucursal: ""
            }));
          }}
          required
        >
          <option value="">Seleccione una empresa</option>
          {empresas.map(e => (
            <option key={e.id_empresa} value={e.id_empresa}>{e.nombre_comercial}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Sucursal</label>
        <select
          value={unidadToEdit.id_sucursal || ""}
          onChange={e => setUnidadToEdit(prev => ({ ...prev, id_sucursal: e.target.value }))}
        >
          <option value="">Seleccione una sucursal</option>
          {sucursales.map(s => (
            <option key={s.id_sucursal} value={s.id_sucursal}>
              {s.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* DATOS DEL VEHÍCULO */}
      <h4>Datos del Vehículo</h4>
      <div className="form-row">
        <div className="form-group">
          <label>CVE</label>
          <input
            type="text"
            value={unidadToEdit.cve || ""}
            onChange={e => setUnidadToEdit({...unidadToEdit, cve: e.target.value})}
            required
          />
        </div>
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
            value={unidadToEdit.version || ""} 
            onChange={e => setUnidadToEdit({...unidadToEdit, version: e.target.value})} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Clase</label>
          <input 
            type="text" 
            value={unidadToEdit.clase || ""} 
            onChange={e => setUnidadToEdit({...unidadToEdit, clase: e.target.value})} 
            required 
          />
        </div>
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
          <label>Tipo</label>
          <input 
            type="text" 
            value={unidadToEdit.tipo || ""} 
            onChange={e => setUnidadToEdit({...unidadToEdit, tipo: e.target.value})} 
          />
        </div>
        <div className="form-group">
          <label>Año</label>
          <input 
            type="text" 
            value={unidadToEdit.año || ""} 
            onChange={e => setUnidadToEdit({...unidadToEdit, año: e.target.value})} 
          />
        </div>
      </div>

      {/* MÁS DATOS */}
      <h4>Más Datos</h4>
      <div className="form-row">
        <div className="form-group">
          <label>Motor</label>
          <input 
            type="text" 
            value={unidadToEdit.mas_datos?.motor || ""} 
            onChange={e => handleMasDatosChange("motor", e.target.value)} 
          />
        </div>
        <div className="form-group">
          <label>Transmisión</label>
          <select 
            value={unidadToEdit.mas_datos?.transmision || ""} 
            onChange={e => handleMasDatosChange("transmision", e.target.value)}
          >
            <option value="">Seleccione</option>
            <option value="Automática">Automática</option>
            <option value="Manual">Manual</option>
            <option value="CVT">CVT</option>
          </select>
        </div>
       <div className="form-group">
        <label htmlFor="combustible">Combustible:</label>
        <select
        name="id_combustible"
        value={unidadToEdit?.id_combustible || ""}
        onChange={handleChange}
      >
        <option value="">Seleccione combustible</option>
        {combustibles.map(c => (
          <option key={c.id_combustible} value={c.id_combustible}>
            {c.nombre}
          </option>
        ))}
      </select>

      </div>


        <div className="form-group">
          <label>Color</label>
          <input 
            type="text" 
            value={unidadToEdit.mas_datos?.color || ""} 
            onChange={e => handleMasDatosChange("color", e.target.value)} 
          />
        </div>
      </div>



  <div className="form-row">
    <div className="form-group">
      <label>NIV</label>
      <input type="text" value={unidadToEdit.niv || ""} 
             onChange={e => setUnidadToEdit({...unidadToEdit, niv: e.target.value})} />
    </div>
    <div className="form-group">
      <label>Propietario</label>
      <input type="text" value={unidadToEdit.mas_datos?.propietario || ""} 
             onChange={e => handleMasDatosChange("propietario", e.target.value)} />
    </div>
    <div className="form-group">
      <label>Compra o Arrendado</label>
      <input type="text" value={unidadToEdit.mas_datos?.compra_arrendado || ""} 
             onChange={e => handleMasDatosChange("compra_arrendado", e.target.value)} />
    </div>
    <div className="form-group">
      <label>Fecha Adquisición</label>
      <input type="date" value={unidadToEdit.fecha_adquisicion || ""} 
             onChange={e => setUnidadToEdit({...unidadToEdit, fecha_adquisicion: e.target.value})} />
    </div>
  </div>

  {/* ============================= */}
  {/* DOCUMENTOS Y VALORES */}
  {/* ============================= */}
  <div className="form-row">
    <div className="form-group">
      <label>Foto de la Unidad</label>
      <input type="file" accept="image/*" onChange={e => setFotoUnidad(e.target.files[0])} />
    </div>
    <div className="form-group">
      <label>Factura (PDF)</label>
      <input type="file" accept="image/*,application/pdf" onChange={e => setPdfFactura(e.target.files[0])} />
    </div>
    <div className="form-group">
      <label>Valor Factura</label>
      <input type="number" step="0.01" value={unidadToEdit.valor_factura || ""} 
             onChange={e => setUnidadToEdit({...unidadToEdit, valor_factura: e.target.value})} />
    </div>
    <div className="form-group">
      <label>Kilometraje actual</label>
      <input type="number" value={unidadToEdit.kilometraje_actual || ""} 
             onChange={e => setUnidadToEdit({...unidadToEdit, kilometraje_actual: e.target.value})} />
    </div>
  </div>

{/* ============================= */}
{/* COMBUSTIBLE Y TANQUE */}
{/* ============================= */}
<h4>Combustible y Tanque</h4>
<div className="form-row">
  <div className="form-group">
    <label>Litros actuales</label>
    <input
      type="number"
      step="0.01"
      value={unidadToEdit.litros_actuales || ""}
      onChange={e => handleMasDatosChange("litros_actuales", e.target.value)}
    />
  </div>
  <div className="form-group">
    <label>Tolerancia</label>
    <input
      type="number"
      step="0.01"
      value={unidadToEdit.tolerancia || ""}
      onChange={e => handleMasDatosChange("tolerancia", e.target.value)}
    />
  </div>
  <div className="form-group">
    <label>Capacidad de Tanque</label>
    <input
      type="number"
      step="0.01"
      value={unidadToEdit.capacidad_tanque || ""}
      onChange={e => handleMasDatosChange("capacidad_tanque", e.target.value)}
    />
  </div>
  <div className="form-group">
    <label>Kilometraje por Litro</label>
    <input
      type="number"
      step="0.01"
      value={unidadToEdit.kilometraje_por_litro || ""}
      onChange={e => handleMasDatosChange("kilometraje_por_litro", e.target.value)}
    />
  </div>
</div>

<div className="form-row">
  <div className="form-group">
    <label>Selecciona si será utilitario</label>

    <label className="check-btn">
  <input
  type="checkbox"
  checked={(unidadToEdit.mas_datos?.es_utilitario || "No Utilitario") === "Utilitario"}
  onChange={(e) =>
    handleMasDatosChange(
      "es_utilitario",
      e.target.checked ? "Utilitario" : "No Utilitario"
    )
  }
/>

<span className="check-label">
  {(unidadToEdit.mas_datos?.es_utilitario || "No Utilitario") === "Utilitario"
    ? "Utilitario"
    : "No utilitario"}
</span>

</label>

  </div>
</div>

  {/* ============================= */}
  {/* DATOS GPS */}
  {/* ============================= */}
<h4>Fotos de la unidad</h4>

<div className="form-row">

  {/* VISTA FRONTAL */}
  <div className="form-group">
    <label>Vista frontal</label>
    <div className="file-row">
      <input
        type="file"
        accept="image/*"
        onChange={e => setFotoFrontal(e.target.files[0])}
      />
      {unidadToEdit.foto_frontal && (
        <button
          type="button"
          className="btn-preview"
          onClick={() =>
            setFileModalData({
              url: `${BASE_URL}/${unidadToEdit.foto_frontal}`
            })
          }
        >
          Ver actual
        </button>
      )}
    </div>
  </div>

  {/* VISTA TRASERA */}
  <div className="form-group">
    <label>Vista trasera</label>
    <div className="file-row">
      <input
        type="file"
        accept="image/*"
        onChange={e => setFotoTrasera(e.target.files[0])}
      />
      {unidadToEdit.foto_trasera && (
        <button
          type="button"
          className="btn-preview"
          onClick={() =>
            setFileModalData({
              url: `${BASE_URL}/${unidadToEdit.foto_trasera}`
            })
          }
        >
          Ver actual
        </button>
      )}
    </div>
  </div>

  {/* LATERAL IZQUIERDO */}
  <div className="form-group">
    <label>Lateral izquierdo</label>
    <div className="file-row">
      <input
        type="file"
        accept="image/*"
        onChange={e => setFotoLateralizq(e.target.files[0])}
      />
      {unidadToEdit.foto_lateral_izq && (
        <button
          type="button"
          className="btn-preview"
          onClick={() =>
            setFileModalData({
              url: `${BASE_URL}/${unidadToEdit.foto_lateral_izq}`
            })
          }
        >
          Ver actual
        </button>
      )}
    </div>
  </div>


</div>
  <div className="form-row">

  {/* LATERAL DERECHO */}
  <div className="form-group">
    <label>Lateral derecho</label>
    <div className="file-row">
      <input
        type="file"
        accept="image/*"
        onChange={e => setFotoLateralder(e.target.files[0])}
      />
      {unidadToEdit.foto_lateral_der && (
        <button
          type="button"
          className="btn-preview"
          onClick={() =>
            setFileModalData({
              url: `${BASE_URL}/${unidadToEdit.foto_lateral_der}`
            })
          }
        >
          Ver actual
        </button>
      )}
    </div>
  </div>

  {/* TABLERO / NIVEL */}
  <div className="form-group">
    <label>Tablero / Nivel</label>
    <div className="file-row">
      <input
        type="file"
        accept="image/*"
        onChange={e => setFotoTablero(e.target.files[0])}
      />
      {unidadToEdit.foto_tablero_nivel && (
        <button
          type="button"
          className="btn-preview"
          onClick={() =>
            setFileModalData({
              url: `${BASE_URL}/${unidadToEdit.foto_tablero_nivel}`
            })
          }
        >
          Ver actual
        </button>
      )}
    </div>
  </div>
   </div>

  {/* ============================= */}
  {/* DATOS GPS */}
  {/* ============================= */}
  <h4>Datos de Navegación (GPS)</h4>
  <div className="form-row">
    <div className="form-group">
      <label>Teléfono GPS</label>
      <input type="text" value={unidadToEdit.mas_datos?.telefono_gps || ""} 
             onChange={e => handleMasDatosChange("telefono_gps", e.target.value)} />
    </div>
    <div className="form-group">
      <label>SIM GPS</label>
      <input type="text" value={unidadToEdit.mas_datos?.sim_gps || ""} 
             onChange={e => handleMasDatosChange("sim_gps", e.target.value)} />
    </div>
    <div className="form-group">
      <label>UID</label>
      <input type="text" value={unidadToEdit.mas_datos?.uid || ""} 
             onChange={e => handleMasDatosChange("uid", e.target.value)} />
    </div>
  </div>


  <button type="submit" className="btn-save">Guardar Cambios</button>
</form>


          </>
        ) : nuevaUnidad ? (
        <><h2 style={{ textAlign: 'center' }}>Agregar Nueva Unidad con Placa</h2>
    {/* =========================
        FORMULARIO (agregar unidad)
        ========================= */}


<form onSubmit={handleAgregarUnidad} className="form-container">

  {/* ========================= */}
  {/* SELECCIÓN DE EMPRESA Y SUCURSAL */}
  {/* ========================= */}
  <h4>Empresa y Sucursal</h4>
  <div className="form-group">
    <label>Empresa</label>
    <select
      value={nuevaUnidad.id_empresa || ""}
      onChange={e => {
        const empresaId = e.target.value;
        setNuevaUnidad(prev => ({ ...prev, id_empresa: empresaId, id_sucursal: "" }));
        setEmpresaSeleccionada(empresaId);
      }}
      required
    >
      <option value="">Seleccione una empresa</option>
      {empresas.map(e => (
        <option key={e.id_empresa} value={e.id_empresa}>
          {e.nombre_comercial}
        </option>
      ))}
    </select>
  </div>

  <div className="form-group">
    <label>Sucursal</label>
    <select
      value={unidadToEdit ? unidadToEdit.sucursal : nuevaUnidad.id_sucursal}
      onChange={e => {
        if (unidadToEdit) {
          setUnidadToEdit(prev => ({ ...prev, sucursal: e.target.value }));
        } else {
          setNuevaUnidad(prev => ({ ...prev, id_sucursal: e.target.value }));
        }
      }}
    >
      <option value="">Seleccione una sucursal</option>
      {sucursales.map(s => (
        <option key={s.id_sucursal} value={s.id_sucursal}>
          {s.nombre}
        </option>
      ))}
    </select>
  </div>

  {/* ========================= */}
  {/* DATOS DEL VEHÍCULO */}
  {/* ========================= */}
  <h4>Datos del Vehículo</h4>
  <div className="form-row">
    <div className="form-group">
      <label>CVE</label>
      <input
        type="text"
        name="cve"
        placeholder="Ej: ABC123XYZ"
        value={nuevaUnidad.cve || ""}
        onChange={handleChangeNuevaUnidad}
        required
      />
    </div>
    <div className="form-group">
      <label>Marca</label>
      <input
        type="text"
        name="marca"
        placeholder="Ej: Volkswagen"
        value={nuevaUnidad.marca || ""}
        onChange={handleChangeNuevaUnidad}
        required
      />
    </div>
    <div className="form-group">
      <label>Versión</label>
      <input
        type="text"
        name="version"
        placeholder="Ej: Saveiro"
        value={nuevaUnidad.version || ""}
        onChange={handleChangeNuevaUnidad}
      />
    </div>
    <div className="form-group">
      <label>Año</label>
      <input
        type="number"
        name="año"
        placeholder="Ej: 2020"
        value={nuevaUnidad.año || ""}
        onChange={handleChangeNuevaUnidad}
        required
      />
    </div>
  </div>

  <div className="form-row">
    <div className="form-group">
      <label>Tipo</label>
      <input
        type="text"
        name="tipo"
        placeholder="Ej: Camioneta"
        value={nuevaUnidad.tipo || ""}
        onChange={handleChangeNuevaUnidad}
      />
    </div>
    <div className="form-group">
      <label>Clase</label>
      <input
        type="text"
        name="clase"
        placeholder="Ej: Pickup"
        value={nuevaUnidad.clase || ""}
        onChange={handleChangeNuevaUnidad}
      />
    </div>
    <div className="form-group">
      <label>Modelo</label>
      <input
        type="text"
        name="modelo"
        placeholder="Ej: 2020"
        value={nuevaUnidad.modelo || ""}
        onChange={handleChangeNuevaUnidad}
        required
      />
    </div>
  </div>

  <div className="form-row">
    <div className="form-group">
      <label>NIV</label>
      <input
        type="text"
        name="niv"
        placeholder="Ej: 1HGCM82633A004352"
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
        placeholder="Ej: 1.8L 4 cilindros"
        value={nuevaUnidad.motor || ""}
        onChange={handleChangeNuevaUnidad}
      />
    </div>
    <div className="form-group">
      <label>Transmisión</label>
      <select name="transmision" value={nuevaUnidad.transmision || ""} onChange={handleChangeNuevaUnidad}>
        <option value="">Seleccione</option>
        <option value="Automática">Automática</option>
        <option value="Manual">Manual</option>
        <option value="CVT">CVT</option>
      </select>
    </div>
  </div>

  <div className="form-row">
<div className="form-group">
  <label htmlFor="combustible">Combustible:</label>
  <select
    id="combustible"
    name="id_combustible"
    value={nuevaUnidad.id_combustible || ""}
    onChange={(e) =>
      setNuevaUnidad(prev => ({ ...prev, id_combustible: e.target.value }))
    }
    required
  >
    <option value="">Selecciona un combustible</option>
    {combustibles.map((c) => (
      <option key={c.id_combustible} value={c.id_combustible}>
        {c.nombre}
      </option>
    ))}
  </select>
</div>


    <div className="form-group">
      <label>Color</label>
      <input
        type="text"
        name="color"
        placeholder="Ej: Rojo"
        value={nuevaUnidad.color || ""}
        onChange={handleChangeNuevaUnidad}
      />
    </div>
    <div className="form-group">
      <label>Fecha de adquisición</label>
      <input
        type="date"
        name="fecha_adquisicion"
        value={nuevaUnidad.fecha_adquisicion || ""}
        onChange={handleChangeNuevaUnidad}
      />
    </div>
  </div>
  <div className="form-row">
    <div className="form-group">
      <label>Propietario</label>
      <input
        type="text"
        name="propietario"
        placeholder="Ej: Juan Pérez"
        value={nuevaUnidad.propietario || ""}
        onChange={handleChangeNuevaUnidad}
      />
    </div>
    <div className="form-group">
      <label>Compra o Arrendado</label>
      <input
        type="text"
        name="compra_arrendado"
        placeholder="Ej: Compra"
        value={nuevaUnidad.compra_arrendado || ""}
        onChange={handleChangeNuevaUnidad}
      />
    </div>
    <div className="form-group">
      <label>Litros actuales en el tanque</label>
      <input
        type="number"
        step="0.01"
        name="litros_actuales"
        placeholder="Ej: 40.50"
        value={nuevaUnidad.litros_actuales || ""}
        onChange={handleChangeNuevaUnidad}
      />
    </div>
  </div>
  <div className="form-row">
    
    <div className="form-group">
      <label>Capacidad de Tanque</label>
      <input
        type="number"
        step="0.01"
        name="capacidad_tanque"
        placeholder="Ej: 50.00"
        value={nuevaUnidad.capacidad_tanque || ""}
        onChange={handleChangeNuevaUnidad}
      />
    </div>
    <div className="form-group">
      <label>Kilometraje por Litro</label>
      <input
        type="number"
        step="0.01"
        name="kilometraje_por_litro"
        placeholder="Ej: 12.5"
        value={nuevaUnidad.kilometraje_por_litro || ""}
        onChange={handleChangeNuevaUnidad}
      />
    </div>
    <div className="form-group">
      <label>Tolerancia por litro</label>
      <input
        type="number"
        step="0.01"
        name="tolerancia"
        placeholder="Ej: 1.5"
        value={nuevaUnidad.tolerancia || ""}
        onChange={handleChangeNuevaUnidad}
      />
    </div>
  </div>
  {/* ========================= */}
  {/* DOCUMENTOS Y VALORES */}
  {/* ========================= */}
  <div className="form-row">
    <div className="form-group">
      <label>Foto de la Unidad</label>
      <input type="file" accept="image/*" onChange={(e) => setFotoUnidad(e.target.files[0])} />
    </div>
    <div className="form-group">
      <label>Factura (PDF, imagen)</label>
      <input type="file" accept="image/*,application/pdf" onChange={(e) => setPdfFactura(e.target.files[0])} />
    </div>
    <div className="form-group">
      <label>Valor Factura</label>
      <input
        type="number"
        step="0.01"
        name="valor_factura"
        placeholder="Ej: 350000.00"
        value={nuevaUnidad.valor_factura || ""}
        onChange={handleChangeNuevaUnidad}
      />
    </div>


  </div>
  <div className="form-row">
        <div className="form-group">
      <label>Kilometraje actual</label>
      <input
        type="number"
        name="kilometraje_actual"
        placeholder="Ej: 12000"
        value={nuevaUnidad.kilometraje_actual || ""}
        onChange={handleChangeNuevaUnidad}
      />
    </div>
    {/* ========================= */}
    {/* UTILITARIO */}
    {/* ========================= */}
    <div className="form-group">
      <label htmlFor="">Selecciona si sera utilitario</label>
      <label className="check-btn">
        <input 
          type="checkbox"
          checked={nuevaUnidad.es_utilitario === "Utilitario"}
          onChange={(e) =>
            setNuevaUnidad(prev => ({
              ...prev,
              es_utilitario: e.target.checked ? "Utilitario" : "No Utilitario"
            }))
          }
        />

        <span className="check-label">
          {nuevaUnidad.es_utilitario === "Utilitario" ? "Utilitario" : "No utilitario"}
        </span>
      </label>
    </div>

      </div>
  

<div className="imagenes-vehiculo">

  <h4>Imagenes del vehiculo</h4>
  {/* ========================= */}
  <div className="form-row">

    <div className={`form-group ${fotoFrontal ? "seleccionado" : ""}`}>
      <label>Foto frontal</label>
      <input type="file" accept="image/*"
        onChange={(e) => setFotoFrontal(e.target.files[0])} />
    </div>

    <div className={`form-group ${fotoTrasera ? "seleccionado" : ""}`}>
      <label>Foto trasera</label>
      <input type="file" accept="image/*"
        onChange={(e) => setFotoTrasera(e.target.files[0])} />
    </div>

    <div className={`form-group ${fotoLateralizq ? "seleccionado" : ""}`}>
      <label>Foto lateral izquierda</label>
      <input type="file" accept="image/*"
        onChange={(e) => setFotoLateralizq(e.target.files[0])} />
    </div>

  </div>

  <div className="form-row">

    <div className={`form-group ${fotoLateralder ? "seleccionado" : ""}`}>
      <label>Foto lateral derecha</label>
      <input type="file" accept="image/*"
        onChange={(e) => setFotoLateralder(e.target.files[0])} />
    </div>

    <div className={`form-group ${fotoTablero ? "seleccionado" : ""}`}>
      <label>Foto tablero niv</label>
      <input type="file" accept="image/*"
        onChange={(e) => setFotoTablero(e.target.files[0])} />
    </div>

  </div>

</div>


  {/* ========================= */}
  {/* GPS */}
  {/* ========================= */}
  <h4>Datos de Navegación (GPS)</h4>
  <div className="form-row">
    <div className="form-group">
      <label>Teléfono GPS</label>
      <input
        type="text"
        name="telefono_gps"
        placeholder="Ej: 5512345678"
        value={nuevaUnidad.telefono_gps || ""}
        onChange={handleChangeNuevaUnidad}
      />
    </div>
    <div className="form-group">
      <label>SIM GPS</label>
      <input
        type="text"
        name="sim_gps"
        placeholder="Ej: 8901234567890123456"
        value={nuevaUnidad.sim_gps || ""}
        onChange={handleChangeNuevaUnidad}
      />
    </div>
    <div className="form-group">
      <label>UID</label>
      <input
        type="text"
        name="uid"
        placeholder="Ej: ABC123UID"
        value={nuevaUnidad.uid || ""}
        onChange={handleChangeNuevaUnidad}
      />
    </div>
  </div>





  {/* ========================= */}
  {/* PLACAS (opcional) */}
  {/* ========================= */}
  <h3>Placas (Opcional)</h3>
  <div className="form-group">
    <label>
      <input type="checkbox" checked={agregarPlacas} onChange={() => setAgregarPlacas(!agregarPlacas)} />
      &nbsp;Agregar placas
    </label>
  </div>

  {agregarPlacas && (
    <>
      <div className="form-row">
        <div className="form-group">
          <label>Placa</label>
          <input
            type="text"
            name="placa"
            placeholder="Ej: ABC1234"
            value={nuevaUnidad.placa || ""}
            onChange={handleChangeNuevaUnidad}
          />
        </div>
        <div className="form-group">
          <label>Folio de la tarjeta de circulación</label>
          <input
            type="text"
            name="folio"
            placeholder="Ej: 987654321"
            value={nuevaUnidad.folio || ""}
            onChange={handleChangeNuevaUnidad}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Fecha Expedición</label>
          <input type="date" name="fecha_expedicion" value={nuevaUnidad.fecha_expedicion || ""} onChange={handleChangeNuevaUnidad} />
        </div>
        <div className="form-group">
          <label>Fecha Vigencia</label>
          <input type="date" name="fecha_vigencia" value={nuevaUnidad.fecha_vigencia || ""} onChange={handleChangeNuevaUnidad} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Monto Pago de las placas</label>
          <input
            type="number"
            name="monto_pago"
            placeholder="Ej: 1500"
            value={nuevaUnidad.monto_pago || ""}
            onChange={handleChangeNuevaUnidad}
          />
        </div>
        <div className="form-group">
          <label>Comprobante del Pago (imagen o pdf)</label>
          <input type="file" accept="image/*,application/pdf" onChange={(e) => setComprobantePago(e.target.files[0])} />
        </div>
        <div className="form-group">
          <label>Placa Frontal(imagen o pdf)</label>
          <input type="file" accept="image/*,application/pdf" onChange={(e) => setPdfFrontal(e.target.files[0])} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Placa Trasera (imagen o pdf)</label>
          <input type="file" accept="image/*,application/pdf" onChange={(e) => setPdfTrasero(e.target.files[0])} />
        </div>
        <div className="form-group">
          <label>Tarjeta de Circulación (imagen o pdf)</label>
          <input type="file" accept="image/*,application/pdf" onChange={(e) => setTarjetaCirculacion(e.target.files[0])} />
        </div>
      </div>
    </>
  )}

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

{fileModalUrl && <ModalFile url={fileModalUrl} onClose={() => setFileModalUrl(null)} />}

{fileModalUrl && (
  <ModalFile
    url={fileModalUrl}
    onClose={() => setFileModalUrl(null)}
  />
)}
{archivoModalUrl && (
  <ModalFile
    url={archivoModalUrl}
    onClose={() => setArchivoModalUrl(null)}
  />
)}

{modalImagenesUnidad.abierta && (
  <Modal onClose={() => setModalImagenesUnidad({ abierta: false, imagenes: [] })}>
    <h2>Imágenes del vehículo</h2>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        gap: "15px",
        marginTop: "15px"
      }}
    >
      {modalImagenesUnidad.imagenes.map((img, idx) => (
        <div
          key={idx}
          onClick={() => setArchivoModalUrl(img.url)}
          style={{
            cursor: "pointer",
            border: "1px solid #ddd",
            borderRadius: "6px",
            padding: "8px",
            textAlign: "center"
          }}
        >
          <img
            src={img.url}
            alt={img.label}
            style={{
              width: "100%",
              height: "120px",
              objectFit: "cover",
              borderRadius: "4px"
            }}
          />
          <div style={{ marginTop: "6px", fontSize: "0.85rem", fontWeight: "bold" }}>
            {img.label}
          </div>
        </div>
      ))}
    </div>
  </Modal>
)}
{fileModalData && (
  <ModalFile
    url={fileModalData.url}
    onClose={() => setFileModalData(null)}
  />
)}




    </div>
    
  );
};

export default Unidades;
