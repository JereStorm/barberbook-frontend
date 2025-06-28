"use strict";

/**Utilizamos una arrow function auto invocada o IIFE para asegurarnos
 * que el código se ejecute solo cuando el script correspondiente es cargado y evaluado por el navegador,
 * espués de que su HTML fue inyectado. */
(() => {
    const form = document.getElementById("form-login");
    const email = document.getElementById("email");
    const password = document.getElementById("password");

    // Datos de ejemplo para login
    const usuarioValido = {
        email: "peluquero@ejemplo.com",
        password: "123123"
    };

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        let esValido = true;

        // Limpiar estados anteriores
        [email, password].forEach(input => input.classList.remove("is-valid", "is-invalid"));

        validarEmail();

        // Si falló alguna validación básica, no seguimos
        if (!esValido) {
            console.warn("Credenciales incorrectas");
            return
        };

        validarPassword();

        // Si falló alguna validación básica, no seguimos
        if (!esValido) {
            console.warn("Credenciales incorrectas");
            return
        };

        // Redirigir con animación si todo fue exitoso
        navegarConAnimacion("#turnos");

        // Podemos también un mensaje general
        console.log("Credenciales correctas");
    });

    /**
     * Valida el campo de email verificando su formato y coincidencia con los datos válidos.
     * Modifica el DOM para reflejar el estado.
     */
    function validarEmail() {
        //Validamos el email tenga formato email
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
        //Validamos que el email sea igual al default
        if (!emailOk || email.value != usuarioValido.email) {
            mostrarEstadoInput(email, false, "emailHelp", "emailError", "Email invalido... Prueba de nuevo");
            esValido = false;
        } else {
            mostrarEstadoInput(email, true, "emailHelp", "emailError");
        }
    }

    /**
     * Valida la contraseña por longitud y coincidencia con datos válidos.
     * Modifica el DOM para reflejar el estado.
     */
    function validarPassword() {
        //Validamos la longitud password
        const passOk = password.value.length >= 6;
        //Validamos que la contraseña sea igual al default
        if (!passOk || password.value != usuarioValido.password) {
            mostrarEstadoInput(password, false, "passwordHelp", "passwordError", "Contraseña invalida... Prueba de nuevo");
            esValido = false;
        } else {
            mostrarEstadoInput(password, true, "passwordHelp", "passwordError");
        }
    }

    function mostrarEstadoInput(input, esCorrecto, ayudaId, errorId, mensajeError = "") {
        const ayuda = document.getElementById(ayudaId);
        const error = document.getElementById(errorId);

        input.classList.remove("is-valid", "is-invalid");
        ayuda.style.display = "none";
        error.style.display = "none";

        if (esCorrecto) {
            input.classList.add("is-valid");
            ayuda.style.display = "block";
        } else {
            input.classList.add("is-invalid");
            error.style.display = "block";
            error.innerHTML = mensajeError;
        }
    }
    /**
     * Realiza la animación de salida y luego redirige a la nueva vista.
     * @param {string} hashDestino - Ruta hash hacia la que se debe navegar
     */
    function navegarConAnimacion(hashDestino) {
        const container = document.getElementById("contenido-dinamico");
        container.classList.remove("visible");
        setTimeout(() => {
            location.hash = hashDestino;
        }, 300);
    }


})();
