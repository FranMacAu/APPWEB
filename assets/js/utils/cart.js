// Lógica pura de persistencia del carrito
import { showToast } from './ui.js';

export const getCarrito = () => JSON.parse(localStorage.getItem('carrito')) || [];

export const saveCarrito = (carrito) => localStorage.setItem('carrito', JSON.stringify(carrito));

export const clearCarrito = () => localStorage.removeItem('carrito');

export const agregarAlLocalStorage = (producto, cantidad) => {
    let carrito = getCarrito();
    const indice = carrito.findIndex(p => p.id === producto.id);
    
    if (indice !== -1) {
        carrito[indice].cantidad += cantidad;
    } else {
        carrito.push({ ...producto, cantidad: cantidad });
    }
    
    saveCarrito(carrito);
    showToast(`¡Agregaste ${cantidad} unidad(es) de "${producto.nombre}" al carrito!`, "success");
};

export const eliminarDelLocalStorage = (id) => {
    let carrito = getCarrito();
    carrito = carrito.filter(item => item.id !== id);
    saveCarrito(carrito);
    return carrito;
};