"use strict";

/*------------------- SIDEBAR MOBILE (boton hamburguesa) -------------------*/

const toggleBtn = document.getElementById("toggleSidebarBtn");
const sidebar = document.getElementById("mobileSidebar");

let sidebarVisible = false;

const overlay = document.getElementById("sidebarOverlay");

if (toggleBtn) {
    // Escuchamos el click sobre el boton hamburguesa
    toggleBtn.addEventListener("click", () => {
        if (!sidebarVisible) {
            // Mostrar sidebar
            sidebar.classList.remove("d-none");
            sidebar.classList.add("d-flex", "sidebar-slide-in");
            sidebar.classList.remove("sidebar-slide-out");

            // Mostrar overlay
            overlay.classList.remove("d-none");
        } else {
            // Ocultar sidebar con animación
            sidebar.classList.remove("sidebar-slide-in");
            sidebar.classList.add("sidebar-slide-out");

            // Ocultar overlay después de la animación
            setTimeout(() => {
                sidebar.classList.remove("d-flex", "sidebar-slide-out");
                sidebar.classList.add("d-none");
                overlay.classList.add("d-none");
            }, 200);
        }

        sidebarVisible = !sidebarVisible;
    });

    // Cierre si se hace clic sobre el overlay
    overlay.addEventListener("click", () => {
        if (sidebarVisible) {
            sidebar.classList.remove("sidebar-slide-in");
            sidebar.classList.add("sidebar-slide-out");

            setTimeout(() => {
                sidebar.classList.remove("d-flex", "sidebar-slide-out");
                sidebar.classList.add("d-none");
                overlay.classList.add("d-none");
                sidebarVisible = false;
            }, 300);
        }
    });
}

/*------------------- AÑO DINAMICO EN EL FOOTER -------------------*/

const yearSpan = document.getElementById("year");
if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
}

/**
 * ELEMENTOS PRINCIPALES DEL DOM PARA NAVEGACION Y CONTENIDO
 */
const contenidoDinamico = document.getElementById("contenido-dinamico");
const navbarsContainer = document.getElementById("navbars");
const enlaces = document.querySelectorAll(".nav-link");
const footer = document.getElementById("footer");

/**
 * Rutas que no deben mostrar navbar ni footer.
 * @type string[]
 */
const rutasSinMenu = ["home", "login", "registro"];

/**
 * Vistas que tienen archivos CSS y JS propios.
 * @type string[]
 */
const vistasConRecursos = ["empleados", "login", "registro", "turnos", "nosotros"];

/**
 * Bandera para controlar si ocultar el nav/footer.
 * @type boolean
 */
let banderaSinMenu = true;

/* ---------------------------------------------------------------------------
 * EVENTOS DE INICIO DE NAVEGACIÓN SPA
 * ---------------------------------------------------------------------------
 */

/**
 * Evento: se dispara cada vez que cambia el hash en la URL.
 */
window.addEventListener("hashchange", manejarCambioDeHash);

/**
 * Evento: se dispara al cargar la página, para detectar el hash inicial.
 */
window.addEventListener("DOMContentLoaded", () => {
    manejarCambioDeHash();
});

/**
 * Maneja el cambio de vista según el hash actual.
 * Carga la vista HTML, aplica el CSS correspondiente y marca el enlace activo.
 * @returns {Promise<void>}
 */
async function manejarCambioDeHash() {
    const ruta = obtenerRutaDesdeHash();
    cargarVista(ruta);
    setTimeout(() => {
        cargarCssPorRuta(ruta);
    }, 300);
    marcarActivoPorRuta(ruta);
}

/**
 * Obtiene el nombre de la ruta actual a partir del hash en la URL.
 * @returns {string} - Ruta limpia sin el símbolo #
 */
function obtenerRutaDesdeHash() {
    return window.location.hash.replace("#", "") || "home";
}

/**
 * Carga dinámicamente el HTML correspondiente a una vista.
 * Aplica animaciones de transición y controla la visibilidad de navbar/footer.
 * @param {string} ruta - Nombre de la vista sin extensión.
 * @returns {Promise<void>}
 */
async function cargarVista(ruta) {
    const container = contenidoDinamico;

    // Ocultar o mostrar el navbar y el footer
    banderaSinMenu = rutasSinMenu.includes(ruta);
    navbarsContainer.classList.toggle("d-none", banderaSinMenu);
    footer.classList.toggle("d-none", banderaSinMenu);

    // Fade-out antes de reemplazar el contenido
    container.classList.remove("visible");
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
        const res = await fetch(`/pages/${ruta}.html`);
        if (res.ok) {
            const html = await res.text();
            container.innerHTML = html;

            // Fade-in después de reemplazar
            requestAnimationFrame(() => {
                container.classList.add("visible");
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
 * Carga dinámicamente el archivo JS correspondiente a la vista, si existe.
 * Elimina el anterior y lo reemplaza con uno nuevo.
 * @param {string} vista - Nombre de la vista (ej: "turnos").
 */
function cargarScriptDeVista(vista) {
    if (!vistasConRecursos.includes(vista)) return;

    const idScript = 'script-dinamico';
    const scriptAnterior = document.getElementById(idScript);
    if (scriptAnterior) scriptAnterior.remove();

    const script = document.createElement('script');
    script.src = `/js/${vista}.js`;
    script.id = idScript;
    script.type = 'text/javascript';

    script.onerror = () => {
        console.warn(`No se encontró script para vista: ${vista}`);
    };

    document.body.appendChild(script);
}

/**
 * Marca visualmente el enlace de navegación activo en función de la ruta actual.
 * @param {string} rutaActual - Ruta activa (ej: "empleados").
 */
function marcarActivoPorRuta(rutaActual) {
    enlaces.forEach(link => {
        const linkRuta = link.getAttribute("href").replace("#", "");
        link.classList.toggle("active", linkRuta === rutaActual);
    });
}

/* ---------------------------------------------------------------------------
 * CARGA DINÁMICA DE CSS
 *---------------------------------------------------------------------------
*/

/**
 * Carga dinámicamente el archivo CSS correspondiente a la vista, si existe
 * y reemplaza el anterior si ya había uno cargado.
 * @param {string} ruta - nombre de la vista
 * @returns {Promise<void>}
 */
function cargarCssPorRuta(ruta) {
    return new Promise((resolve) => {
        if (!vistasConRecursos.includes(ruta)) {
            resolve();
            return;
        }

        const nuevoLink = document.createElement('link');
        nuevoLink.rel = 'stylesheet';
        nuevoLink.href = `/css/${ruta}.css`;
        nuevoLink.id = 'estilo-dinamico-nuevo';

        nuevoLink.onload = () => {
            const anterior = document.getElementById('estilo-dinamico');
            if (anterior) anterior.remove();

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
