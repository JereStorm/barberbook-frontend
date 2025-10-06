# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).


# Sistema de Administración de Turnos para Peluquería

## Nombre del Proyecto
Turnos Peluquería – Frontend

## Descripción

Este proyecto es una aplicación web enfocada en la **gestión de turnos y empleados** para una peluquería, desarrollada como trabajo práctico para la materia de Programación.  
La aplicación permite a los peluqueros o administradores iniciar sesión, cargar turnos de clientes, asociar empleados, y mantener una agenda organizada.

### Características principales

- Login con validación básica
- CRUD completo de turnos:
  - Crear, editar y eliminar turnos
  - Asignar empleados a turnos o dejarlos sin asignar
- CRUD completo de empleados:
  - Crear, editar y eliminar empleados
  - Validaciones asociadas a turnos existentes
- Navegación entre pantallas
- Diseño responsive con Bootstrap
- Simulación de almacenamiento en memoria (o `localStorage`)

---

## Instalación

No requiere instalación de dependencias externas. Solo necesitas un navegador moderno.  
Cloná o descargá el proyecto y abrí el archivo `index.html` en tu navegador.

### Opcional: Servidor local para desarrollo

Si querés levantarlo con un servidor local simple:

1. Cloná el repositorio:
   ```bash
   git clone https://github.com/tuusuario/turnos-peluqueria.git
2. Ingresa al proyecto:
   ```bash
   cd turnos-peluqueria
3. Usá una extensión como Live Server (VS Code) o corré:
   ```bash
   npx serve .

## Uso

1. Abrí index.html  
2. Iniciá sesión con las credenciales predefinidas (Usuario: admin@peluqueria.com, contraseña: 1234)  
3. Usá el menú de navegación para:
   - Gestionar turnos
   - Gestionar empleados  
4. Podés crear, editar o eliminar desde formularios y tablas.  
5. La información se guarda en memoria o en localStorage.

### Documentacion:

- Presentacion: https://www.canva.com/design/DAGiN-Z6BJY/7ekvPEv_fIHH8W8yAe-MTA/edit?utm_content=DAGiN-Z6BJY&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton
- Google Drive: https://drive.google.com/drive/folders/1iNgk87ktPxIVHVjKhX8JX5RhkVyxDoiI?usp=sharing
- Jira: https://proyecto-fip-grupo-28.atlassian.net/jira/software/projects/SCRUM/boards/1/backlog?atlOrigin=eyJpIjoiZWM0YmI1MTY5MzkwNDQxNzk1YzFkOWQwZmM0OTMwYWMiLCJwIjoiaiJ9
- Figma: https://www.figma.com/design/wnLUC1FCfYv7Dk45079Jni/Maquetado?node-id=0-1&t=6iHRilAAuMIV8MKK-1

### Requisitos de aprobación

- Aplicacion navegable con al menos 3 pantallas.  
- Desarrollo aplicando buenas practicas de git (branches específicas de desarrollo para cada contribuidor).  
- Una sería un LogIn, las otras dos serían de libre elección siempre y cuando contengan el formato CRUD (para poder practicar backend).  
- Solo sería la parte de Front End de momento.  
- Tema a libre elección.  

## Licencia

Este proyecto es de uso educativo y no tiene fines comerciales.  
Podés modificarlo y distribuirlo bajo la licencia MIT.  
© 2025 – Grupo de Programación – Turnos Peluquería.
