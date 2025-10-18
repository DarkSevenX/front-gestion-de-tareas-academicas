# Gestor de Proyectos y Tareas Académicas (Frontend)

Este proyecto es una aplicación de gestión de proyectos y tareas académicas en tiempo real, construida con React, TypeScript y Vite. Cuenta con autenticación de usuario, gestión de tareas y funcionalidades de chat en tiempo real.

## Características

*   **Autenticación de Usuario**: Inicio de sesión y registro de usuarios seguros.
*   **Gestión de Tareas**: Crea, visualiza y gestiona tareas y proyectos académicos.
*   **Chat en Tiempo Real**: Comunícate con otros usuarios en tiempo real.
*   **Diseño Adaptable**: Construido con Tailwind CSS para una interfaz de usuario moderna y adaptable.

## Tecnologías Utilizadas

*   **Frontend**:
    *   React: Una librería de JavaScript para construir interfaces de usuario.
    *   TypeScript: Un superconjunto tipado de JavaScript que compila a JavaScript plano.
    *   Vite: Una herramienta de construcción rápida que proporciona una experiencia de desarrollo ultrarrápida.
    *   Tailwind CSS: Un framework CSS utility-first para construir rápidamente diseños personalizados.
    *   Zustand: Una solución de gestión de estado pequeña, rápida y escalable.
    *   Socket.IO Client: Para comunicación bidireccional basada en eventos en tiempo real.
*   **Herramientas**:
    *   ESLint: Para identificar y reportar patrones encontrados en el código ECMAScript/JavaScript.
    *   Prettier: Para formateo de código.

## Estructura del Proyecto

```
.
├── public/
├── src/
│   ├── components/       # Componentes de UI reutilizables (AuthForm, Chat, TaskList, etc.)
│   ├── contexts/         # Contextos de React para la gestión del estado global (ej. AuthContext)
│   ├── lib/              # Funciones de utilidad e integraciones de API (ej. api.ts, socket.ts)
│   ├── App.tsx           # Componente principal de la aplicación
│   ├── main.tsx          # Punto de entrada de la aplicación React
│   └── index.css         # Archivo CSS principal, incluyendo las importaciones de Tailwind CSS
├── .gitignore
├── package.json          # Dependencias y scripts del proyecto
├── tsconfig.json         # Configuración de TypeScript
├── vite.config.ts        # Configuración de construcción de Vite
├── tailwind.config.js    # Configuración de Tailwind CSS
├── postcss.config.js     # Configuración de PostCSS
└── ...
```

## Componentes Clave

*   **`AuthForm.tsx`**: Gestiona el inicio de sesión y el registro de usuarios.
*   **`Chat.tsx`**: Gestiona la funcionalidad de chat en tiempo real.
*   **`TaskList.tsx`**: Muestra y gestiona la lista de tareas.
*   **`CreateTaskModal.tsx`**: Modal para crear nuevas tareas.
*   **`EditTaskModal.tsx`**: Modal para editar tareas existentes.
*   **`TaskDetailModal.tsx`**: Modal para ver los detalles de una tarea.
*   **`Layout.tsx`**: Proporciona el diseño general y la navegación de la aplicación.
*   **`Notifications.tsx`**: Muestra notificaciones toast.
*   **`AuthContext.tsx`**: Gestiona el estado de autenticación del usuario globalmente.
*   **`api.ts`**: Contiene funciones para interactuar con la API del backend.
*   **`socket.ts`**: Gestiona las conexiones WebSocket para las características en tiempo real.

## Configuración e Instalación

Para poner el proyecto en marcha en tu máquina local, sigue estos pasos:

1.  **Clona el repositorio**:
    ```bash
    git clone https://github.com/DarkSevenX/front-gestion-de-tareas-academicas.git
    cd front-gestion-de-tareas-academicas.git
    ```

2.  **Instala las dependencias**:
    ```bash
    npm install
    ```

3.  **Ejecuta el servidor de desarrollo**:
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:5173` (o en otro puerto si el 5173 está en uso).

## Construcción para Producción

Para construir la aplicación para producción, ejecuta:

```bash
npm run build
```
Esto creará un directorio `dist` con la construcción optimizada para producción.

## Linting

Para ejecutar ESLint y verificar problemas de calidad de código:

```bash
npm run lint
```
