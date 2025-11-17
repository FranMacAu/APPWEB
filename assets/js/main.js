document.addEventListener("DOMContentLoaded", function() {
    
    // --- ESTADO DE AUTENTICACIÓN ---
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    // --- RENDERIZADO DEL NAVBAR 
    const headerContainer = document.getElementById("main-header");
    if (headerContainer && isLoggedIn) {
        // renderNavbar viene de components.js, navLinks viene de data.js
        headerContainer.innerHTML = renderNavbar(window.navLinks);
    }

    // --- RENDERIZADO DE CARDS 
    const productsContainer = document.getElementById("product-grid");

    if (productsContainer) {
        if (isLoggedIn){
            async function cargarYRenderizarProductos() {
            try {
                // Determina la ruta correcta según ubicación actual
                const pathPrefix = window.location.pathname.includes("/pages/") ? "../" : "";
                const jsonPath = `${pathPrefix}data/productos.json`;

                // trae el JSON
                const response = await fetch(jsonPath);
                
                // Verificamos si la petición fue exitosa
                if (!response.ok) {
                    throw new Error(`Error HTTP! status: ${response.status}`);
                }

                // Convertimos la respuesta a JSON
                const productos = await response.json();

                // Leemos los parámetros de la URL
                const urlParams = new URLSearchParams(window.location.search);
                const categoria = urlParams.get('categoria'); 
                let productosParaMostrar = [];
                const esPaginaPrincipal = !window.location.pathname.includes("/pages/");

                if (esPaginaPrincipal) {
                    const categorias = ["Interior", "Exterior", "Crasas"];
                    categorias.forEach(cat => {
                        const productosCategoria = productos
                            .filter(p => p.categoria === cat)
                            .slice(0, 2); 
                        productosParaMostrar.push(...productosCategoria); 
                    });
                }else if (categoria) {
                    // Si hay una categoría en la URL
                    productosParaMostrar = productos.filter(p => p.categoria === categoria);
                } else {
                    // sin categoría
                    productosParaMostrar = productos;
                }
                
                // Ya con los productos, renderizamos las cards
                const allCardsHTML = productos.map(prod => renderProductCard(prod)).join("");
                productsContainer.innerHTML = allCardsHTML;

                // ahora metemos la lógica de los botes +-
                actualizarBotonesDeCantidad();

            } catch (error) {
                console.error("Error al cargar los productos:", error);
                productsContainer.innerHTML = "<p>Error al cargar productos. Intente más tarde.</p>";
            }
        }
    
        
        // Llamamos a la función para que se ejecute
        cargarYRenderizarProductos();
        }else {

            // no está logueado
            const titleElement = document.querySelector(".featured-products h2");
            if (titleElement) {
                titleElement.textContent = "🔒 Contenido Protegido";
            }

            // banner
            const loginPromptHTML = `
                <div class="login-prompt-banner">
                    <h3>Esta sección es solo para miembros.</h3>
                    <p>Para ver nuestros productos, por favor inicia sesión o crea una cuenta.</p>
                    <div class="login-prompt-buttons">
                        <a href="login.html" class="btn">Iniciar Sesión</a>
                        <a href="registro.html" class="btn btn-secondary">Registrarse</a>
                    </div>
                </div>
            `;
            
            // lo inyectamos en el contenedor de la grilla
            productsContainer.innerHTML = loginPromptHTML;
        }
        
    }
    // --- LÓGICA DE LOGIN 
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function(event) {
            event.preventDefault(); // no envía para que no dé error de página no encontrada y poder seguir navegando
            
            alert("¡Login exitoso! Redirigiendo...");
            localStorage.setItem('isLoggedIn', 'true'); //guardamos estado de login
            window.location.href = "../index.html"; 
        });
    }

    // --- LÓGICA DE LOGOUT
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function(event) {
            event.preventDefault();
            alert("Cerrando sesión...");
            localStorage.removeItem('isLoggedIn');
            const pathPrefix = window.location.pathname.includes("/pages/") ? "" : "pages/";
            window.location.href = `${pathPrefix}login.html`;
        });
    }

    // --- LÓGICA DE CANTIDAD (+/-) EN CARDS 
    function actualizarBotonesDeCantidad() {
        const quantityButtons = document.querySelectorAll(".quantity-btn");
        quantityButtons.forEach(button => {
            button.addEventListener("click", function() {
                const id = button.dataset.id;
                const action = button.dataset.action; // +- producto
                const quantitySpan = document.getElementById(`quantity-${id}`);
                
                let val = parseInt(quantitySpan.textContent);
                if (action === "increase") val++;
                if (action === "decrease" && val > 1) val--;
                
                quantitySpan.textContent = val;
            });
        });
    }

    // --- Registro con validaciónes
    const registroForm = document.getElementById("registroForm");
    if (registroForm) { 
        registroForm.addEventListener("submit", function(event) {
            event.preventDefault(); // no envía para que no dé error de página no encontrada y poder seguir navegando
            
            // inputs
            const passwordInput = document.getElementById("password");
            const confirmPasswordInput = document.getElementById("confirmPassword");
            
            // Obtener sus valores
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            // Valicadiones
            
            if (password.length < 8) {
                alert("Error: La contraseña debe tener al menos 8 caracteres.");
                return; 
            }

            if (password !== confirmPassword) {
                alert("Error: Las contraseñas no coinciden.");
                return; 
            }

            alert("¡Registro exitoso!");
            
            window.location.href = "login.html"; 
            
            // registroForm.reset();
        });
    }

    
});