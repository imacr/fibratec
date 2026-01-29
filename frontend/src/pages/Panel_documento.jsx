import { useEffect, useState } from "react";
import { API_URL } from "../config";
import ModalFile from "../components/ModalFile";
import { Card } from "/src/pages/Cards.jsx";
import styles from "./Documentacion.module.css";

export default function DocumentacionUnidades() {
  const [unidades, setUnidades] = useState([]);
  const [unidadId, setUnidadId] = useState("");
  const [data, setData] = useState(null);
  const [modalUrl, setModalUrl] = useState(null);
  const [verHistorialPagos, setVerHistorialPagos] = useState(false);
  const [verHistorialPlacas, setVerHistorialPlacas] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/unidades`)
      .then(res => res.json())
      .then(setUnidades);
  }, []);

  useEffect(() => {
    if (!unidadId) return;
    fetch(`${API_URL}/documentacion/unidad/${unidadId}`)
      .then(res => res.json())
      .then(setData);
  }, [unidadId]);

  const abrirModal = (url) => setModalUrl(`${API_URL}/${url}`);
  const cerrarModal = () => setModalUrl(null);

  return (
    <div className={styles.unidadesContainer}>
      <h1 className={styles.mainTitle}>Documentación del Vehículo</h1>

      <select
        className={styles.selectPremium}
        value={unidadId}
        onChange={e => setUnidadId(e.target.value)}
      >
        <option value="">Seleccione una unidad</option>
        {unidades.map(u => (
          <option key={u.id_unidad} value={u.id_unidad}>
            {u.cve} - {u.marca} {u.modelo} ({u.año})
          </option>
        ))}
      </select>

      {data && (
        <div className={styles.panelGrid}>

          {/* FACTURA */}
          <section className={styles.cardSection}>
            <Card titulo="Factura e imágenes del vehículo" className={styles.customCard}>
              {data.factura_y_fotos?.url_factura ? (
                <button
                  className={styles.btnAction}
                  onClick={() => abrirModal(data.factura_y_fotos.url_factura)}
                >
                  📄 Ver factura
                </button>
              ) : (
                <span className={styles.badgeMissing}>Factura no cargada</span>
              )}

              <div className={styles.gridFotos}>
                {Object.entries(data.factura_y_fotos?.fotos || {}).map(
                  ([key, url]) =>
                    url ? (
                      <button
                        key={key}
                        className={styles.btnAction}
                        onClick={() => abrirModal(url)}
                      >
                        📷 {key.replace("_", " ")}
                      </button>
                    ) : (
                      <span key={key} className={styles.badgeMissing}>
                        {key} no disponible
                      </span>
                    )
                )}
              </div>
            </Card>
          </section>

          {/* PLACAS */}
          <section className={styles.cardSection}>
            <Card titulo="Placas" className={styles.customCard}>
              {data.placas?.actual ? (
                <>
                  <div className={styles.datoItem}>
                    <span><b>Placa</b></span>
                    <span>{data.placas.actual.placa}</span>
                  </div>

                  <div className={styles.datoItem}>
                    <span><b>Vigencia</b></span>
                    <span>{data.placas.actual.fecha_vigencia}</span>
                  </div>

                  {data.placas.actual.url_placa_frontal ? (
                    <button
                        className={styles.btnAction}
                        onClick={() => abrirModal(data.placas.actual.url_placa_frontal)}
                    >
                        📄 Ver placa frontal
                    </button>
                    ) : (
                    <span className={styles.badgeMissing}>Placa frontal no disponible</span>
                    )}

                    {data.placas.actual.url_placa_trasera ? (
                    <button
                        className={styles.btnAction}
                        onClick={() => abrirModal(data.placas.actual.url_placa_trasera)}
                    >
                        📄 Ver placa trasera
                    </button>
                    ) : (
                    <span className={styles.badgeMissing}>Placa trasera no disponible</span>
                    )}

                    {data.placas.actual.url_tarjeta_circulacion ? (
                    <button
                        className={styles.btnAction}
                        onClick={() => abrirModal(data.placas.actual.url_tarjeta_circulacion)}
                    >
                        📄 Ver tarjeta de circulación
                    </button>
                    ) : (
                    <span className={styles.badgeMissing}>Tarjeta de circulación no disponible</span>
                    )}


                  <button
                    className={styles.btnAction}
                    onClick={() => setVerHistorialPlacas(!verHistorialPlacas)}
                  >
                    {verHistorialPlacas ? "Ocultar historial" : "Ver historial"}
                  </button>

                  {verHistorialPlacas &&
                    data.placas.historial.map((h, i) => (
                      <div key={i} className={styles.historialBox}>
                        <p>{h.placa} ({h.fecha_vigencia})</p>
                        {h.url_tarjeta && (
                          <button
                            className={styles.btnAction}
                            onClick={() => abrirModal(h.url_tarjeta)}
                          >
                            Ver documento
                          </button>
                        )}
                      </div>
                    ))}
                </>
              ) : (
                <span className={styles.badgeMissing}>Sin placas registradas</span>
              )}
            </Card>
          </section>

{/* REFRENDO */}
<section className={styles.cardSection}>
  <Card titulo="Refrendo / Tenencia" className={styles.customCard}>
    {data.refrendo_tenencia?.actual ? (
      <>
        <div className={styles.datoItem}>
          <span><b>Año</b></span>
          <span>{data.refrendo_tenencia.actual.anio}</span>
        </div>

        <div className={styles.datoItem}>
          <span><b>Tipo</b></span>
          <span>{data.refrendo_tenencia.actual.tipo_pago}</span>
        </div>

        
        <div className={styles.datoItem}>
          {data.refrendo_tenencia.actual.url_factura ? (
            <button
              className={styles.btnAction}
              onClick={() =>
                abrirModal(data.refrendo_tenencia.actual.url_factura)
              }
            >
            
              Ver comprobante de pago
            </button>
          ) : (
            <span className={styles.badgeMissing}>
              Comprobante de pago no disponible
            </span>
          )}
        </div>

        <div className={styles.datoItem}>
          {data.refrendo_tenencia.actual.url_comprobante ? (
            <button
              className={styles.btnAction}
              onClick={() =>
                abrirModal(data.refrendo_tenencia.actual.url_comprobante)
              }
            >
              Ver Formato o baucher de pago
            </button>
          ) : (
            <span className={styles.badgeMissing}>
              Formato o baucher no disponible
            </span>
          )}
        </div>

        

        {/* Botón para ver historial solo si existe */}
        {data.refrendo_tenencia.historial?.length > 0 && (
          <>
            <button
              className={styles.btnAction}
              onClick={() => setVerHistorialPagos(!verHistorialPagos)}
            >
              {verHistorialPagos ? "Ocultar años" : "Ver otros años"}
            </button>

            {verHistorialPagos &&
              data.refrendo_tenencia.historial.map((h, i) => (
                <div key={i} className={styles.historialBox}>
                  <p>{h.anio} - {h.tipo_pago}</p>
                  {h.url_comprobante ? (
                    <button
                      className={styles.btnAction}
                      onClick={() => abrirModal(h.url_comprobante)}
                    >
                      Ver comprobante
                    </button>
                  ) : (
                    <span className={styles.badgeMissing}>Formato no disponible</span>
                  )}
                  {h.url_factura ? (
                    <button
                      className={styles.btnAction}
                      onClick={() => abrirModal(h.url_factura)}
                    >
                      Ver pago
                    </button>
                  ) : (
                    <span className={styles.badgeMissing}>Comprobante pago no disponible</span>
                  )}
                </div>
              ))}
          </>
        )}
      </>
    ) : (
      <span className={styles.badgeMissing}>Sin pagos registrados</span>
    )}
  </Card>
</section>

          {/* VERIFICACIÓN */}
          <section className={styles.cardSection}>
            <Card titulo="Verificación" className={styles.customCard}>
              {data.verificacion ? (
                <>
                  <div className={styles.datoItem}>
                    <span><b>Última</b></span>
                    <span>{data.verificacion.ultima_verificacion}</span>
                  </div>

                  <div className={styles.datoItem}>
                    <span><b>Holograma</b></span>
                    <span>{data.verificacion.holograma}</span>
                  </div>

                  <button
                    className={styles.btnAction}
                    onClick={() => abrirModal(data.verificacion.url_1)}
                  >
                    Ver talon de verificacion
                  </button>
                </>
              ) : (
                <span className={styles.badgeMissing}>No registrada</span>
              )}
            </Card>
          </section>

          {/* PÓLIZAS */}
          <section className={styles.cardSection}>
            <Card titulo="Pólizas / Garantías" className={styles.customCard}>
              {data.polizas?.length ? (
                data.polizas.map((p, i) => (
                  <div key={i} className={styles.historialBox}>
                    <p>{p.aseguradora} – vence {p.anio_vencimiento} ({p.estado})</p>
                    <button
                      className={styles.btnAction}
                      onClick={() => abrirModal(p.url_poliza)}
                    >
                      Ver póliza
                    </button>
                  </div>
                ))
              ) : (
                <span className={styles.badgeMissing}>No hay pólizas</span>
              )}
            </Card>
          </section>

        </div>
      )}

      {modalUrl && <ModalFile url={modalUrl} onClose={cerrarModal} />}
    </div>
  );
}
