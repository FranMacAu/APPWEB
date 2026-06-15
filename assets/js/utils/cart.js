// Lógica pura de persistencia del carrito
// utils/cart.js - Gestión de estado de carrito y sincronización de UI
import { showToast } from './ui.js';

export const getCarrito = () => JSON.parse(localStorage.getItem('carrito')) || [];
export const saveCarrito = (carrito) => localStorage.setItem('carrito', JSON.stringify(carrito));
export const clearCarrito = () => localStorage.removeItem('carrito');

// Función interna para actualizar el número del Navbar en tiempo real
export const actualizarBadgeNavbar = () => {
    const badges = document.querySelectorAll(".cart-count");
    const carrito = getCarrito();
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    badges.forEach(badge => {
        badge.textContent = `(${totalItems})`;
    });
};

export const agregarAlLocalStorage = (producto, cantidad) => {
    let carrito = getCarrito();
    const indice = carrito.findIndex(p => p.id === producto.id);
    
    if (indice !== -1) {
        carrito[indice].cantidad += cantidad;
    } else {
        carrito.push({ ...producto, cantidad: cantidad });
    }
    
    saveCarrito(carrito);
    actualizarBadgeNavbar(); // <-- Refrescamos Navbar
    showToast(`¡Agregaste ${cantidad} unidad(es) de "${producto.nombre}" al carrito!`, "success");
};

export const eliminarDelLocalStorage = (id) => {
    let carrito = getCarrito();
    
    // Buscamos en qué posición del array está el producto
    const indice = carrito.findIndex(item => item.id === id);
    
    if (indice !== -1) {
        if (carrito[indice].cantidad > 1) {
            // Si hay 2 o más, restamos 1 unidad
            carrito[indice].cantidad -= 1;
        } else {
            // Si queda solo 1 unidad, lo borramos definitivamente 
            carrito.splice(indice, 1);
        }
    }
    
    saveCarrito(carrito);
    actualizarBadgeNavbar(); // Actualiza el numerito con paréntesis al instante
    return carrito;
};