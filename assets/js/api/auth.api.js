// Peticiones de login y registro
import { API_URL } from './config.js';

export const loginUsuario = async (credenciales) => {
    const response = await fetch(`${API_URL}/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credenciales)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error en login');
    return data;
};

export const registrarUsuario = async (datosUsuario) => {
    const response = await fetch(`${API_URL}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosUsuario)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error en registro');
    return data;
};