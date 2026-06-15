// Script que debe cargarse en todas las páginas (Navbar, estado y Logout)
import { getCategorias } from '../api/productos.api.js';
import { showLoader } from '../utils/ui.js';

const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

const cargarNavbarDinámico = async () => {
    const headerContainer = document.getElementById("main-header");
    if (!headerContainer || !isLoggedIn) return;

    try {
        const categorias = await getCategorias();
        const subLinksCategorias = categorias.map(cat => ({
            titulo: cat.nombre,
            href: `pages/productos.html?categoria=${cat.id}`
        }));

        const navLinksDinamicos = [
            { titulo: "Inicio", href: "index.html" },
            { 
                titulo: "Productos", 
                href: "pages/productos.html",
                subLinks: [
                    { titulo: "Todos los productos", href: "pages/productos.html" },
                    ...subLinksCategorias
                ]
            },
            { titulo: "Carrito", href: "pages/carrito.html" }
        ];

        if (typeof renderNavbar === "function") {
            headerContainer.innerHTML = renderNavbar(navLinksDinamicos);
        }
    } catch (error) {
        if (typeof renderNavbar === "function") {
            headerContainer.innerHTML = renderNavbar([{ titulo: "Inicio", href: "index.html" }]);
        }
    }
};

document.addEventListener("click", (event) => {
    if (event.target && event.target.id === "logoutBtn") {
        event.preventDefault();
        showLoader();
        
        setTimeout(() => {
            // Limpiamos las variables de estado
            localStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('usuario');
            
            // Destruimos la credencial de seguridad (¡Fundamental!)
            localStorage.removeItem('token');
            
            // Vaciamos el carrito por privacidad
            localStorage.removeItem('carrito');

            // Redirigimos
            const loginPath = window.location.pathname.includes("/pages/") ? "" : "pages/";
            window.location.href = `${loginPath}login.html`;
        }, 1000);
    }
});

document.addEventListener("DOMContentLoaded", cargarNavbarDinámico);