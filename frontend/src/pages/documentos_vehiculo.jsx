import { useEffect, useState } from "react";
import { API_URL } from "../config";
import ModalFile from "../components/ModalFile";
import styles from "./unidad_documento.module.css";

export default function DocumentacionUnidadChofer() {
  const [data, setData] = useState(null);
  const [modalUrl, setModalUrl] = useState(null);
  const [verHistorial, setVerHistorial] = useState({ pagos: false, placas: false });

  useEffect(() => {
    const idUsuario = localStorage.getItem("usuarioId");
    if (!idUsuario) return;

    fetch(`${API_URL}/documentacion/unidad/chofer/${idUsuario}`)
      .then(res => res.json())
      .then(setData);
  }, []);

  const abrirModal = (url) => setModalUrl(`${API_URL}/${url}`);
  const cerrarModal = () => setModalUrl(null);

  if (!data) return <p className={styles.cargando}>Cargando documentación…</p>;

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
      <h1 className={styles.mainTitle}>Documentación del Vehículo Asignado</h1>

      {/* Contenedor de todas las tarjetas */}
      <div className={styles.cardsContainer}>

        {/* FACTURA + FOTOS */}
<div className={styles.infoCard}>
  <h3>Factura e imágenes del vehículo</h3>

  <div className={styles.gridFotosVertical}>
   

    {/* Fotos del vehículo */}
    {Object.entries(data.factura_y_fotos?.fotos || {}).map(([key, url]) =>
      url ? (
        <button
          key={key}
          className={styles.btnFotoLarge}
          onClick={() => abrirModal(url)}
          title={key.replace("_", " ")}
        >
          📷 {key.replace("_", " ")}
        </button>
      ) : (
        <button
          key={key}
          className={styles.btnFotoDisabledLarge}
          title={`${key} no disponible`}
        >
          ❌ {key.replace("_", " ")}
        </button>
      )
    )}
  </div>
</div>



        {/* PLACAS */}
        <div className={styles.infoCard}>
          <h3>Placas y tarjeta de circulación</h3>
          {data.placas?.actual ? (
            <>
              {["placa","fecha_vigencia"].map(k => (
                <div key={k} className={styles.datoItem}>
                  <span><b>{k.replace("_"," ")}</b></span>
                  <span>{data.placas.actual[k]}</span>
                </div>
              ))}
              {["url_placa_frontal","url_placa_trasera","url_tarjeta_circulacion"].map(k =>
                data.placas.actual[k] && (
                  <button key={k} className={styles.btnAction} onClick={() => abrirModal(data.placas.actual[k])}>
                    📄 Ver {k.replace("url_","").replace("_"," ")}
                  </button>
                )
              )}
              <button className={styles.btnAction} onClick={() => setVerHistorial(prev => ({...prev, placas: !prev.placas}))}>
                {verHistorial.placas ? "Ocultar historial" : "Ver historial"}
              </button>
              {verHistorial.placas && renderHistorial(data.placas.historial, "url_tarjeta_circulacion")}
            </>
          ) : <span className={styles.badgeMissing}>Sin placas registradas</span>}
        </div>


        {/* VERIFICACIÓN */}
        <div className={styles.infoCard}>
          <h3>Verificación vehicular</h3>
          {data.verificacion ? (
            <>
              {["ultima_verificacion","holograma"].map(k => (
                <div key={k} className={styles.datoItem}>
                  <span><b>{k.replace("_"," ")}</b></span>
                  <span>{data.verificacion[k]}</span>
                </div>
              ))}
              {data.verificacion.url_verificacion_1 && (
                <button className={styles.btnAction} onClick={() => abrirModal(data.verificacion.url_verificacion_1)}>
                  Ver talón de verificacion
                </button>
              )}
            </>
          ) : <span className={styles.badgeMissing}>No registrada</span>}
        </div>

        {/* PÓLIZAS / GARANTÍAS */}
        <div className={styles.infoCard}>
          <h3>Pólizas de seguro</h3>
          {data.garantias?.length ? (
            data.garantias.map((p, i) => (
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

      </div>

      {modalUrl && <ModalFile url={modalUrl} onClose={cerrarModal} />}
    </div>
  );
}
