import React, { useState } from "react";
import Modal from "../components/Modal";
import { BASE_URL } from "../config"; // Ajusta la ruta según la ubicación del archivo

const RegistrarUsuario = ({ show, onClose, onCreate }) => {
  const API_URL = `${BASE_URL}/api/usuarios`;
  const [formData, setFormData] = useState({
    nombre: "",
    usuario: "",
    contraseña: "",
    correo: "",
    rol: "usuario",
    estado: "activo"
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} - ${errorText}`);
      }

      const newUser = await response.json();
      onCreate(newUser); // Actualiza lista de usuarios
      onClose(); // Cierra modal
      setFormData({
        nombre: "",
        usuario: "",
        contraseña: "",
        correo: "",
        rol: "usuario",
        estado: "activo"
      });
      const data = await fetch(API_URL).then(r => r.json());
      
          Swal.fire({
            title: '¡Éxito!',
            text: 'Usuario agregado correctamente',
            icon: 'success',
            iconColor: '#1b952fff',
            confirmButtonColor: '#28a745'
          });
      
    } catch (err) {
      console.error(err);
      alert("Error al registrar usuario: " + err.message);
    }
  };

  if (!show) return null;

  return (
    <Modal onClose={onClose}>
      <h2>Registrar Nuevo Usuario</h2>
      <form onSubmit={handleSubmit} className="modal-form">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre completo"
          value={formData.nombre}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="usuario"
          placeholder="Usuario"
          value={formData.usuario}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="contraseña"
          placeholder="Contraseña"
          value={formData.contraseña}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="correo"
          placeholder="Correo electrónico"
          value={formData.correo}
          onChange={handleChange}
          required
        />
        <select name="rol" value={formData.rol} onChange={handleChange}>
          <option value="admin">Admin</option>
          <option value="usuario">Usuario</option>
          <option value="gerente">Gerente</option>
        </select>
        <select name="estado" value={formData.estado} onChange={handleChange}>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
        <div className="modal-actions">
          <button type="submit" className="btn-guardar">Registrar</button>
          <button type="button" className="btn-cancelar" onClick={onClose}>Cancelar</button>
        </div>
      </form>
    </Modal>
  );
};

export default RegistrarUsuario;
