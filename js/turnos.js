"use strict";
(() => {
    // Datos simulados ->(localStorage)
    let turnos = JSON.parse(localStorage.getItem('turnos')) || [];

    // Elementos del DOM
    const tablaTurnos = document.getElementById('tabla-turnos');
    const btnNuevoTurno = document.getElementById('btnNuevoTurno');
    const formTurno = document.getElementById('form-turno');
    const tituloForm = document.getElementById('titulo-form');
    const selectOrdenar = document.getElementById('ordenar');
    const modalTurno = new bootstrap.Modal(document.getElementById('modalTurno'));

    // Mostrar turnos en la tabla
    function renderizarTurnos() {
        tablaTurnos.innerHTML = '';

        // Ordenar turnos
        const orden = selectOrdenar.value;
        let turnosOrdenados = [...turnos];

        switch (orden) {
            case 'hora':
                turnosOrdenados.sort((a, b) => {
                    const fechaA = new Date(`${a.fecha}T${a.hora}`);
                    const fechaB = new Date(`${b.fecha}T${b.hora}`);
                    return fechaA - fechaB;
                });
                break;
            case 'cliente':
                turnosOrdenados.sort((a, b) => a.nombre.localeCompare(b.nombre));
                break;
            case 'fecha':
                turnosOrdenados.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
                break;
            case 'servicio':
                turnosOrdenados.sort((a, b) => a.servicio.localeCompare(b.servicio));
                break;
        }

        //Constante para los turnos sorteados
        const turnosMostrar = turnosOrdenados;

        if (turnosMostrar.length === 0) {
            tablaTurnos.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">No hay turnos registrados</td>
                </tr>
            `;
            return;
        }

        turnosMostrar.forEach((turno, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${turno.nombre}</td>
                <td>${formatearFecha(turno.fecha)}</td>
                <td>${turno.hora}</td>
                <td>${turno.servicio}</td>
                <td>${turno.duracion} min</td>
                <td>${turno.empleado || 'Sin asignar'}</td>
                <td>
                    <button class="btn btn-editar btn-accion" data-id="${index}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-eliminar btn-accion" data-id="${index}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tablaTurnos.appendChild(tr);
        });

        // Eventos de los botones
        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', editarTurno);
        });

        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', eliminarTurno);
        });
    }

    // Fecha formateada, tuve que agregar esto para que se vea mejor
    function formatearFecha(fecha) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(fecha).toLocaleDateString('es-ES', options);
    }

    // Mostrar formulario para nuevo turno
    function mostrarFormularioNuevo() {
        tituloForm.textContent = 'Crear Turno';
        formTurno.reset();
        document.getElementById('indice-edicion').value = '';
        document.getElementById('fecha').min = new Date().toISOString().split('T')[0];
        modalTurno.show();
    }

    // Editar turno existente
    function editarTurno(e) {
        const index = e.currentTarget.getAttribute('data-id');
        const turno = turnos[index];

        console.log(turnos)

        tituloForm.textContent = 'Editar Turno';
        document.getElementById('indice-edicion').value = index;
        document.getElementById('nombre').value = "Hola mundo";
        document.getElementById('email').value = turno.email;
        document.getElementById('telefono').value = turno.telefono;
        document.getElementById('fecha').value = turno.fecha;
        document.getElementById('hora').value = turno.hora;
        document.getElementById('servicio').value = turno.servicio;
        document.getElementById('duracion').value = turno.duracion;
        document.getElementById('empleado').value = turno.empleado || '';

        modalTurno.show();
    }

    // Eliminar turno
    function eliminarTurno(e) {
        if (confirm('¿Estás seguro de que quieres eliminar este turno?')) {
            const index = e.currentTarget.getAttribute('data-id');
            turnos.splice(index, 1);
            guardarTurnos();
            renderizarTurnos();
        }
    }

    // Guardar turno (se usa la misma funcion para un turno nuevo o editado)
    function guardarTurno(e) {
        e.preventDefault();

        const indexEdicion = document.getElementById('indice-edicion').value;
        const turno = {
            nombre: document.getElementById('nombre').value,
            email: document.getElementById('email').value,
            telefono: document.getElementById('telefono').value,
            fecha: document.getElementById('fecha').value,
            hora: document.getElementById('hora').value,
            servicio: document.getElementById('servicio').value,
            duracion: document.getElementById('duracion').value,
            empleado: document.getElementById('empleado').value || null
        };

        if (indexEdicion === '') {
            // Nuevo turno
            turnos.push(turno);
        } else {
            // Editar turno existente
            turnos[indexEdicion] = turno;
        }

        guardarTurnos();
        renderizarTurnos();
        modalTurno.hide();
    }

    // Guardar en localStorage
    function guardarTurnos() {
        localStorage.setItem('turnos', JSON.stringify(turnos));
    }

    // Event listeners
    btnNuevoTurno.addEventListener('click', mostrarFormularioNuevo);
    formTurno.addEventListener('submit', guardarTurno);
    selectOrdenar.addEventListener('change', renderizarTurnos);

    // Inicializar
    renderizarTurnos();
})();