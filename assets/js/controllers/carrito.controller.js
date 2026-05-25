// Lógica exclusiva de carrito.html
import { crearVenta } from '../api/ventas.api.js';
import { getCarrito, clearCarrito, eliminarDelLocalStorage } from '../utils/cart.js';
import { showLoader, hideLoader } from '../utils/ui.js';

const container = document.getElementById("cart-items-container");
const summary = document.getElementById("cart-summary");
const totalSpan = document.getElementById("cart-total-price");

const renderizarPaginaCarrito = () => {
    if (!container) return;
    const carrito = getCarrito();

    if (carrito.length === 0) {
        container.innerHTML = '<p class="empty-cart-message">Tu carrito está vacío 🛒</p><a href="productos.html" class="btn">Ver Productos Disponibles</a>';
        if (totalSpan) totalSpan.textContent = "$0";
        if (summary) summary.classList.add("hidden");
        return;
    }

    if (summary) summary.classList.remove("hidden");
    let totalAcumulado = 0;

    container.innerHTML = carrito.map(item => {
        const subtotal = item.precio * item.cantidad;
        totalAcumulado += subtotal;
        const imgPath = `http://localhost:3000${item.imagen}`;

        return `
            <div class="cart-item">
                <img src="${imgPath}" alt="${item.nombre}" onerror="this.onerror=null; this.src='https://via.placeholder.com/150'">
                <div class="cart-item-info">
                    <h4>${item.nombre}</h4>
                    <p>Precio: $${item.precio}</p>
                    <p>Cantidad: <strong>${item.cantidad}</strong></p>
                </div>
                <div class="cart-item-price">$${subtotal}</div>
                <button class="cart-item-remove" data-id="${item.id}">🗑️</button>
            </div>
        `;
    }).join("");

    if (totalSpan) totalSpan.textContent = `$${totalAcumulado}`;
    
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            eliminarDelLocalStorage(id);
            renderizarPaginaCarrito();
        });
    });
};

const btnVaciar = document.getElementById("clear-cart-btn");
if (btnVaciar) {
    btnVaciar.addEventListener("click", () => {
        if (confirm("¿Estás seguro de vaciar el carrito?")) {
            clearCarrito();
            renderizarPaginaCarrito();
        }
    });
}

const btnFinalizar = document.getElementById("checkout-btn");
if (btnFinalizar) {
    btnFinalizar.addEventListener("click", async () => {
        const carrito = getCarrito();
        if (carrito.length === 0) return alert("Tu carrito está vacío.");

        if (confirm("¿Estás seguro de finalizar tu compra?")) {
            showLoader();
            try {
                const datosCompra = {
                    usuarioEmail: sessionStorage.getItem('usuario') || "invitado@planteria.com",
                    productos: carrito
                };
                const resultado = await crearVenta(datosCompra);
                alert(`¡Compra realizada con éxito! Orden N°: ${resultado.id_orden}`);
                clearCarrito();
                window.location.href = "../index.html";
            } catch (error) {
                alert(error.message);
            } finally {
                hideLoader();
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", renderizarPaginaCarrito);