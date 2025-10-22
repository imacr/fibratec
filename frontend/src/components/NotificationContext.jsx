// NotificationContext.js
import React, { createContext, useState, useEffect } from "react";
import { API_URL } from "../config";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [pendientes, setPendientes] = useState(0);

  // Fetch inicial y actualización automática
  useEffect(() => {
    const fetchPendientes = async () => {
      try {
        const res = await fetch(`${API_URL}/solicitudes`);
        const data = await res.json();
        const pendientesCount = data.filter(s => s.estado === "pendiente").length;
        setPendientes(pendientesCount);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPendientes();
    const interval = setInterval(fetchPendientes, 10000); // refresca cada 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{ pendientes, setPendientes }}>
      {children}
    </NotificationContext.Provider>
  );
};
