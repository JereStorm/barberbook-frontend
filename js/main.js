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
    const container = document.getElementById("contenido-dinamico");

    banderaSinMenu = rutasSinMenu.includes(ruta);
    if (banderaSinMenu) {
        navbarsContainer.classList.add("d-none");
    } else {
        navbarsContainer.classList.remove("d-none");
    }

    // FADE OUT antes de cambiar el contenido
    container.classList.remove("visible");

    // Esperamos la duración del fade-out antes de continuar (300ms como en el CSS)
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
        const res = await fetch(`/pages/${ruta}.html`);
        if (res.ok) {
            const html = await res.text();
            container.innerHTML = html;

            requestAnimationFrame(() => {
                container.classList.add("visible");
                // Acá es donde sí o sí ya está en el DOM
                cargarScriptDeVista(ruta);
            });
        } else {
            container.innerHTML = "<p>Error cargando la vista.</p>";
        }
    } catch (error) {
        console.error("Error en la carga de vista:", error);
        container.innerHTML = "<p>Error al cargar el contenido.</p>";
    }
}


/**
 * Carga un script JS asociado a la vista si existe
 * @param {string} vista - Nombre base del archivo JS (ej: 'turnos')
 */
function cargarScriptDeVista(vista) {
    if (vista === "home") {
        return
    }

    const idScript = 'script-dinamico';

    // Elimina script anterior si hay
    const scriptAnterior = document.getElementById(idScript);
    if (scriptAnterior) {
        scriptAnterior.remove();
    }

    // Crea y agrega nuevo script
    const script = document.createElement('script');
    script.src = `/js/${vista}.js`;
    script.id = idScript;
    script.type = 'text/javascript';

    // Manejo de error si no existe el script
    script.onerror = () => {
        console.warn(`No se encontró script para vista: ${vista}`);
    };

    document.body.appendChild(script);
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
async function manejarCambioDeHash() {
    const ruta = obtenerRutaDesdeHash();
    await cargarCssPorRuta(ruta);
    cargarVista(ruta);
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
 * Carga dinámicamente un archivo CSS sin romper la vista anterior
 * @param {string} ruta - Nombre del archivo sin extensión
 * @returns {Promise<void>}
 */
function cargarCssPorRuta(ruta) {
    return new Promise((resolve) => {
        const nuevoLink = document.createElement('link');
        nuevoLink.rel = 'stylesheet';
        nuevoLink.href = `/css/${ruta}.css`;
        nuevoLink.id = 'estilo-dinamico-nuevo';

        nuevoLink.onload = () => {
            // Cuando se haya aplicado el nuevo CSS, eliminamos el anterior
            const anterior = document.getElementById('estilo-dinamico');
            if (anterior) anterior.remove();

            // Renombramos el nuevo link como el anterior para mantener el sistema
            nuevoLink.id = 'estilo-dinamico';

            resolve();
        };

        nuevoLink.onerror = () => {
            console.warn(`Error al cargar CSS para ${ruta}`);
            resolve();
        };

        document.head.appendChild(nuevoLink);
    });
}
