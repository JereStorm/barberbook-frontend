"use strict";

/**Utilizamos una arrow function auto invocada o IIFE para asegurarnos
 * que el código se ejecute solo cuando el script correspondiente es cargado y evaluado por el navegador,
 * después de que su HTML fue inyectado. */
(() => {
  const testimonios = [
    {
      texto: `"Barber Book me ahorra horas de organizacion en la semana. Estoy muy satisfecho."`,
      autor: "Benjamin B. Peluquero de Buenos Aires",
    },
    {
      texto: `"Desde que usamos Barber Book, duplicamos la eficiencia. Es muy facil e intuitivo"`,
      autor: "Ana S. Estilista de Madrid",
    },
    {
      texto: `"Lo que mas destaco es lo simple que es reprogramar turnos y organizar la agenda semanal"`,
      autor: "Jose D. Estilista de 9 de Julio",
    },
  ];

  let indiceActual = 0;
  const texto = document.getElementById("testimonioTexto");
  const autor = document.getElementById("testimonioAutor");

  function mostrarContenido(indice) {
    texto.classList.add("opacity-0");
    autor.classList.add("opacity-0");

    setTimeout(() => {
      texto.textContent = testimonios[indice].texto;
      autor.textContent = testimonios[indice].autor;
      texto.classList.remove("opacity-0");
      autor.classList.remove("opacity-0");
    }, 300);
  }

  document.getElementById("prevTestimonio").addEventListener("click", () => {
    indiceActual = (indiceActual - 1 + testimonios.length) % testimonios.length;
    mostrarContenido(indiceActual);
  });

  document.getElementById("nextTestimonio").addEventListener("click", () => {
    indiceActual = (indiceActual + 1) % testimonios.length;
    mostrarContenido(indiceActual);
  });



  /**
 * -------------------- VALIDACIONES FORMULARIO DE CONTACTO
 */
  const form = document.getElementById("form-contacto");
  const nombre = document.getElementById("nombreContacto");
  const correo = document.getElementById("correoContacto");
  const mensaje = document.getElementById("mensajeContacto");
  const mensajeExito = document.getElementById("mensajeExito");
  const feedbackContainer = document.getElementById("formFeedback");
  const loader = document.getElementById("loaderContacto");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let esValido = true;

    // Limpiar mensajes anteriores
    [nombre, correo, mensaje].forEach(input => {
      input.classList.remove("is-valid", "is-invalid");
    });
    mensajeExito.classList.add("d-none");
    feedbackContainer.style.display = "none";
    loader.classList.add("d-none");

    // Validar nombre
    if (nombre.value.trim().length < 2) {
      nombre.classList.add("is-invalid");
      esValido = false;
    } else {
      nombre.classList.add("is-valid");
    }

    // Validar correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo.value.trim())) {
      correo.classList.add("is-invalid");
      esValido = false;
    } else {
      correo.classList.add("is-valid");
    }

    // Validar mensaje
    if (mensaje.value.trim().length < 5) {
      mensaje.classList.add("is-invalid");
      esValido = false;
    } else {
      mensaje.classList.add("is-valid");
    }

    if (!esValido) return;

    // Mostrar loader y simular envío
    loader.classList.remove("d-none");

    setTimeout(() => {
      loader.classList.add("d-none");
      feedbackContainer.style.display = "block";
      mensajeExito.classList.remove("d-none");

      // Limpiar campos y clases
      form.reset();
      [nombre, correo, mensaje].forEach(input => input.classList.remove("is-valid", "is-invalid"));
    }, 1500); // tiempo en ms del "envío"

    setTimeout(() => {
      mensajeExito.classList.add("d-none")
    }, 3000);
  });
})();