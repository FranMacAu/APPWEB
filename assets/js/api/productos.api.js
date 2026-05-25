// Peticiones relacionadas al catálogo
import { API_URL } from './config.js';

export const getCategorias = async () => {
    const response = await fetch(`${API_URL}/categorias`);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
};

export const getProductos = async () => {
    const response = await fetch(`${API_URL}/productos`);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
};