import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { API_URL } from "../config"; // Ajusta la ruta según la ubicación del archivo

const Crudgarantias = ({ onClose, onCreate, garantia }) => {
  const [formData, setFormData] = useState({
    id_unidad: '',
    aseguradora: '',
    tipo_garantia: '',
    no_poliza: '',
    suma_asegurada: '',
    inicio_vigencia: '',
    vigencia: '',
    prima: ''
  });
  const [archivo, setArchivo] = useState(null);

  // Si recibimos garantía para editar, rellenamos el formulario
    useEffect(() => {
    if (garantia) {
        const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Mes de 0-11
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
        };

        setFormData({
        id_unidad: garantia.id_unidad || '',
        aseguradora: garantia.aseguradora || '',
        tipo_garantia: garantia.tipo_garantia || '',
        no_poliza: garantia.no_poliza || '',
        suma_asegurada: garantia.suma_asegurada || '',
        inicio_vigencia: formatDate(garantia.inicio_vigencia),
        vigencia: formatDate(garantia.vigencia),
        prima: garantia.prima || ''
        });
    }
    }, [garantia]);


  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setArchivo(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    for (let key in formData) data.append(key, formData[key]);
    if (archivo) data.append('archivo', archivo);

    try {
      let url = `${API_URL}/api/garantias`;
      let method = 'POST';

      // Si existe garantia, hacemos PUT para actualizar
      if (garantia && garantia.id_garantia) {
        url += `/${garantia.id_garantia}`;
        method = 'PUT';
      }

      const res = await fetch(url, { method, body: data });
      const result = await res.json();

      if (res.ok) {
        // Combinar la respuesta con id_garantia (útil si se crea)
        const garantiaActualizada = garantia && garantia.id_garantia
          ? { ...formData, id_garantia: garantia.id_garantia, url_poliza: result.url_poliza }
          : { ...result, ...formData };

        onCreate(garantiaActualizada); // agrega o actualiza en tabla
        onClose();
        
      } else {
        alert(result.error || "Error al procesar la garantía");
      }
    } catch (err) {
      console.error(err);
      alert('Error al enviar la garantía');
    }
  };

  return (
    <Modal onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <h2>{garantia ? 'Editar Garantía' : 'Registrar Garantía'}</h2>
        <input name="id_unidad" placeholder="ID Unidad" value={formData.id_unidad} onChange={handleChange} required />
        <input name="aseguradora" placeholder="Aseguradora" value={formData.aseguradora} onChange={handleChange} required />
        <input name="tipo_garantia" placeholder="Tipo Garantía" value={formData.tipo_garantia} onChange={handleChange} required />
        <input name="no_poliza" placeholder="Número Póliza" value={formData.no_poliza} onChange={handleChange} required />
        <input type="number" name="suma_asegurada" placeholder="Suma Asegurada" value={formData.suma_asegurada} onChange={handleChange} required />
        <input type="date" name="inicio_vigencia" value={formData.inicio_vigencia} onChange={handleChange} required />
        <input type="date" name="vigencia" value={formData.vigencia} onChange={handleChange} required />
        <input type="number" name="prima" placeholder="Prima" value={formData.prima} onChange={handleChange} required />
        <input type="file" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
        <button type="submit">{garantia ? 'Actualizar Garantía' : 'Agregar Garantía'}</button>
        <button type="button" onClick={onClose}>Cancelar</button>
      </form>
    </Modal>
  );
};

export default Crudgarantias;
