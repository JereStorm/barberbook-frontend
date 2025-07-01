"use strict";

/*------------------- SIDEBAR MOBILE (boton hamburguesa) -------------------*/

const toggleBtn = document.getElementById("toggleSidebarBtn");
const sidebar = document.getElementById("mobileSidebar");

let sidebarVisible = false;

const overlay = document.getElementById("sidebarOverlay");

if (toggleBtn) {
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

/*------------------- RENDER DINAMICO DE VISTAS CON HASH -------------------*/

const contenidoDinamico = document.getElementById("contenido-dinamico");
const navbarsContainer = document.getElementById("navbars");
const enlaces = document.querySelectorAll(".nav-link");
const footer = document.getElementById("footer");

// Estas vistas no muestran navbar ni footer
const rutasSinMenu = ["home", "login", "registro"];

// Estas vistas si tienen JS y CSS propio
const vistasConRecursos = ["empleados", "login", "registro", "turnos", "nosotros"];

// Flag para saber si ocultar nav y footer
let banderaSinMenu = true;

// Carga el HTML parcial de una vista desde /pages/{vista}.html
async function cargarVista(ruta) {
    const container = document.getElementById("contenido-dinamico");

    // Si es una vista sin menu, ocultamos navbars y footer
    banderaSinMenu = rutasSinMenu.includes(ruta);
    if (banderaSinMenu) {
        navbarsContainer.classList.add("d-none");
        footer.classList.add("d-none");
    } else {
        navbarsContainer.classList.remove("d-none");
        footer.classList.remove("d-none");
    }

    // Fade-out antes de reemplazar contenido
    container.classList.remove("visible");
    await new Promise(resolve => setTimeout(resolve, 300)); // esperar que termine animacion

    try {
        const res = await fetch(`/pages/${ruta}.html`);
        if (res.ok) {
            const html = await res.text();
            container.innerHTML = html;

            requestAnimationFrame(() => {
                container.classList.add("visible"); // fade-in
                cargarScriptDeVista(ruta); // cargar JS especifico si corresponde
            });
        } else {
            container.innerHTML = "<p>Error cargando la vista.</p>";
        }
    } catch (error) {
        console.error("Error en la carga de vista:", error);
        container.innerHTML = "<p>Error al cargar el contenido.</p>";
    }
}

// Carga el JS de la vista si corresponde (empleados, turnos, etc.)
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

// Marca el link activo segun la vista actual
function marcarActivoPorRuta(rutaActual) {
    enlaces.forEach(link => {
        const linkRuta = link.getAttribute("href").replace("#", "");
        link.classList.toggle("active", linkRuta === rutaActual);
    });
}

// Devuelve la ruta actual (sin el #)
function obtenerRutaDesdeHash() {
    return window.location.hash.replace("#", "") || "home";
}

//Carga la vista completa cada vez que cambia el hash->se usa una funcion asincrona por la necesidad de usar el await, en este paso, para la carga de los css
async function manejarCambioDeHash() {
    const ruta = obtenerRutaDesdeHash();
    await cargarCssPorRuta(ruta);
    cargarVista(ruta);
    marcarActivoPorRuta(ruta);
}

// Dispara cuando cambia el hash (navegacion con #)
window.addEventListener("hashchange", manejarCambioDeHash);

// Carga inicial al abrir la pagina con hash directo
window.addEventListener("DOMContentLoaded", () => {
    manejarCambioDeHash();
});

/*------------------- RENDER DINAMICO DE CSS -------------------*/

// Carga dinamicamente el CSS de la vista si corresponde

function cargarCssPorRuta(ruta) {
    return new Promise((resolve) => {
        // Si no tiene CSS propio, no cargamos nada
        if (!vistasConRecursos.includes(ruta)) {
            resolve();
            return;
        }

        const nuevoLink = document.createElement('link');
        nuevoLink.rel = 'stylesheet';
        nuevoLink.href = `/css/${ruta}.css`;
        nuevoLink.id = 'estilo-dinamico-nuevo';

        nuevoLink.onload = () => {
            // Si ya habia un CSS dinamico antes, lo borramos
            const anterior = document.getElementById('estilo-dinamico');
            if (anterior) anterior.remove();

            // Renombramos el nuevo para mantener consistencia
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
