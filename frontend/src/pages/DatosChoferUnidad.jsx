import React, { useState, useEffect } from "react";
import { API_URL } from "../config";
import ModalFile from "../components/ModalFile";
import styles from "./unidad_documento.module.css"; // estilos para documentación
import "./DatosChoferUnidad.css"; // estilos de chofer/unidad

export default function PanelChoferUnidad() {
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalUrl, setModalUrl] = useState(null);
  const [verHistorial, setVerHistorial] = useState({ pagos: false, placas: false });

  useEffect(() => {
    const fetchDatos = async () => {
      const idUsuario = localStorage.getItem("usuarioId");
      if (!idUsuario) {
        setError("Usuario no identificado");
        setLoading(false);
        return;
      }

      try {
        // Fetch de chofer/unidad
        const resDatos = await fetch(`${API_URL}/chofer/unidad/${idUsuario}`);
        if (!resDatos.ok) throw new Error("No se pudieron cargar los datos del chofer/unidad");
        const dataChoferUnidad = await resDatos.json();

        // Fetch de documentación
        const resDoc = await fetch(`${API_URL}/documentacion/unidad/chofer/${idUsuario}`);
        if (!resDoc.ok) throw new Error("No se pudieron cargar los documentos del vehículo");
        const dataDoc = await resDoc.json();

        // Combina ambos
        setDatos({ ...dataChoferUnidad, documentacion: dataDoc });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, []);

  const abrirModal = (url) => setModalUrl(`${API_URL}/${url}`);
  const cerrarModal = () => setModalUrl(null);

  if (loading) return <p className={styles.cargando}>Cargando información...</p>;
  if (error) return <p className="error">Error: {error}</p>;
  if (!datos) return <p className="no-datos">No hay datos disponibles</p>;

  const { chofer, unidad, usuario, documentacion } = datos;

  const choferExiste = chofer && Object.keys(chofer).length > 0;

  // Render historial auxiliar
  const renderHistorial = (items, urlKey) =>
    items.map((h, i) => (
      <div key={i} className={styles.historialBox}>
        <p>{h.anio || h.placa} - {h.tipo_pago || ""}</p>
        {urlKey && h[urlKey] && (
          <button className={styles.btnAction} onClick={() => abrirModal(h[urlKey])}>
            Ver documento
          </button>
        )}
      </div>
    ));

  return (
    <div className={styles.unidadesContainer}>
      {/* ========================= */}
      {/* DATOS DEL CHOFER */}
      {/* ========================= */}
      {choferExiste ? (
        <section className="tarjeta chofer">
          <h2>Chofer</h2>
          <p><strong>Nombre completo:</strong> {chofer.nombre}</p>
          <p><strong>Usuario:</strong> {usuario.usuario}</p>
          <p><strong>Correo:</strong> {usuario.correo}</p>
          <p><strong>Rol:</strong> {usuario.rol}</p>
          <p><strong>Estado:</strong> {usuario.estado ? "Activo" : "Inactivo"}</p>
          <p><strong>Fecha de registro:</strong> {usuario.fecha_registro}</p>
          <p><strong>Último login:</strong> {usuario.fecha_ultimo_login || "Nunca"}</p>
          <p><strong>CURP:</strong> {chofer.curp}</p>
          <p><strong>Licencia:</strong> {chofer.licencia_tipo} ({chofer.licencia_vigencia || "No especificada"})</p>
          <p><strong>Calle:</strong> {chofer.calle || "No especificada"}</p>
          <p><strong>Colonia / Localidad:</strong> {chofer.colonia_localidad || "No especificada"}</p>
          <p><strong>Código Postal:</strong> {chofer.codpos || "No especificado"}</p>
          <p><strong>Municipio:</strong> {chofer.municipio || "No especificado"}</p>
        </section>
      ) : (
        <section className="tarjeta chofer">
          <h2>Chofer</h2>
          <p>No hay datos de chofer disponibles.</p>
        </section>
      )}

      {/* ========================= */}
      {/* DATOS DE LA UNIDAD */}
      {/* ========================= */}
      {unidad ? (
        <section className="unidad tarjeta">
          <h2>Unidad Asignada</h2>
          {unidad.url_foto && (
            <div className="imagen-unidad">
              <img
                src={unidad.url_foto.startsWith("http") ? unidad.url_foto : `${API_URL}/${unidad.url_foto}`}
                alt="Unidad"
              />
            </div>
          )}
          <p><strong>CVE:</strong> {unidad.cve}</p>
          <p><strong>Marca:</strong> {unidad.marca} {unidad.version}</p>
          <p><strong>Modelo:</strong> {unidad.modelo}</p>
          <p><strong>Placas:</strong> {unidad.placas ? unidad.placas.placa : "Sin placa registrada"}</p>
          <p><strong>Color:</strong> {unidad.color}</p>
                {documentacion && (
        <div className={styles.cardsContainer}>
          {/* Factura e imágenes */}
          <div className={styles.infoCard}>
            <h3>Factura e imágenes del vehículo</h3>
            <div className={styles.gridFotosVertical}>
              {Object.entries(documentacion.factura_y_fotos?.fotos || {}).map(([key, url]) =>
                url ? (
                  <button key={key} className={styles.btnFotoLarge} onClick={() => abrirModal(url)}>
                    📷 {key.replace("_", " ")}
                  </button>
                ) : (
                  <button key={key} className={styles.btnFotoDisabledLarge} title={`${key} no disponible`}>
                    ❌ {key.replace("_", " ")}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Placas */}
          <div className={styles.infoCard}>
            <h3>Placas y tarjeta de circulación</h3>
            {documentacion.placas?.actual ? (
              <>
                {["placa","fecha_vigencia"].map(k => (
                  <div key={k} className={styles.datoItem}>
                    <span><b>{k.replace("_"," ")}</b></span>
                    <span>{documentacion.placas.actual[k]}</span>
                  </div>
                ))}
                {["url_placa_frontal","url_placa_trasera","url_tarjeta_circulacion"].map(k =>
                  documentacion.placas.actual[k] && (
                    <button key={k} className={styles.btnAction} onClick={() => abrirModal(documentacion.placas.actual[k])}>
                      📄 Ver {k.replace("url_","").replace("_"," ")}
                    </button>
                  )
                )}
                <button className={styles.btnAction} onClick={() => setVerHistorial(prev => ({...prev, placas: !prev.placas}))}>
                  {verHistorial.placas ? "Ocultar historial" : "Ver historial"}
                </button>
                {verHistorial.placas && renderHistorial(documentacion.placas.historial, "url_tarjeta_circulacion")}
              </>
            ) : <span className={styles.badgeMissing}>Sin placas registradas</span>}
          </div>
          
          {/* Pólizas / Garantías */}
          <div className={styles.infoCard}>
            <h3>Pólizas de seguro</h3>
            {documentacion.garantias?.length ? (
              documentacion.garantias.map((p, i) => (
                <div key={i} className={styles.historialBoxCompact}>
                  <span>{p.aseguradora} – {p.vigencia} ({p.estado ? "Activa":"Inactiva"})</span>
                  {p.url_poliza && (
                    <button className={`${styles.btnAction} ${styles.btnSmall}`} onClick={() => abrirModal(p.url_poliza)}>
                      📄 Ver
                    </button>
                  )}
                </div>
              ))
            ) : <span className={styles.badgeMissing}>No hay póliza registrada</span>}
          </div>
          {/* Verificación */}
          <div className={styles.infoCard}>
            <h3>Verificación vehicular</h3>
            {documentacion.verificacion ? (
              <>
                {["ultima_verificacion","holograma"].map(k => (
                  <div key={k} className={styles.datoItem}>
                    <span><b>{k.replace("_"," ")}</b></span>
                    <span>{documentacion.verificacion[k]}</span>
                  </div>
                ))}
                {documentacion.verificacion.url_verificacion_1 && (
                  <button className={styles.btnAction} onClick={() => abrirModal(documentacion.verificacion.url_verificacion_1)}>
                    Ver talón de verificación
                  </button>
                )}
              </>
            ) : <span className={styles.badgeMissing}>No registrada</span>}
          </div>


        </div>
      )}

        </section>
      ) : (
        <section className="unidad tarjeta">
          <h2>Unidad Asignada</h2>
          <p>No hay unidad asignada.</p>
        </section>
      )}

      {/* ========================= */}
      {/* DOCUMENTACIÓN DEL VEHÍCULO */}
      {/* ========================= */}

      {/* Modal */}
      {modalUrl && <ModalFile url={modalUrl} onClose={cerrarModal} />}
    </div>
  );
}
