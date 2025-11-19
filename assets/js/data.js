//  NAVBAR  

window.navLinks = [
    { 
        titulo: "Inicio", 
        href: "index.html" 
    },
    { 
        titulo: "Productos", 
        href: "pages/productos.html", 
        subLinks: [
            { titulo: "Plantas de Interior", href: "pages/productos.html?categoria=Interior" },
            { titulo: "Plantas de Exterior", href: "pages/productos.html?categoria=Exterior" },
            { titulo: "Crasas y Suculentas", href: "pages/productos.html?categoria=Crasas" }
        ]
    },
    { 
        titulo: "Carrito", 
        href: "pages/carrito.html" 
    }
    // Perfil del usuario, para implementar después
    //{ titulo: "Mi Perfil", href: "pages/perfil.html" }, 
];

