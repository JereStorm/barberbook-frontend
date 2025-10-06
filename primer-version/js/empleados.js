"use strict";
/**Utilizamos una arrow function auto invocada o IIFE para asegurarnos
 * que el código se ejecute solo cuando el script correspondiente es cargado y evaluado por el navegador,
 * espués de que su HTML fue inyectado. */
(() => {
  // Datos simulados ->(localStorage)
  let empleados = JSON.parse(localStorage.getItem("empleados")) || [];
  let turnos = JSON.parse(localStorage.getItem("turnos")) || [];

  // Elementos del DOM
  const tablaEmpleados = document.getElementById("tabla-empleados");
  const btnNuevoEmpleado = document.getElementById("btnNuevoEmpleado");
  const formEmpleado = document.getElementById("form-empleado");
  const tituloForm = document.getElementById("titulo-form");
  const modalEmpleado = new bootstrap.Modal(
    document.getElementById("modalEmpleado")
  );

  // Mostrar empleados en la tabla
  function renderizarEmpleados() {
    tablaEmpleados.innerHTML = "";

    if (empleados.length === 0) {
      tablaEmpleados.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">No hay empleados registrados</td>
                </tr>
            `;
      return;
    }

    empleados.forEach((empleado, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td>${empleado.nombre}</td>
                <td>${empleado.email}</td>
                <td>${empleado.telefono}</td>
                
                <td>
                    <button class="btn btn-editar btn-accion" data-id="${index}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-eliminar btn-accion" data-id="${index}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
      tablaEmpleados.appendChild(tr);
    });

    // Eventos de los botones
    document.querySelectorAll(".btn-editar").forEach((btn) => {
      btn.addEventListener("click", editarEmpleado);
    });

    document.querySelectorAll(".btn-eliminar").forEach((btn) => {
      btn.addEventListener("click", eliminarEmpleado);
    });
  }

  // Mostrar formulario para nuevo empleado
  function mostrarFormularioNuevo() {
    tituloForm.textContent = "Crear Empleado";
    formEmpleado.reset();
    document.getElementById("indice-edicion").value = "";
    modalEmpleado.show();
  }

  // Editar empleado existente
  function editarEmpleado(e) {
    const index = e.currentTarget.getAttribute("data-id");
    const empleado = empleados[index];

    tituloForm.textContent = "Editar Empleado";
    document.getElementById("indice-edicion").value = index;
    document.getElementById("nombreEmpleado").value = empleado.nombre;
    document.getElementById("emailEmpleado").value = empleado.email;
    document.getElementById("telefonoEmpleado").value = empleado.telefono;

    modalEmpleado.show();
  }

  // Eliminar empleado
  function eliminarEmpleado(e) {
    const index = e.currentTarget.getAttribute("data-id");
    const empleado = empleados[index];
    let mensaje = "¿Estás seguro de que quieres eliminar este empleado?";
    let tieneTurnos = false;

    // Validamos si el empleado tiene turnos asignados
    turnos.forEach((element) => {
      if (element.empleado == empleado.nombre) {
        mensaje = "El empleado tiene turnos ¿Seguro que quieres eliminarlo?";
        tieneTurnos = true;
      }
    });

    if (confirm(mensaje)) {
      const index = e.currentTarget.getAttribute("data-id");
      empleados.splice(index, 1);
      guardarEmpleados();
      renderizarEmpleados();
      if (tieneTurnos == true) {
        turnos.forEach((element) => {
          if (element.empleado == empleado.nombre) {
            element.empleado = "";
          }
        });
        localStorage.setItem('turnos', JSON.stringify(turnos));
      }
    }
  }

  // Guardar empleado (se usa la misma funcion para un empleado nuevo o editado)
  function guardarEmpleado(e) {
    e.preventDefault();

    const indexEdicion = document.getElementById("indice-edicion").value;
    const empleado = {
      nombre: document.getElementById("nombreEmpleado").value,
      email: document.getElementById("emailEmpleado").value,
      telefono: document.getElementById("telefonoEmpleado").value,
    };

    if (indexEdicion === "") {
      // Nuevo empleado
      empleados.push(empleado);
    } else {
      // Editar empleado existente
      empleados[indexEdicion] = empleado;
    }

    guardarEmpleados();
    renderizarEmpleados();
    modalEmpleado.hide();
  }

  // Guardar en localStorage
  function guardarEmpleados() {
    localStorage.setItem("empleados", JSON.stringify(empleados));
  }

  // Event listeners
  btnNuevoEmpleado.addEventListener("click", mostrarFormularioNuevo);
  formEmpleado.addEventListener("submit", guardarEmpleado);

  // Inicializar
  renderizarEmpleados();
})();
