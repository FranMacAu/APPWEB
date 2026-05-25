document.addEventListener("DOMContentLoaded", function() {
    
    // --- ESTADO DE AUTENTICACIÓN ---
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userEmail = sessionStorage.getItem('usuario');

    const loader = document.getElementById("loader-overlay");
    function showLoader() {
        if (loader) loader.classList.add("show");
    }
    function hideLoader() {
        if (loader) loader.classList.remove("show");
    }

// --- RENDERIZADO DEL NAVBAR (ahora dinámico)
const headerContainer = document.getElementById("main-header");

if (headerContainer && isLoggedIn) {
    async function cargarNavbar() {
        try {
            // Traemos las categorías del backend
            const response = await fetch('http://localhost:3000/categorias');
            const categorias = await response.json();

            // Mapeamos los datos del back al formato que espera renderNavbar
            const subLinksCategorias = categorias.map(cat => ({
                titulo: cat.nombre,
                href: `pages/productos.html?categoria=${cat.id}`
            }));

            // Armamos el array de navegación mezclando links fijos y dinámicos
            const navLinksDinamicos = [
                { titulo: "Inicio", href: "index.html" },
                { 
                    titulo: "Productos", 
                    href: "pages/productos.html",
                    subLinks: [
                        { titulo: "Todos los productos", href: "pages/productos.html" },
                        ...subLinksCategorias // Acá inyectamos las categorías de la base de datos
                    ]
                },
                { titulo: "Carrito", href: "pages/carrito.html" }
            ];

            // Se lo mandamos a tu componente
            headerContainer.innerHTML = renderNavbar(navLinksDinamicos);

        } catch (error) {
            console.error("Error al cargar categorías para el Navbar:", error);
            // Fallback: si se cae el back, mostramos un menú básico
            headerContainer.innerHTML = renderNavbar([{ titulo: "Inicio", href: "index.html" }]);
        }
    }
    
    cargarNavbar();
}

   // --- RENDERIZADO DE CARDS 
    const productsContainer = document.getElementById("product-grid");

    if (productsContainer) {
        if (isLoggedIn){
            async function cargarYRenderizarProductos() {
                try {
                    const URL_API = 'http://localhost:3000/productos';
                    
                    const response = await fetch(URL_API);
                    if (!response.ok) throw new Error(`Error HTTP! status: ${response.status}`);
                    
                    const productos = await response.json();
                    
                    // Lee los parámetros de la URL (?categoria=1)
                    const urlParams = new URLSearchParams(window.location.search);
                    const categoriaUrl = urlParams.get('categoria'); 
                    
                    let productosParaMostrar = [];
                    const esPaginaPrincipal = !window.location.pathname.includes("/pages/");

                    if (esPaginaPrincipal) {
                        // 1 = Plantas de Interior | 5 = Plantas de Exterior | 6 = Crasas y Suculentas
                        const categoriasHome = [1, 5, 6]; 
                        
                        categoriasHome.forEach(catId => {
                            const productosCategoria = productos.filter(p => p.id_categoria === catId).slice(0, 2); 
                            productosParaMostrar.push(...productosCategoria); 
                        });
                    } else if (categoriaUrl) {
                        // CAMBIO: Filtramos usando id_categoria como número entero
                        productosParaMostrar = productos.filter(p => p.id_categoria === parseInt(categoriaUrl));
                    } else {
                        // Si entran a productos.html sin parámetros, muestra todo el catálogo
                        productosParaMostrar = productos;
                    }
                    
                    // --- Renderizado usando el components.js actualizado ---
                    const allCardsHTML = productosParaMostrar.map(prod => renderProductCard(prod)).join("");
                    productsContainer.innerHTML = allCardsHTML;

                    // Activamos los botones +/- y Añadir
                    actualizarBotonesDeCantidad();
                    activarBotonesAgregarCarrito(productos);

                } catch (error) {
                    console.error("Error al cargar los productos desde el Backend:", error);
                    productsContainer.innerHTML = "<p>Error al cargar productos. Asegurate de tener el servidor corriendo.</p>";
                }
            }
            // Llamamos a la función para que se ejecute
            cargarYRenderizarProductos();
        } else {
            // Caso: Usuario no logueado
            const titleElement = document.querySelector(".featured-products h2");
            if (titleElement) {
                titleElement.textContent = "🔒 Contenido Protegido";
            }

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
            
            productsContainer.innerHTML = loginPromptHTML;
        }
    }
    // --- LÓGICA DE LOGIN 
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async function(event) {
            event.preventDefault(); 
            
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            showLoader(); 

            try {
                const response = await fetch('http://localhost:3000/usuarios/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const resultado = await response.json();

                if (response.ok) {
                    // Guardamos el estado y el email real que devolvió el back
                    localStorage.setItem('isLoggedIn', 'true');
                    sessionStorage.setItem('usuario', resultado.usuario.email);
                    window.location.href = "../index.html"; 
                } else {
                    alert(resultado.error); // Muestra "El email o la contraseña son incorrectos."
                    hideLoader();
                }

            } catch (error) {
                console.error("Error de red en el login:", error);
                alert("No se pudo conectar con el servidor para iniciar sesión.");
                hideLoader();
            }
        });
    }

    // --- LÓGICA DE LOGOUT
    document.addEventListener("click", function(event) {
        // Verificamos si el elemento clickeado es el botón de cerrar sesión
        if (event.target && event.target.id === "logoutBtn") {
            event.preventDefault();
            showLoader();

            setTimeout(() => {
                localStorage.removeItem('isLoggedIn');
                sessionStorage.removeItem('usuario'); // Limpiamos el email de la sesión
                
                // Redirección inteligente según dónde estemos
                const loginPath = window.location.pathname.includes("/pages/") ? "" : "pages/";
                window.location.href = `${loginPath}login.html`;
            }, 1000);
        }
    });

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
                // Si no quedan toasts, podemos quitar el contenedor
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
        const mensaje = `¡Agregaste ${cantidad} unidad(es) de "${producto.nombre}" al carrito!`;
        
        if (typeof showToast === "function") {
            showToast(mensaje, "success");
        } else {
            alert(mensaje);
        }
}
    // --- LÓGICA DE REGISTRO 
    const registroForm = document.getElementById("registroForm");
    if (registroForm) { 
        registroForm.addEventListener("submit", async function(event) {
            event.preventDefault(); 
            
            // Capturamos los campos
            const nombre = document.getElementById("nombre").value;
            const apellido = document.getElementById("apellido").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            // Validaciones del lado del cliente
            if (password.length < 8) {
                alert("Error: La contraseña debe tener al menos 8 caracteres.");
                return; 
            }

            if (password !== confirmPassword) {
                alert("Error: Las contraseñas no coinciden.");
                return; 
            }

            showLoader();
            
            try {
                const response = await fetch('http://localhost:3000/usuarios', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    // Enviamos el objeto completo al backend
                    body: JSON.stringify({ nombre, apellido, email, password })
                });

                const resultado = await response.json();

                if (response.ok) {
                    alert("¡Usuario creado con éxito! Ya podés iniciar sesión.");
                    registroForm.reset();
                    window.location.href = "/pages/login.html";  // redirige a login
                } else {
                    alert(resultado.error); 
                    hideLoader();
                }

            } catch (error) {
                console.error("Error de red al registrar:", error);
                alert("No se pudo conectar con el servidor para completar el registro.");
                hideLoader();
            }
        });
    }

    // --- página del carrito
    let cartItemsContainer = document.getElementById("cart-items-container");
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
        //  Finalizar Compra de manera asíncrona con el Back
        const btnFinalizar = document.getElementById("checkout-btn");
        if(btnFinalizar){
            btnFinalizar.addEventListener("click", async () => {
                const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
                
                if (carrito.length === 0) {
                    alert("Tu carrito está vacío.");
                    return;
                }

                if(confirm("¡Está seguro de finalizar tu compra? Tenemos mucha variedad de productos que podrían interesarle.")) {
                    showLoader(); // Mostramos el loader de espera

                    // Armamos el paquete de datos para el servidor
                    const datosCompra = {
                        usuarioEmail: sessionStorage.getItem('usuario') || "invitado@planteria.com",
                        productos: carrito // Mandamos el array completo del carrito
                    };

                    try {
                        // Enviamos la orden de compra al Backend via POST
                        const response = await fetch('http://localhost:3000/ventas', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(datosCompra)
                        });

                        const resultado = await response.json();

                        if (response.ok) {
                            alert(`Compra realizada con éxito! Orden N°: ${resultado.id_orden}`);
                            localStorage.removeItem('carrito'); // Vaciamos el carrito local
                            window.location.href = "../index.html"; // Volvemos al home
                        } else {
                            alert(`Error al procesar la compra: ${resultado.error}`);
                        }

                    } catch (error) {
                        console.error("Error de red al intentar comprar:", error);
                        alert("No se pudo conectar con el servidor para finalizar la compra.");
                    } finally {
                        hideLoader(); // Apagamos el loader pase lo que pase
                    }
                }
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

    
// --- LÓGICA DE CARRITO 
    
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

                // Guardar en LocalStorage
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
    const mensaje = `¡Agregaste ${cantidad} unidad(es) de "${producto.nombre}" al carrito!`;
    
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

    }

    function renderizarPaginaCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const container = document.getElementById("cart-items-container");
    const summary = document.getElementById("cart-summary");
    const totalSpan = document.getElementById("cart-total-price");

    if (carrito.length === 0) {
        container.innerHTML = '<p class="empty-cart-message">Tu carrito está vacío 🛒</p>' +
                               '<a href="productos.html" class="btn">Ver Productos Disponibles</a>';
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

        // AQUÍ LOS CAMBIOS: item.nombre e impedir bucle en el onerror
        return `
            <div class="cart-item">
                <img src="${imgPath}" alt="${item.nombre}" onerror="this.onerror=null; this.src='https://via.placeholder.com/150'">
                <div class="cart-item-info">
                    <h4>${item.nombre}</h4>
                    <p>Precio: $${item.precio}</p>
                    <p>Cantidad: <strong>${item.cantidad}</strong></p>
                </div>
                <div class="cart-item-price">$${subtotal}</div>
                <button class="cart-item-remove" onclick="eliminarDelCarrito(${item.id})">🗑️</button>
            </div>
        `;
    }).join("");

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
