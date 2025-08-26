# Sistema PLD - Prevención de Lavado de Dinero

Sistema completo para la gestión de alertas y generación de archivos para declaraciones de Prevención de Lavado de Dinero según la Ley Antilavado 2025.

## Características

- Sistema de autenticación de usuarios
- Dashboard con resumen de actividad
- Módulos para diferentes tipos de declaraciones:
  - Datos Generales
  - Enajenación de Bienes
  - Adquisición de Bienes
  - Omisión de Presentación
  - Identificación de Socios o Accionistas
  - Aviso de Actividades Vulnerables
- Gestión de alertas con umbrales configurables
- Sistema de configuración y administración de usuarios
- Generación de archivos TXT para declaraciones

## Instalación

1. Clonar el repositorio
2. Abrir el archivo `index.html` en un navegador web
3. Iniciar sesión con las credenciales predeterminadas:
   - Usuario: `admin`, Contraseña: `admin123`
   - Usuario: `usuario`, Contraseña: `usuario123`

## Estructura de archivos

- `index.html` - Página principal del sistema
- `styles.css` - Estilos CSS para toda la aplicación
- `script.js` - Lógica JavaScript de la aplicación
- `README.md` - Este archivo de documentación

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript (ES6+)
- LocalStorage para persistencia de datos

## Funcionalidades principales

### Autenticación
- Login con validación de usuarios
- Logout y gestión de sesiones

### Dashboard
- Resumen de declaraciones por módulo
- Alertas recientes
- Operaciones recientes con indicadores de riesgo

### Módulos de declaración
- Formularios completos para cada tipo de declaración
- Secciones plegables para mejor organización
- Secciones repetitivas para datos múltiples
- Validación de campos obligatorios
- Generación de archivos TXT

### Gestión de alertas
- Configuración de umbrales para operaciones
- Alertas automáticas basadas en montos
- Reportes de alertas generados

### Configuración
- Administración de usuarios
- Configuración general del sistema
- Opciones de backup y mantenimiento

## Navegadores compatibles

- Chrome (recomendado)
- Firefox
- Safari
- Edge

## Notas de desarrollo

Este sistema utiliza localStorage para persistir datos, por lo que toda la información se almacena localmente en el navegador del usuario. Para un entorno de producción, se recomienda implementar una base de datos backend.

## Licencia

Este proyecto está bajo la Licencia MIT.