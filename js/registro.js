"use strict";
(() => {
    const form = document.getElementById("form-registro");

    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const repassword = document.getElementById("re-password");

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        // Limpiar validaciones anteriores
        [email, password, repassword].forEach(limpiarEstadoInput);

        let esFormularioValido = true;

        // Validar email
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        emailValido.test(email.value.trim());
        aplicarEstadoInput(email, emailValido);
        if (!emailValido) esFormularioValido = false;

        // Validar password
        const passValido = password.value.length >= 6;
        aplicarEstadoInput(password, passValido);
        if (!passValido) esFormularioValido = false;

        // Validar confirmación
        const repassValido = password.value === repassword.value && repassword.value !== "";
        aplicarEstadoInput(repassword, repassValido);
        if (!repassValido) esFormularioValido = false;

        if (esFormularioValido) {
            const container = document.getElementById("contenido-dinamico");

            // Paso 1: forzar el fade-out
            container.classList.remove("visible");

            // Paso 2: esperar que termine la animación
            setTimeout(() => {
                // Paso 3: cambiar de página
                location.hash = "#turnos";
            }, 300); // mismo valor que tu transición CSS
        }
    });

    /**
     * Limpia las clases de validación de un input.
     * @param {HTMLInputElement} input
     */
    function limpiarEstadoInput(input) {
        input.classList.remove("is-valid", "is-invalid");
    }

    /**
     * Aplica clase visual a un input según si pasó o no la validación.
     * @param {HTMLInputElement} input
     * @param {boolean} esValido
     */
    function aplicarEstadoInput(input, esValido) {
        input.classList.add(esValido ? "is-valid" : "is-invalid");
    }
})();
