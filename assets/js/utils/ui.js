// Control visual global de la interfaz
export const showLoader = () => {
    const loader = document.getElementById("loader-overlay");
    if (loader) loader.classList.add("show");
};

export const hideLoader = () => {
    const loader = document.getElementById("loader-overlay");
    if (loader) loader.classList.remove("show");
};

export const showToast = (message, type = "info", duration = 3000) => {
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

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => {
            toast.remove();
            if (container && container.children.length === 0) container.remove();
        });
    }, duration);
};


export const showConfirmToast = (message) => {
    return new Promise((resolve) => {
        // Creamos el modal directamente
        const toast = document.createElement('div');
        toast.id = 'confirm-modal-toast'; 
        
        // Estilos para centrarlo perfecto en la pantalla completa
        toast.style.display = 'flex';
        toast.style.flexDirection = 'column';
        toast.style.gap = '15px';
        toast.style.alignItems = 'center';
        toast.style.justifyContent = 'center';
        toast.style.backgroundColor = '#2c3e50'; 
        toast.style.color = '#ffffff';
        toast.style.padding = '20px 30px';
        toast.style.borderRadius = '8px';
        toast.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
        toast.style.position = 'fixed';
        toast.style.top = '10%';                  
        toast.style.left = '50%';                 
        toast.style.transform = 'translate(-50%, -50%)'; 
        toast.style.zIndex = '999999';
        toast.style.pointerEvents = 'auto';
        toast.style.minWidth = '300px';           
        toast.style.maxWidth = '90%';
        toast.style.opacity = '0'; // Arranca invisible

        const text = document.createElement('span');
        text.textContent = message;
        text.style.fontWeight = '600';
        text.style.fontSize = '16px';
        text.style.textAlign = 'center';

        const btnContainer = document.createElement('div');
        btnContainer.style.display = 'flex';
        btnContainer.style.gap = '15px';
        btnContainer.style.width = '100%';
        btnContainer.style.justifyContent = 'center';

        const btnConfirm = document.createElement('button');
        btnConfirm.textContent = 'Sí, seguro';
        btnConfirm.className = 'btn'; 
        btnConfirm.style.padding = '8px 20px';
        btnConfirm.style.cursor = 'pointer';

        const btnCancel = document.createElement('button');
        btnCancel.textContent = 'No';
        btnCancel.className = 'btn btn-secondary';
        btnCancel.style.padding = '8px 20px';
        btnCancel.style.cursor = 'pointer';

        btnContainer.appendChild(btnConfirm);
        btnContainer.appendChild(btnCancel);
        
        toast.appendChild(text);
        toast.appendChild(btnContainer);

        // LO CLAVAMOS DIRECTAMENTE EN EL BODY (fuera del container problemático)
        document.body.appendChild(toast);

        // Animación de entrada
        requestAnimationFrame(() => {
            toast.style.transition = 'opacity 0.2s ease';
            toast.style.opacity = '1';
        });

        const closeToast = (resultado) => {
            toast.style.opacity = '0';
            setTimeout(() => {
                toast.remove(); // Se destruye solo
                resolve(resultado);
            }, 200);
        };

        btnConfirm.addEventListener('click', (e) => {
            e.stopPropagation();
            closeToast(true);
        });
        
        btnCancel.addEventListener('click', (e) => {
            e.stopPropagation();
            closeToast(false);
        });
    });
};