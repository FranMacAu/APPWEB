// NAVBAR
function renderNavbar(linksArray) {
    const logoPath = window.location.pathname.includes("/pages/") ? "../" : "";
    const currentPath = window.location.pathname + window.location.search;

    // Calculamos el total de unidades en el carrito para el renderizado inicial
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);

    const linksHTML = linksArray.map(link => {
        let isActive = false;
        let subLinksHTML = ""; 

        if (link.subLinks) {
            subLinksHTML = `
                <ul class="dropdown-menu">
                    ${link.subLinks.map(subLink => {
                        const fullSubLinkHref = `${logoPath}${subLink.href}`;
                        if (currentPath.endsWith(subLink.href)) isActive = true;
                        return `<li><a href="${fullSubLinkHref}">${subLink.titulo}</a></li>`;
                    }).join("")}
                </ul>
            `;
            
            if (currentPath.endsWith(link.href)) isActive = true;
            const activeClass = isActive ? "active" : "";
            return `
                <li class="dropdown-parent ${activeClass}">
                    <a href="${logoPath}${link.href}">${link.titulo}</a>
                    ${subLinksHTML}
                </li>
            `;
        } else {
            if (currentPath.endsWith(link.href)) isActive = true;
            const activeClass = isActive ? "active" : "";
            
            // Inyectamos el badge dinámico si el link es el Carrito
            let textoLink = link.titulo;
            if (link.titulo === "Carrito") {
                textoLink = `Carrito <span class="cart-count">(${totalItems})</span>`;
            }

            return `<li class="${activeClass}"><a href="${logoPath}${link.href}">${textoLink}</a></li>`;
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
// CARD PRODUCTO
function renderProductCard(producto) {
    const backendURL = 'http://localhost:3000';
    const imagenCompleta = `${backendURL}${producto.imagen}`;

    return `
        <div class="product-card">
            <img src="${imagenCompleta}" alt="${producto.nombre}" onerror="this.onerror=null; this.src='https://via.placeholder.com/150'">
            <div class="product-card-content">
                <h3>${producto.nombre}</h3>
                <p>${producto.desc}</p>
                <p class="price">$${producto.precio}</p>
                
                <div class="quantity-controls">
                    <button class="quantity-btn" data-id="${producto.id}" data-action="decrease">-</button>
                    <span id="quantity-${producto.id}">1</span>
                    <button class="quantity-btn" data-id="${producto.id}" data-action="increase">+</button>
                </div>
                <a href="#" class="btn add-to-cart-btn" data-id="${producto.id}">Añadir al carrito</a>
            </div>
        </div>
    `;
}