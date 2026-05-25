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