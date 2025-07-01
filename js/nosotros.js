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
})();
