"use strict";
(() => {
    const formRegistro = document.getElementById("form-registro");
    formRegistro.addEventListener("submit", validarRegistro);


    function validarRegistro() {

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;


        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("El email no tiene un formato válido.");
            return;
        }

        // Validar longitud de la contraseña
        if (password.length < 6) {
            alert("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        const validarEmail = "peluquero@ejemplo.com";
        const validarPassword = "123456";

        if (email === validarEmail && password === validarPassword) {
            window.location.href = "#turnos";
        } else {
            alert("Usuario o Contraseña incorrectos.")
        }
    }
})();