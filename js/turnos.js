"use strict";

/**Utilizamos una arrow function auto invocada o IIFE para asegurarnos
 * que el código se ejecute solo cuando el script correspondiente es cargado y evaluado por el navegador,
 * espués de que su HTML fue inyectado. */
(() => {
    // Datos simulados ->(localStorage)
    let turnos = JSON.parse(localStorage.getItem('turnos')) || [];

    // Agregue esta linea para obtener los empleados del formulario turnos, desde los empleados creados en el CRUD de los mismos
    let empleados = JSON.parse(localStorage.getItem('empleados')) || [];


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
        document.getElementById('indice-edicion-turno').value = '';
        document.getElementById('fecha').min = new Date().toISOString().split('T')[0];

        cargarOpcionesEmpleado();
        modalTurno.show();
    }


    // Editar turno existente
    function editarTurno(e) {
        const index = e.currentTarget.getAttribute('data-id');
        const turno = turnos[index];

        tituloForm.textContent = 'Editar Turno';
        document.getElementById('indice-edicion-turno').value = index;
        document.getElementById('nombreTurno').value = turno.nombre;
        document.getElementById('emailTurno').value = turno.email;
        document.getElementById('telefonoTurno').value = turno.telefono;
        document.getElementById('fechaTurno').value = turno.fecha;
        document.getElementById('horaTurno').value = turno.hora;
        document.getElementById('servicioTurno').value = turno.servicio;
        document.getElementById('duracionTurno').value = turno.duracion;

        cargarOpcionesEmpleado(turno.empleado); // Ahora los empleados se obtienen de los creados en su CRUD

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

        const indexEdicion = document.getElementById('indice-edicion-turno').value;
        const turno = {
            nombre: document.getElementById('nombreTurno').value,
            email: document.getElementById('emailTurno').value,
            telefono: document.getElementById('telefonoTurno').value,
            fecha: document.getElementById('fechaTurno').value,
            hora: document.getElementById('horaTurno').value,
            servicio: document.getElementById('servicioTurno').value,
            duracion: document.getElementById('duracionTurno').value,
            empleado: document.getElementById('empleadoTurno').value || null
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


    // Rellena el select de empleados cada vez que se abre el modal
    function cargarOpcionesEmpleado(seleccionado = "") {
        const select = document.getElementById("empleadoTurno");

        // Limpiamos las opciones actuales
        select.innerHTML = `<option value="">Sin asignar</option>`;

        // Releer empleados por si cambiaron
        empleados = JSON.parse(localStorage.getItem("empleados")) || [];

        empleados.forEach(emp => {
            const opcion = document.createElement("option");
            opcion.value = emp.nombre;
            opcion.textContent = emp.nombre;

            // Si hay uno seleccionado, lo marcamos
            if (emp.nombre === seleccionado) {
                opcion.selected = true;
            }

            select.appendChild(opcion);
        });
    }


    // Inicializar
    renderizarTurnos();
})();