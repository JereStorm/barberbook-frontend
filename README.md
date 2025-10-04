
# BarberBook – Frontend

## Descripción

Este proyecto es una **aplicación web para la gestión de turnos en peluquerías y barberías**. Forma parte del desarrollo de **BarberBook**, el sistema integral que incluye frontend y backend.

La aplicación está orientada a recepcionistas, administradores y empleados de un salón, permitiéndoles organizar de manera sencilla los turnos, clientes y servicios que ofrece la peluquería.

Su objetivo principal es **mejorar la eficiencia en la administración de citas**, asegurando que cada empleado, cliente y servicio queden correctamente registrados y asociados.

---

## Características principales

* **Autenticación de usuarios** con roles diferenciados (administrador, recepcionista, empleado).
* **Gestión de clientes**: registro de información de contacto.
* **Gestión de empleados**: creación, edición, activación/desactivación.
* **Gestión de servicios**: alta, edición y control de disponibilidad de los servicios del salón.
* **Agenda de turnos**:

  * Crear turnos seleccionando cliente, empleado, servicio, fecha y hora.
  * Reprogramar turnos (cambio de empleado, horario o servicio).
  * Cancelar turnos marcando estado como `canceled`.
* **Historial y trazabilidad**: cada turno guarda quién lo creó y lo modificó.
* **Interfaz intuitiva y responsive**, pensada para usarse tanto en dispositivos móviles como en escritorio.

---

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/tuusuario/turnos-peluqueria-frontend.git
cd turnos-peluqueria-frontend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Levantar el servidor local

```bash
npm run dev
```

### 4. Configurar variables de entorno

Crear archivo .env en la raiz del proyecto con las siguientes variables:

REACT_APP_API_URL=http://localhost:3001/

REACT_APP_VERSION=1.0.0

---

## Uso

1. Iniciar sesión con credenciales válidas según el rol asignado (ejemplo: administrador, recepcionista).
2. Acceder al menú principal para:

   * 📅 **Gestionar turnos**.
   * 👤 **Gestionar clientes**.
   * 💼 **Gestionar empleados**.
   * ✂️ **Gestionar servicios**.
3. Operar con formularios y tablas para crear, editar, cancelar o listar información.

---

## Documentación y recursos

* 📑 [Presentación en Canva](https://www.canva.com/design/DAGiN-Z6BJY/7ekvPEv_fIHH8W8yAe-MTA/edit)
* 📁 [Google Drive](https://drive.google.com/drive/folders/1iNgk87ktPxIVHVjKhX8JX5RhkVyxDoiI?usp=sharing)
* 🗂 [Jira – Gestión del proyecto](https://proyecto-fip-grupo-28.atlassian.net/jira/software/projects/SCRUM/boards/1/backlog)
* 🎨 [Figma – Maquetado UI](https://www.figma.com/design/wnLUC1FCfYv7Dk45079Jni/Maquetado?node-id=0-1)

---

## Requisitos de aprobación

* La aplicación debe ser navegable con al menos **3 pantallas funcionales**.
* Cada pantalla debe incluir al menos un **CRUD completo** (crear, leer, actualizar, eliminar).
* El flujo principal de gestión de turnos debe estar implementado.
* El sistema debe aplicar **buenas prácticas de Git y trabajo en equipo**.
* La interfaz debe ser **usable y responsive**.

---

## Licencia

Este proyecto es de uso **educativo** y no tiene fines comerciales.
Podés modificarlo y distribuirlo bajo la licencia **MIT**.

© 2025 – Grupo 28 – BarberBook.
