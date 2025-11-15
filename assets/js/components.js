// NAVBAR

function renderNavbar(linksArray) {
    const linksHTML = linksArray.map(link => {
        const logoPath = window.location.pathname.includes("/pages/") ? "../" : "";
        
        const isActive = window.location.pathname.endsWith(link.href.replace("../", "").replace("pages/", ""));
        const activeClass = isActive ? "active" : ""; 

        return `<li><a href="${logoPath}${link.href}" class="${activeClass}">${link.titulo}</a></li>`;
    }).join(""); 

    // logout
    const logoPath = window.location.pathname.includes("/pages/") ? "../" : "";
    
    // header
    return `
        <a href="${logoPath}index.html" class="logo-container">
            <h1>
              La Plantería 
              <img src="${logoPath}assets/img/icono_planta.png" alt="Icono" class="header-logo">
            </h1>
        </a>
        <nav>
            <ul>
                ${linksHTML}
                <!-- Añadimos el link de Logout -->
                <li><a href="#" id="logoutBtn">Cerrar Sesión</a></li>
            </ul>
        </nav>
    `;
}

// CARD
function renderProductCard(producto) {
    return `
        <div class="product-card">
            <img src="${producto.imagen}" alt="${producto.titulo}">
            <div class="product-card-content">
                <h3>${producto.titulo}</h3>
                <p>${producto.descripcion}</p>
                <p class="price">$${producto.precio}</p>
                
                <!-- Controles de cantidad -->
                <div class="quantity-controls">
                    <button class="quantity-btn" data-id="${producto.id}" data-action="decrease">-</button>
                    <span id="quantity-${producto.id}">1</span>
                    <button class="quantity-btn" data-id="${producto.id}" data-action="increase">+</button>
                </div>

                <a href="#" class="btn">Añadir al carrito</a>
            </div>
        </div>
    `;
}