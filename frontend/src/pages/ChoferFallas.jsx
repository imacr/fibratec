import React from "react";
import SolicitudForm from "../components/SolicitudForm";
import ListaSolicitudes from "../components/Lista_solicitudeschofer";

export default function ChoferFalla({ idChofer }) {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Panel de Falla Mecánica</h2>

      {/* Primer paso: enviar solicitud */}
      <SolicitudForm idChofer={idChofer} />

      {/* Segundo paso: registrar falla solo si está aprobada */}
    {/*<RegistroFalla idChofer={idChofer} />*/}
      

      {/* Opcional: si quieres mostrar también las solicitudes como lista */}
    </div>
  );
}
