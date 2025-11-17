// NAVBAR 
function renderNavbar(linksArray) {
    // Detecta si estamos en /pages/ o no
    const logoPath = window.location.pathname.includes("/pages/") ? "../" : "";
    // Obtiene la ruta incluyendo los parámetros (categoría)
    const currentPath = window.location.pathname + window.location.search;

    const linksHTML = linksArray.map(link => {
        
        let isActive = false;
        let subLinksHTML = "";

        if (link.subLinks) {
            // si tiene subLinks, hace un dropdown 
            subLinksHTML = `
                <ul class="dropdown-menu">
                    ${link.subLinks.map(subLink => {
                        const fullSubLinkHref = `${logoPath}${subLink.href}`;
                        // Verificamos si este sub-link es el activo
                        if (currentPath.endsWith(subLink.href)) {
                            isActive = true; // Si un hijo está activo, el padre también
                        }
                        return `<li><a href="${fullSubLinkHref}">${subLink.titulo}</a></li>`;
                    }).join("")}
                </ul>
            `;
            
            // Verificamos si el link padre ("Productos Todos") está activo
            if (currentPath.endsWith(link.href)) {
                isActive = true;
            }

            const activeClass = isActive ? "active" : "";
            // Añadimos la clase 'dropdown-parent' al <li>
            return `
                <li class="dropdown-parent ${activeClass}">
                    <a href="${logoPath}${link.href}">${link.titulo}</a>
                    ${subLinksHTML}
                </li>
            `;
        } else {
            //  Si es un link normal
            if (currentPath.endsWith(link.href)) {
                isActive = true;
            }
            const activeClass = isActive ? "active" : "";
            return `<li class="${activeClass}"><a href="${logoPath}${link.href}">${link.titulo}</a></li>`;
        }
    }).join(""); 
    
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
                <li><a href="#" id="logoutBtn" class="logout-btn">Cerrar Sesión</a></li>
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