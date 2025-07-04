"use strict";

// ------------------------------
// INICIALIZACIoN Y VARIABLES
// ------------------------------
(() => {
    // Cuando arranca, busco en el localStorage los turnos y empleados guardados
    // Si no hay nada, uso arrays vacios como valor por defecto
    let turnos = JSON.parse(localStorage.getItem('turnos')) || [];
    let empleados = JSON.parse(localStorage.getItem('empleados')) || [];

    // Aca guardo las referencias a los elementos del DOM que voy a usar
    const tablaTurnos = document.getElementById('tabla-turnos');
    const btnNuevoTurno = document.getElementById('btnNuevoTurno');
    const formTurno = document.getElementById('form-turno');
    const tituloForm = document.getElementById('titulo-form');
    const selectOrdenar = document.getElementById('ordenar');
    const modalTurno = new bootstrap.Modal(document.getElementById('modalTurno'));

    // ------------------------------
    // OBJETO DE FILTROS POR COLUMNA
    // ------------------------------
    // Creo un objeto para guardar los filtros que aplica el usuario
    const filtros = {
        nombre: '',
        fecha: '',
        hora: '',
        servicio: '',
        empleado: ''
    };

    // ------------------------------
    // RENDERIZAR TABLA DE TURNOS
    // ------------------------------

    // Esta funcion se encarga de mostrar los turnos en la tabla
    function renderizarTurnos() {
        // Primero limpio la tabla
        tablaTurnos.innerHTML = '';

        // Creo una copia de los turnos para no modificar el original
        let turnosOrdenados = [...turnos];
        const orden = selectOrdenar.value;

        // Ordeno los turnos segun lo que elija el usuario
        switch (orden) {
            case 'hora':
                turnosOrdenados.sort((a, b) => new Date(`${a.fecha}T${a.hora}`) - new Date(`${b.fecha}T${b.hora}`));
                break;
            case 'cliente':
                turnosOrdenados.sort((a, b) => a.nombre.localeCompare(b.nombre));
                break;
            case 'fecha':
                turnosOrdenados.sort((a, b) => parsearFechaLocal(a.fecha) - parsearFechaLocal(b.fecha));
                break;
            case 'servicio':
                turnosOrdenados.sort((a, b) => a.servicio.localeCompare(b.servicio));
                break;
        }

        // Si no hay turnos, muestro un mensaje
        if (turnosOrdenados.length === 0) {
            tablaTurnos.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">No hay turnos registrados</td>
                </tr>
            `;
            return;
        }

        // Aplico los filtros que tenga activos el usuario
        turnosOrdenados = turnosOrdenados.filter(turno => {
            const coincideNombre = turno.nombre.toLowerCase().includes(filtros.nombre);
            const coincideFecha = formatearFecha(turno.fecha).includes(filtros.fecha);
            const coincideHora = turno.hora.includes(filtros.hora);
            const coincideServicio = turno.servicio.toLowerCase().includes(filtros.servicio);
            const coincideEmpleado = (turno.empleado || 'Sin asignar').toLowerCase().includes(filtros.empleado);

            return coincideNombre && coincideFecha && coincideHora && coincideServicio && coincideEmpleado;
        });

        // Recorro los turnos y los voy agregando a la tabla
        turnosOrdenados.forEach((turno, index) => {
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

        // Agrego los eventos para los botones de editar y eliminar
        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', editarTurno);
        });

        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', eliminarTurno);
        });
    }

    // ------------------------------
    // FILTROS FLOTANTES POR COLUMNA
    // ------------------------------

    // Esto maneja los filtros que aparecen al clickear los iconos de filtro
    document.querySelectorAll('.filter-icon').forEach(icono => {
        icono.addEventListener('click', (e) => {
            e.stopPropagation();
            // Primero borro cualquier filtro que este visible
            document.querySelectorAll('.filtro-flotante').forEach(el => el.remove());

            // Veo en que columna se hizo click
            const columna = e.currentTarget.dataset.columna;

            // Creo el input para filtrar
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'Filtrar...';
            input.className = 'filtro-flotante';
            input.value = filtros[columna];

            // Lo posiciono debajo del icono de filtro
            const rect = e.currentTarget.getBoundingClientRect();
            input.style.left = `${rect.left}px`;
            input.style.top = `${rect.bottom + window.scrollY}px`;

            document.body.appendChild(input);
            input.focus();

            // Cuando el usuario escribe, actualizo el filtro y vuelvo a renderizar
            input.addEventListener('input', () => {
                filtros[columna] = input.value.toLowerCase();
                renderizarTurnos();
            });

            // Si aprieta ESC, cierro el filtro
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') input.remove();
            });

            // Cierro el filtro si se hace click fuera de el
            document.addEventListener('click', function cerrarInput(event) {
                if (!input.contains(event.target)) {
                    input.remove();
                    document.removeEventListener('click', cerrarInput);
                }
            });
        });
    });

    // ------------------------------
    // FORMATEO Y PARSEO DE FECHAS
    // ------------------------------
    // Convierto las fechas al formato dd/mm/aaaa para mostrarlas
    function formatearFecha(fecha) {
        const opciones = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return parsearFechaLocal(fecha).toLocaleDateString('es-ES', opciones);
    }

    // Convierto un string de fecha a objeto Date
    function parsearFechaLocal(fecha) {
        const [anio, mes, dia] = fecha.split("-");
        return new Date(anio, mes - 1, dia);
    }

    // ------------------------------
    // CRUD DE TURNOS
    // ------------------------------

    // Muestro el formulario para crear un nuevo turno
    function mostrarFormularioNuevo() {
        tituloForm.textContent = 'Crear Turno';
        formTurno.reset();
        document.getElementById('indice-edicion-turno').value = '';
        // Seteo la fecha minima como hoy
        document.getElementById('fechaTurno').min = new Date().toISOString().split('T')[0];
        cargarOpcionesEmpleado();
        modalTurno.show();
    }

    // Cargo los datos de un turno en el formulario para editarlo
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

        cargarOpcionesEmpleado(turno.empleado);
        modalTurno.show();
    }

    // Elimino un turno previa confirmacion
    function eliminarTurno(e) {
        if (confirm('¿Estas seguro de que queres eliminar este turno?')) {
            const index = e.currentTarget.getAttribute('data-id');
            turnos.splice(index, 1);
            guardarTurnos();
            renderizarTurnos();
        }
    }

    // Guardo un turno nuevo o los cambios de uno existente
    function guardarTurno(e) {
        e.preventDefault();

        const indexEdicion = document.getElementById('indice-edicion-turno').value;
        const nuevoTurno = {
            nombre: document.getElementById('nombreTurno').value,
            email: document.getElementById('emailTurno').value,
            telefono: document.getElementById('telefonoTurno').value,
            fecha: document.getElementById('fechaTurno').value,
            hora: document.getElementById('horaTurno').value,
            servicio: document.getElementById('servicioTurno').value,
            duracion: parseInt(document.getElementById('duracionTurno').value),
            empleado: document.getElementById('empleadoTurno').value || null
        };

        // Verifico que el empleado este disponible en ese horario
        if (nuevoTurno.empleado && !disponibleTurno(nuevoTurno, indexEdicion)) {
            alert('Ese empleado ya tiene un turno asignado en ese horario.');
            return;
        }

        // Si no hay indice de edicion, es un turno nuevo->Esto es importante, asi se detecta si el turno ya existe, o es nuevo
        if (indexEdicion === '') {
            turnos.push(nuevoTurno);
        } else {
            turnos[indexEdicion] = nuevoTurno;
        }

        guardarTurnos();
        renderizarTurnos();
        modalTurno.hide();
    }

    // Verifico si un empleado esta disponible para un turno
    function disponibleTurno(nuevoTurno, indexEdicion) {
        const inicioNuevo = new Date(`${nuevoTurno.fecha}T${nuevoTurno.hora}`);
        const finNuevo = new Date(inicioNuevo.getTime() + nuevoTurno.duracion * 60000);

        return turnos.every((t, i) => {
            if (i == indexEdicion) return true;
            if (t.empleado !== nuevoTurno.empleado || t.fecha !== nuevoTurno.fecha) return true;

            const inicioExistente = new Date(`${t.fecha}T${t.hora}`);
            const finExistente = new Date(inicioExistente.getTime() + t.duracion * 60000);

            return finNuevo <= inicioExistente || inicioNuevo >= finExistente;
        });
    }

    // Guardo los turnos en el localStorage
    function guardarTurnos() {
        localStorage.setItem('turnos', JSON.stringify(turnos));
    }

    // Cargo las opciones de empleados en el select del formulario
    function cargarOpcionesEmpleado(seleccionado = '') {
        const select = document.getElementById('empleadoTurno');
        select.innerHTML = `<option value="">Sin asignar</option>`;
        empleados = JSON.parse(localStorage.getItem('empleados')) || [];

        empleados.forEach(emp => {
            const opcion = document.createElement('option');
            opcion.value = emp.nombre;
            opcion.textContent = emp.nombre;
            if (emp.nombre === seleccionado) opcion.selected = true;
            select.appendChild(opcion);
        });
    }

    // ------------------------------
    // EVENTOS INICIALES
    // ------------------------------

    // Configuro los event listeners principales
    btnNuevoTurno.addEventListener('click', mostrarFormularioNuevo);
    formTurno.addEventListener('submit', guardarTurno);
    selectOrdenar.addEventListener('change', renderizarTurnos);

    // Muestro los turnos al cargar la pagina
    renderizarTurnos();
})();