import React from "react";

export default function RegistrarFalla({ solicitud, fallaData, handleChangeFalla, handleSubmitFalla }) {
  return (
    <div className="form-card mb-4">
      <h3 className="form-title">Cerrar Falla para solicitud #{solicitud.id_solicitud}</h3>

      <div className="form-grid-2cols">
        <div className="form-group">
          <label>Unidad:</label>
          <input type="text" value={`${solicitud.cve} ${solicitud.unidad}`}
 readOnly />
        </div>

        <div className="form-group">
          <label>Tipo de servicio realizado:</label>
          <input type="text" value={solicitud.pieza} readOnly />
        </div>

        <div className="form-group">
          <label>Servicio:</label>
          <input type="text" value={solicitud.tipo_servicio} readOnly />
        </div>

        <div className="form-group">
          <label>Descripción:</label>
          <textarea value={solicitud.descripcion} readOnly />
        </div>
      </div>

      <form onSubmit={e => { e.preventDefault(); handleSubmitFalla(solicitud.id_solicitud); }} className="form-grid-2cols mt-4">

        <div className="form-group">
          <label>Proveedor:</label>
          <input
            type="text"
            name="proveedor"
            value={fallaData[solicitud.id_solicitud]?.proveedor || ""}
            onChange={e => handleChangeFalla(e, solicitud.id_solicitud)}
          />
        </div>

        <div className="form-group">
          <label>Tipo de pago:</label>
          <select
            name="tipo_pago"
            value={fallaData[solicitud.id_solicitud]?.tipo_pago || ""}
            onChange={e => handleChangeFalla(e, solicitud.id_solicitud)}
          >
            <option value="">Seleccione un tipo de pago</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Crédito">Crédito</option>
            <option value="Transferencia">Transferencia</option>
          </select>
        </div>

        <div className="form-group">
          <label>Costo:</label>
          <input
            type="number"
            name="costo"
            value={fallaData[solicitud.id_solicitud]?.costo || ""}
            onChange={e => handleChangeFalla(e, solicitud.id_solicitud)}
          />
        </div>

        <div className="form-group">
          <label>Observaciones:</label>
          <textarea
            name="observaciones"
            value={fallaData[solicitud.id_solicitud]?.observaciones || ""}
            onChange={e => handleChangeFalla(e, solicitud.id_solicitud)}
          ></textarea>
        </div>

        <div className="form-group">
          <label>Comprobante del que se realizo:</label>
          <input
            type="file"
            name="url_comprobante"
            accept="image/*,application/pdf"
            onChange={e => handleChangeFalla(e, solicitud.id_solicitud)}
            required
          />
        </div>

        <div className="form-group full-width-btn">
          <button type="submit" className="submit-btn">Registrar Falla</button>
        </div>
      </form>
    </div>
  );
}
