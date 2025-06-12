"use strict"

/* LOGICA SIDEBAR */

const toggleBtn = document.getElementById('toggleSidebarBtn');
const sidebar = document.getElementById('mobileSidebar');

let sidebarVisible = false;

toggleBtn.addEventListener('click', () => {
    if (!sidebarVisible) {
        sidebar.classList.remove('d-none');
        sidebar.classList.add('d-flex', 'sidebar-slide-in');
        sidebar.classList.remove('sidebar-slide-out');
    } else {
        sidebar.classList.remove('sidebar-slide-in');
        sidebar.classList.add('sidebar-slide-out');

        // Espera a que termine la animación antes de ocultar
        setTimeout(() => {
            sidebar.classList.remove('d-flex', 'sidebar-slide-out');
            sidebar.classList.add('d-none');
        }, 300);
    }

    sidebarVisible = !sidebarVisible;
});