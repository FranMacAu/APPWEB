document.addEventListener("DOMContentLoaded", function() {
    
    // --- 1. RENDERIZADO DEL NAVBAR 
    const headerContainer = document.getElementById("main-header");
    if (headerContainer) {
        // renderNavbar viene de components.js, navLinks viene de data.js
        headerContainer.innerHTML = renderNavbar(window.navLinks);
    }

    // --- 2. RENDERIZADO DE PRODUCTOS 
    const productsContainer = document.getElementById("product-grid");
    if (productsContainer) {
        // renderProductCard viene de components.js, productos viene de data.js
        const allCardsHTML = window.productos.map(prod => renderProductCard(prod)).join("");
        productsContainer.innerHTML = allCardsHTML;
    }

    // --- 3. LÓGICA DE LOGIN 
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function(event) {
            event.preventDefault(); 
            
            alert("¡Login exitoso! Redirigiendo...");
            
            window.location.href = "../index.html"; 
        });
    }

    // --- 4. LÓGICA DE LOGOUT (Cerrar Sesión) ---
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function(event) {
            event.preventDefault();
            alert("Cerrando sesión...");
            
            const pathPrefix = window.location.pathname.includes("/pages/") ? "" : "pages/";
            window.location.href = `${pathPrefix}login.html`;
        });
    }


    // --- Registro con validaciónes
    const registroForm = document.getElementById("registroForm");
    if (registroForm) { 
        registroForm.addEventListener("submit", function(event) {
            event.preventDefault(); // Siempre prevenimos el envío
            
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

    // --- 6. LÓGICA DE CANTIDAD (+/-) EN CARDS ---
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
});