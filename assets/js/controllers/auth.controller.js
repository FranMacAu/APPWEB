// Maneja tanto el formulario de login como el de registro
import { loginUsuario, registrarUsuario } from '../api/auth.api.js';
import { showLoader, hideLoader } from '../utils/ui.js';

const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        
        showLoader();
        try {
            const resultado = await loginUsuario({ email, password });
            localStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('usuario', resultado.usuario.email);
            window.location.href = "../index.html";
        } catch (error) {
            alert(error.message);
            hideLoader();
        }
    });
}

const registroForm = document.getElementById("registroForm");
if (registroForm) {
    registroForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const nombre = document.getElementById("nombre").value;
        const apellido = document.getElementById("apellido").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (password.length < 8) return alert("Error: La contraseña debe tener al menos 8 caracteres.");
        if (password !== confirmPassword) return alert("Error: Las contraseñas no coinciden.");

        showLoader();
        try {
            await registrarUsuario({ nombre, apellido, email, password });
            alert("¡Usuario creado con éxito! Ya podés iniciar sesión.");
            registroForm.reset();
            window.location.href = "/pages/login.html";
        } catch (error) {
            alert(error.message);
            hideLoader();
        }
    });
}