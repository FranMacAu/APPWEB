// Solo se carga en index.html y productos.html
import { getProductos } from '../api/productos.api.js';
import { agregarAlLocalStorage } from '../utils/cart.js';

const productsContainer = document.getElementById("product-grid");
const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

const inicializarCatalogo = async () => {
    if (!productsContainer) return;

    if (!isLoggedIn) {
        const titleElement = document.querySelector(".featured-products h2");
        if (titleElement) titleElement.textContent = "🔒 Contenido Protegido";
        productsContainer.innerHTML = `
            <div class="login-prompt-banner">
                <h3>Esta sección es solo para miembros.</h3>
                <p>Para ver nuestros productos, por favor inicia sesión o crea una cuenta.</p>
                <div class="login-prompt-buttons">
                    <a href="/pages/login.html" class="btn">Iniciar Sesión</a>
                    <a href="/pages/registro.html" class="btn btn-secondary">Registrarse</a>
                </div>
            </div>
        `;
        return;
    }

    try {
        const productos = await getProductos();
        const urlParams = new URLSearchParams(window.location.search);
        const categoriaUrl = urlParams.get('categoria');
        const esPaginaPrincipal = !window.location.pathname.includes("/pages/");
        
        let productosParaMostrar = [];

        if (esPaginaPrincipal) {
            const categoriasHome = [1, 5, 6]; 
            categoriasHome.forEach(catId => {
                const productosCategoria = productos.filter(p => p.id_categoria === catId).slice(0, 2); 
                productosParaMostrar.push(...productosCategoria); 
            });
        } else if (categoriaUrl) {
            productosParaMostrar = productos.filter(p => p.id_categoria === parseInt(categoriaUrl));
        } else {
            productosParaMostrar = productos;
        }

        productsContainer.innerHTML = productosParaMostrar.map(prod => renderProductCard(prod)).join("");
        
        actualizarBotonesDeCantidad();
        activarBotonesAgregarCarrito(productos);
    } catch (error) {
        productsContainer.innerHTML = "<p>Error al cargar productos.</p>";
    }
};

const actualizarBotonesDeCantidad = () => {
    document.querySelectorAll(".quantity-btn").forEach(button => {
        button.addEventListener("click", () => {
            const id = button.dataset.id;
            const action = button.dataset.action;
            const quantitySpan = document.getElementById(`quantity-${id}`);
            let val = parseInt(quantitySpan.textContent);
            
            if (action === "increase") val++;
            if (action === "decrease" && val > 1) val--;
            quantitySpan.textContent = val;
        });
    });
};

const activarBotonesAgregarCarrito = (listaProductos) => {
    document.querySelectorAll(".add-to-cart-btn").forEach(boton => {
        boton.addEventListener("click", (e) => {
            e.preventDefault();
            const id = parseInt(boton.dataset.id);
            const producto = listaProductos.find(p => p.id === id);
            const cantidadSpan = document.getElementById(`quantity-${id}`);
            let cantidad = 1;
            
            if (cantidadSpan) cantidad = parseInt(cantidadSpan.textContent);
            if (producto) agregarAlLocalStorage(producto, cantidad);
        });
    });
};

document.addEventListener("DOMContentLoaded", inicializarCatalogo);