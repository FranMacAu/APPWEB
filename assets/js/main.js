document.addEventListener("DOMContentLoaded", function() {
    
    // --- ESTADO DE AUTENTICACIÓN ---
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userEmail = sessionStorage.getItem('usuario');

    const loader = document.getElementById("loader-overlay");
    function showLoader() {
        if (loader) loader.classList.add("show");
    }
    function hideLoader() {
        // (Aunque no la usamos mucho, es bueno tenerla)
        if (loader) loader.classList.remove("show");
    }

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
                    const pathPrefix = window.location.pathname.includes("/pages/") ? "../" : "";
                    const jsonPath = `${pathPrefix}data/productos.json`;
                    
                    const response = await fetch(jsonPath);
                    if (!response.ok) throw new Error(`Error HTTP! status: ${response.status}`);
                    
                    const productos = await response.json();
                    
                    // filtrado de categorías
                    // lee los parámetros de la URL
                    const urlParams = new URLSearchParams(window.location.search);
                    const categoria = urlParams.get('categoria'); 
                    
                    let productosParaMostrar = [];
                    const esPaginaPrincipal = !window.location.pathname.includes("/pages/");

                    if (esPaginaPrincipal) {
                        // Lógica para el Home (2 por cat)
                        const categorias = ["Interior", "Exterior", "Crasas"];
                        categorias.forEach(cat => {
                            const productosCategoria = productos.filter(p => p.categoria === cat).slice(0, 2); 
                            productosParaMostrar.push(...productosCategoria); 
                        });
                    } else if (categoria) {
                        //Si hay una categoría en la URL, filtramos
                        productosParaMostrar = productos.filter(p => p.categoria === categoria);
                    } else {
                        // sin categoría
                        productosParaMostrar = productos;
                    }
                    
                    // --- Renderizamos solo los productos filtrados ---
                    const allCardsHTML = productosParaMostrar.map(prod => renderProductCard(prod)).join("");
                    productsContainer.innerHTML = allCardsHTML;

                    // Activamos los botones +/- y Añadir
                    actualizarBotonesDeCantidad();
                    activarBotonesAgregarCarrito(productos);

                } catch (error) {
                    console.error("Error al cargar los productos:", error);
                    productsContainer.innerHTML = "<p>Error al cargar productos.</p>";
                }
        }// Llamamos a la función para que se ejecute
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
                        <a href="/pages/login.html" class="btn">Iniciar Sesión</a>
                        <a href="/pages/registro.html" class="btn btn-secondary">Registrarse</a>
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
            event.preventDefault(); 
            
            showLoader(); 
            setTimeout(() => {
                localStorage.setItem('isLoggedIn', 'true');
                window.location.href = "../index.html"; 
            }, 1500); // 1.5 segundos de espera
        });
    }

    // --- LÓGICA DE LOGOUT
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function(event) {
            event.preventDefault();
            showLoader();

            // 2. Simulamos la espera
            setTimeout(() => {
                // 3. Hacemos la acción
                localStorage.removeItem('isLoggedIn');
                const loginPath = window.location.pathname.includes("/pages/") ? "" : "pages/";
                window.location.href = `${loginPath}login.html`;
            }, 1000); // 1 segundo
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

    // Toast notification (no-blocking) — muestra mensajes breves sin requerir "Aceptar"
    function showToast(message, type = "info", duration = 3000) {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'toast-message';
        if (type === 'success') toast.classList.add('success');
        if (type === 'error') toast.classList.add('error');
        toast.textContent = message;

        container.appendChild(toast);

        // Forzar reflow para activar transición
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // El mensaje desaparece automáticamente
        setTimeout(() => {
            toast.classList.remove('show');
            // Remover del DOM después de la transición
            toast.addEventListener('transitionend', () => {
                toast.remove();
                // Si no quedan toasts, podemos quitar el contenedor (opcional)
                if (container && container.children.length === 0) container.remove();
            });
        }, duration);
    }

    // Agregar al Carrito
    function activarBotonesAgregarCarrito(listaProductos) {
        const botones = document.querySelectorAll(".add-to-cart-btn");
        
        botones.forEach(boton => {
            boton.addEventListener("click", (e) => {
                e.preventDefault();
                
                // Identificar qué producto es
                const id = parseInt(boton.dataset.id);
                const producto = listaProductos.find(p => p.id === id);
                
                // Identificar la cantidad seleccionada
                const cantidadSpan = document.getElementById(`quantity-${id}`);
                const cantidad = parseInt(cantidadSpan.textContent);

                // Guardar en LocalStorage 
                agregarAlLocalStorage(producto, cantidad);
            });
        });
    }

    function agregarAlLocalStorage(producto, cantidad) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    // Verificamos si el producto ya estaba para no duplicarlo
    const indice = carrito.findIndex(p => p.id === producto.id);
    
    if (indice !== -1) {
        carrito[indice].cantidad += cantidad; // Sumamos cantidad
    } else {
        // Agregamos el producto nuevo con su cantidad
        carrito.push({ ...producto, cantidad: cantidad });
    }
    
    // Guardamos de vuelta en el navegador
    localStorage.setItem('carrito', JSON.stringify(carrito));

    // --- AQUÍ ESTÁ LA MODIFICACIÓN ---
    // Usamos showToast si existe, o alert como fallback
    const mensaje = `¡Agregaste ${cantidad} unidad(es) de "${producto.titulo}" al carrito!`;
    
    if (typeof showToast === "function") {
        showToast(mensaje, "success");
    } else {
        alert(mensaje);
    }
}

    // --- Registro con validaciónes
    const registroForm = document.getElementById("registroForm");
    if (registroForm) { 
        registroForm.addEventListener("submit", function(event) {
            event.preventDefault(); // no envía para que no dé error de página no encontrada y poder seguir navegando
            try{
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

                showLoader();
                
                setTimeout(() => {
                    registroForm.reset();
                    window.location.href = "/pages/login.html"; 
                }, 2000); // 2 segundos

            } catch (error) {
                console.error("Falló la validación:", error);
                hideLoader(); // Si la validación falla, ocultamos el loader
            }
            
            
        
            // registroForm.reset();
        });
    }

    // --- página del carrito
     cartItemsContainer = document.getElementById("cart-items-container");
    if (cartItemsContainer) {
        renderizarCarrito();

        // Botón Vaciar
        const clearCartBtn = document.getElementById("clear-cart-btn");
        if (clearCartBtn) {
            clearCartBtn.addEventListener("click", () => {
                if (confirm("¿Estás seguro de vaciar el carrito?")) {
                    localStorage.removeItem('carrito');
                    renderizarCarrito();
                }
            });
        }
        // Botón Finalizar Compra
        const checkoutBtn = document.getElementById("checkout-btn");
        if (checkoutBtn) {
            checkoutBtn.addEventListener("click", () => {
                alert("¡Gracias por tu compra!");
                localStorage.removeItem('carrito');
                // Redirección absoluta al inicio
                window.location.href = "/";
            });
        }
    }

        function renderizarCarrito() {
            const container = document.getElementById("cart-items-container");
            const summary = document.getElementById("cart-summary");
            const totalSpan = document.getElementById("cart-total-price");
            
            let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

            if (carrito.length === 0) {
                container.innerHTML = '<p class="empty-cart-message">Tu carrito está vacío.</p>';
                if(totalSpan) totalSpan.textContent = "$0";
                if (summary) summary.classList.add("hidden");
                if (totalSpan) totalSpan.textContent = "$0";
                return;
            }
            if (totalSpan) totalSpan.textContent = "$0";

            if (summary) summary.classList.remove("hidden");
            
            let total = 0;
            
            container.innerHTML = carrito.map(item => {
                const subtotal = item.precio * item.cantidad;
                total += subtotal;
                // Ruta de imagen corregida para que funcione desde /pages/
                const imagePath = `../assets/img/${item.imagen}`;

                return `
                    <div class="cart-item">
                        <img src="${imagePath}" alt="${item.titulo}" onerror="this.src='https://via.placeholder.com/80'">
                        <div class="cart-item-info">
                            <h4>${item.titulo}</h4>
                            <p>Precio unitario: $${item.precio}</p>
                            <p>Cantidad: <strong>${item.cantidad}</strong></p>
                        </div>
                        <div class="cart-item-price">$${subtotal}</div>
                        <button class="cart-item-remove" onclick="eliminarDelCarrito(${item.id})">🗑️</button>
                </div>
            `;
        }).join("");

        
    }

    //función global
    window.eliminarDelCarrito = function(id) {
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        carrito = carrito.filter(item => item.id !== id);
        localStorage.setItem('carrito', JSON.stringify(carrito));
        renderizarCarrito();
    };

    
// --- LÓGICA DE CARRITO DE COMPRAS
    
    function activarBotonesAgregarCarrito(listaProductos) {
        const botones = document.querySelectorAll(".add-to-cart-btn");
        
        botones.forEach(boton => {
            boton.addEventListener("click", (e) => {
                e.preventDefault();
                
                // Identificar producto
                const id = parseInt(boton.dataset.id);
                const producto = listaProductos.find(p => p.id === id);
                
                // Buscamos el span con id quantity-{id}
                const cantidadSpan = document.getElementById(`quantity-${id}`);
                let cantidad = 1; // Valor por defecto
                if (cantidadSpan) {
                     cantidad = parseInt(cantidadSpan.textContent);
                }

                // 3. Guardar en LocalStorage
                if (producto) {
                    agregarAlLocalStorage(producto, cantidad);
                }
            });
        });
    }

    function agregarAlLocalStorage(producto, cantidad) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    // Verificamos si el producto ya estaba para no duplicarlo
    const indice = carrito.findIndex(p => p.id === producto.id);
    
    if (indice !== -1) {
        carrito[indice].cantidad += cantidad; // Sumamos cantidad
    } else {
        // Agregamos el producto nuevo con su cantidad
        carrito.push({ ...producto, cantidad: cantidad });
    }
    
    // Guardamos de vuelta en el navegador
    localStorage.setItem('carrito', JSON.stringify(carrito));

    // Usamos showToast si existe, o alert como fallback
    const mensaje = `¡Agregaste ${cantidad} unidad(es) de "${producto.titulo}" al carrito!`;
    
    if (typeof showToast === "function") {
        showToast(mensaje, "success");
    } else {
        alert(mensaje);
    }
}

    // CARRITO.HTML
    const carritoContainer = document.getElementById("cart-items-container");
    
    if (carritoContainer) {
        // Si estamos en la página del carrito, dibujamos los items
        renderizarPaginaCarrito();

        // Vaciar
        const btnVaciar = document.getElementById("clear-cart-btn");
        if(btnVaciar){
             btnVaciar.addEventListener("click", () => {
                if(confirm("¿Vaciar carrito?")) {
                    localStorage.removeItem('carrito');
                    renderizarPaginaCarrito();
                }
            });
        }

        //  Finalizar
        const btnFinalizar = document.getElementById("checkout-btn");
        if(btnFinalizar){
            btnFinalizar.addEventListener("click", () => {
                alert("¡Compra realizada con éxito!");
                localStorage.removeItem('carrito');
                window.location.href = "../index.html";
            });
        }
    }

    function renderizarPaginaCarrito() {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const container = document.getElementById("cart-items-container");
        const summary = document.getElementById("cart-summary");
        const totalSpan = document.getElementById("cart-total-price");

        // carrito vacío
        if (carrito.length === 0) {
            container.innerHTML = '<p class="empty-cart-message">Tu carrito está vacío 🛒</p>' +
                                   '<a href="productos.html" class="btn">Ver Productos Disponibles</a>';
            
            // Forzamos  $0
            if (totalSpan) totalSpan.textContent = "$0";
            
            // Ocultamos el resumen
            if (summary) summary.classList.add("hidden");
            return;
        }

        // si hay productos
        if (summary) summary.classList.remove("hidden");
        
        let totalAcumulado = 0;

        container.innerHTML = carrito.map(item => {
            const subtotal = item.precio * item.cantidad;
            totalAcumulado += subtotal;
            
            const imgPath = `../img/${item.imagen}`;

            return `
                <div class="cart-item">
                    <img src="${imgPath}" alt="${item.titulo}" onerror="this.src='https://via.placeholder.com/80'">
                    <div class="cart-item-info">
                        <h4>${item.titulo}</h4>
                        <p>Precio: $${item.precio}</p>
                        <p>Cantidad: <strong>${item.cantidad}</strong></p>
                    </div>
                    <div class="cart-item-price">$${subtotal}</div>
                    <button class="cart-item-remove" onclick="eliminarDelCarrito(${item.id})">🗑️</button>
                </div>
            `;
        }).join("");

        // 3. ACTUALIZAR TOTAL (¡Esto faltaba en tu código!)
        if (totalSpan) totalSpan.textContent = `$${totalAcumulado}`;
    }

    // Función global para poder llamarla desde el onclick del HTML
    window.eliminarDelCarrito = function(id) {
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        carrito = carrito.filter(item => item.id !== id);
        localStorage.setItem('carrito', JSON.stringify(carrito));
        renderizarPaginaCarrito(); // Volver a dibujar
    };
});
