// Peticiones para generar órdenes
import { API_URL } from './config.js';

export const crearVenta = async (datosCompra) => {
    const token = localStorage.getItem('token'); // Obtenemos el token del navegador
    const response = await fetch(`${API_URL}/ventas`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`  //incluye token en el header
        },
        body: JSON.stringify(datosCompra)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al procesar la compra');
    return data;
};