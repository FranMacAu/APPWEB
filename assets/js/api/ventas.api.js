// Peticiones para generar órdenes
import { API_URL } from './config.js';

export const crearVenta = async (datosCompra) => {
    const response = await fetch(`${API_URL}/ventas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosCompra)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al procesar la compra');
    return data;
};