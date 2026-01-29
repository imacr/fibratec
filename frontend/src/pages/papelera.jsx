    import { useEffect, useState } from "react";
    import Swal from "sweetalert2";
    import Modal from "../components/Modal";
    import { API_URL } from "../config";

    import "./Unidades.css";
    import "./Placas.css";
    import "./papelera.css";
    import Sucursales from "./sucursales";


    export default function Papelera() {
    const [activeTab, setActiveTab] = useState("usuarios");
    const [data, setData] = useState([]);

    const endpoints = {
        usuarios: "/usuarios/papelera",
        unidades: "/unidades/papelera",
        placas: "/placas/papelera",
        garantias: "/garantias/papelera",
        verificaciones: "/verificaciones/papelera",
        empresas: "/empresas/papelera",
        sucursales: "/sucursales/papelera"
    };

    const restaurarEndpoints = {
        usuarios: "/usuarios/restaurar",
        unidades: "/unidades/restaurar",
        placas: "/placas/restaurar",
        garantias: "/garantias/restaurar",
        verificaciones: "/verificaciones/restaurar",
        empresas: "/empresas/restaurar",
        sucursales: "/sucursales/restaurar"

    };

    // Columnas en orden correcto
    const columnas = {
        usuarios: [ "id_usuario",  "nombre","correo", "rol"],
        unidades: ["id_unidad", "cve", "marca", "modelo", "version", "clase"],
        placas: ["id_placa", "unidad", "placa", "folio"],
        garantias: ["id_garantia", "unidad","aseguradora", "no_poliza", "tipo_garantia", "vigencia"],
        verificaciones: ["id_verificacion","unidad", "ultima_verificacion"],
        empresas: ["id_empresa", "nombre_comercial", "direccion"],
        sucursales: ["id_sucursal", "nombre", "direccion"]
    };

    const fetchData = async (tab) => {
        try {
        const res = await fetch(`${API_URL}${endpoints[tab]}`);
        const json = await res.json();
        setData(json || []);
        } catch (err) {
        Swal.fire("Error", "No se pudieron cargar los datos de la papelera", "error");
        }
    };

    useEffect(() => {
        fetchData(activeTab);
    }, [activeTab]);

    const idMap = {
    usuarios: "id_usuario",
    unidades: "id_unidad",
    placas: "id_placa",
    garantias: "id_garantia",
    verificaciones: "id_verificacion",
    empresas: "id_empresa" ,
    sucursales: "id_sucursal"  
    };

    const handleRestaurar = async (item) => {
    const id = item[idMap[activeTab]]; // siempre el ID correcto
    try {
        await fetch(`${API_URL}${restaurarEndpoints[activeTab]}/${id}`, { method: "PATCH" });
        Swal.fire("Restaurado", "Registro restaurado correctamente", "success");
        fetchData(activeTab);
    } catch (err) {
        Swal.fire("Error", "No se pudo restaurar el registro", "error");
    }
    };

    return (
    <div className="papelera-container">
    <h1>Papelera</h1>

    {/* Tabs */}
    <div className="papelera-tabs">
        {Object.keys(endpoints).map((tab) => (
        <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? "active" : ""}
        >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
        ))}
    </div>

    {/* Tabla escritorio */}
    <div className="table-wrapper">
        <table className="elegant-table">
        <thead>
            <tr>
            {columnas[activeTab].map((key) => (
                <th key={key}>{key.replace(/_/g," ")}</th>
            ))}
            <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            {data.map((item) => (
            <tr key={item.id_usuario || item.id_unidad || item.id_placa || item.id_garantia || item.id_verificacion|| item.id_empresa}>
                {columnas[activeTab].map((key) => (
                <td key={key}>{item[key]?.toString()}</td>
                ))}
                <td>
                <button
                    className="btn-restaurar"
                    onClick={() => handleRestaurar(item)}
                    >
                    Restaurar
                    </button>

                </td>
            </tr>
            ))}
        </tbody>
        </table>
    </div>

    {/* Cards móviles */}
    <div className="papelera-cards">
        {data.map((item) => (
        <div key={item.id_usuario || item.id_unidad || item.id_placa || item.id_garantia || item.id_verificacion} className="papelera-card">
            {columnas[activeTab].map((key) => (
            <p key={key}><strong>{key.replace(/_/g," ")}:</strong> {item[key]}</p>
            ))}
            <button
            className="papelera-btn-restaurar"
            onClick={() => handleRestaurar(
                item.id_usuario || item.id_unidad || item.id_placa || item.id_garantia || item.id_verificacion
            )}
            >
            Restaurar
            </button>
        </div>
        ))}
    </div>
    </div>

    );
    }
