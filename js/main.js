"use strict";

/*---------------- LOGICA SIDEBAR */
const toggleBtn = document.getElementById("toggleSidebarBtn");
const sidebar = document.getElementById("mobileSidebar");

let sidebarVisible = false;

if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
        if (!sidebarVisible) {
            sidebar.classList.remove("d-none");
            sidebar.classList.add("d-flex", "sidebar-slide-in");
            sidebar.classList.remove("sidebar-slide-out");
        } else {
            sidebar.classList.remove("sidebar-slide-in");
            sidebar.classList.add("sidebar-slide-out");
            setTimeout(() => {
                sidebar.classList.remove("d-flex", "sidebar-slide-out");
                sidebar.classList.add("d-none");
            }, 300);
        }
        sidebarVisible = !sidebarVisible;
    });
}

/*------------------- PARTIAL RENDER CON HASH */

const contenidoDinamico = document.getElementById("contenido-dinamico");
const navbarsContainer = document.getElementById("navbars");
const enlaces = document.querySelectorAll(".nav-link");

const rutasSinMenu = ["home", "login", "registro"];
let banderaSinMenu = true;


/**
 * Carga el contenido parcial desde /pages/{ruta}.html
 * @param {string} ruta - nombre sin extensión (ej: 'turnos')
 */
async function cargarVista(ruta) {
    banderaSinMenu = false;
    //Restringimos el navbar cuando no hay
    rutasSinMenu.forEach(sinMenu => {
        if (ruta === sinMenu) {
            banderaSinMenu = true;
        }
    });

    if (banderaSinMenu) {
        navbarsContainer.classList.add("d-none");
    } else {
        if (navbarsContainer.classList.contains("d-none")) {
            navbarsContainer.classList.remove("d-none");
        }
    }

    try {
        const res = await fetch(`/pages/${ruta}.html`);
        if (res.ok) {
            const html = await res.text();
            contenidoDinamico.innerHTML = html;
        } else {
            contenidoDinamico.innerHTML = "<p>Error cargando la vista.</p>";
        }
    } catch (error) {
        console.error("Error en la carga de vista:", error);
        contenidoDinamico.innerHTML = "<p>Error al cargar el contenido.</p>";
    }
}

/**
 * Marca el enlace activo en el navbar/menú
 * @param {string} rutaActual
 */
function marcarActivoPorRuta(rutaActual) {
    enlaces.forEach(link => {
        const linkRuta = link.getAttribute("href").replace("#", "");
        link.classList.toggle("active", linkRuta === rutaActual);
    });
}

/**
 * Obtiene la ruta desde el hash actual (sin #)
 */
function obtenerRutaDesdeHash() {
    return window.location.hash.replace("#", "") || "home";
}

/**
 * Carga vista y actualiza navegación al cambiar hash
 */
function manejarCambioDeHash() {
    const ruta = obtenerRutaDesdeHash();
    //Cargamos el css primero segun la ruta
    cargarCssPorRuta(ruta);
    //Luego cargamos la vista para prevenir incoherencias
    cargarVista(ruta);
    //Activamos el link del navbar
    marcarActivoPorRuta(ruta);
}

// Detectar cambios en la URL hash
window.addEventListener("hashchange", manejarCambioDeHash);

// Carga inicial al entrar directo con hash
window.addEventListener("DOMContentLoaded", () => {
    manejarCambioDeHash();
});

/*---------------------- RENDERIZADO DINAMICO CSS */

/**
 * Carga dinámicamente un archivo CSS según la ruta
 * @param {string} ruta - Nombre del archivo sin extensión
 */
function cargarCssPorRuta(ruta) {
    // Elimina el CSS anterior si existe
    const estiloAnterior = document.getElementById('estilo-dinamico');
    if (estiloAnterior) {
        estiloAnterior.remove();
    }

    // Crea nuevo link
    const nuevoLink = document.createElement('link');
    nuevoLink.rel = 'stylesheet';
    nuevoLink.href = `/css/${ruta}.css`; // ejemplo: empleados.css
    nuevoLink.id = 'estilo-dinamico';

    // Lo agrega al <head>
    document.head.appendChild(nuevoLink);
}
