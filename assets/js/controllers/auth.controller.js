// Maneja tanto el formulario de login como el de registro
import { loginUsuario, registrarUsuario } from '../api/auth.api.js';
import { showLoader, hideLoader, showToast } from '../utils/ui.js';

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
            localStorage.setItem('token', resultado.token); // Guarda ek token
            window.location.href = "../index.html";
            console.log("Respuesta del servidor:", resultado);
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

        // Reemplazamos los alert() por showToast() y devolvemos la ejecución
        if (password.length < 8) {
            return showToast("Error: La contraseña debe tener al menos 8 caracteres.", "error");
        }
        if (password !== confirmPassword) {
            return showToast("Error: Las contraseñas no coinciden.", "error");
        }

        showLoader();
        try {
            await registrarUsuario({ nombre, apellido, email, password });
            
            // Ocultamos el loader antes de mostrar el éxito
            hideLoader(); 
            
            showToast("¡Usuario creado con éxito! Ya podés iniciar sesión.", "success");
            registroForm.reset();
            
            // Postergamos la redirección 2.5 segundos para que se pueda leer el Toast
            setTimeout(() => {
                window.location.href = "/pages/login.html";
            }, 2500);

        } catch (error) {
            hideLoader();
            showToast(error.message, "error");
        }
    });
}
