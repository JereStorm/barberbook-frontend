"use strict";

/**Utilizamos una arrow function auto invocada o IIFE para asegurarnos
 * que el código se ejecute solo cuando el script correspondiente es cargado y evaluado por el navegador,
 * espués de que su HTML fue inyectado. */
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
            navegarConAnimacion("#turnos");
        }
    });

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
