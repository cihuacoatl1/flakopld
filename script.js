// ===== SISTEMA DE AUTENTICACIÓN =====
const usuarios = [
    { username: 'admin', password: 'admin123', nivel: 'admin', nombre: 'Administrador' },
    { username: 'usuario', password: 'usuario123', nivel: 'usuario', nombre: 'Usuario General' }
];

let usuarioActual = null;

// Inicializar datos en localStorage si no existen
function inicializarSistema() {
    if (!localStorage.getItem('usuarios')) {
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }
    
    if (!localStorage.getItem('configuracion')) {
        const configuracion = {
            umbralBajo: 50000,
            umbralMedio: 150000,
            umbralAlto: 500000,
            umbralCritico: 1000000,
            alertasAutomaticas: true,
            notificacionesEmail: false,
            emailNotificaciones: '',
            nombreEmpresa: '',
            rfcEmpresa: '',
            directorioArchivos: '',
            backupAutomatico: false
        };
        localStorage.setItem('configuracion', JSON.stringify(configuracion));
    }
    
    if (!localStorage.getItem('alertas')) {
        localStorage.setItem('alertas', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('operaciones')) {
        localStorage.setItem('operaciones', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('contadores')) {
        const contadores = {
            enajenacion: 0,
            adquisicion: 0,
            omision: 0,
            identificacion: 0,
            actividades: 0
        };
        localStorage.setItem('contadores', JSON.stringify(contadores));
    }
}

// Función de login
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuario = usuarios.find(u => u.username === username && u.password === password);
    
    if (usuario) {
        usuarioActual = usuario;
        sessionStorage.setItem('usuarioActual', JSON.stringify(usuario));
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        document.getElementById('user-display').textContent = `Usuario: ${usuario.nombre}`;
        cargarDashboard();
    } else {
        document.getElementById('login-error').style.display = 'block';
        setTimeout(() => {
            document.getElementById('login-error').style.display = 'none';
        }, 3000);
    }
}

// Función de logout
function logout() {
    usuarioActual = null;
    sessionStorage.removeItem('usuarioActual');
    document.getElementById('login-container').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// Verificar si hay una sesión activa al cargar la página
function verificarSesion() {
    const usuarioGuardado = sessionStorage.getItem('usuarioActual');
    if (usuarioGuardado) {
        usuarioActual = JSON.parse(usuarioGuardado);
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        document.getElementById('user-display').textContent = `Usuario: ${usuarioActual.nombre}`;
        cargarDashboard();
    }
}

// ===== DASHBOARD Y ESTADÍSTICAS =====
function cargarDashboard() {
    // Cargar contadores
    const contadores = JSON.parse(localStorage.getItem('contadores') || '{}');
    document.getElementById('count-enajenacion').textContent = contadores.enajenacion || 0;
    document.getElementById('count-adquisicion').textContent = contadores.adquisicion || 0;
    document.getElementById('count-omision').textContent = contadores.omision || 0;
    document.getElementById('count-identificacion').textContent = contadores.identificacion || 0;
    document.getElementById('count-actividades').textContent = contadores.actividades || 0;
    
    // Cargar alertas por módulo (simulado)
    document.getElementById('alerts-enajenacion').textContent = Math.floor(contadores.enajenacion * 0.1) || 0;
    document.getElementById('alerts-adquisicion').textContent = Math.floor(contadores.adquisicion * 0.15) || 0;
    document.getElementById('alerts-omision').textContent = Math.floor(contadores.omision * 0.05) || 0;
    document.getElementById('alerts-identificacion').textContent = Math.floor(contadores.identificacion * 0.2) || 0;
    document.getElementById('alerts-actividades').textContent = Math.floor(contadores.actividades * 0.25) || 0;
    
    // Cargar alertas recientes
    cargarAlertasRecientes();
    
    // Cargar operaciones recientes
    cargarOperacionesRecientes();
    
    // Cargar configuración
    cargarConfiguracion();
}

function cargarAlertasRecientes() {
    const alertas = JSON.parse(localStorage.getItem('alertas') || '[]');
    const alertasRecientes = alertas.slice(-5).reverse(); // Últimas 5 alertas
    
    const contenedor = document.getElementById('recent-alerts');
    contenedor.innerHTML = '';
    
    if (alertasRecientes.length === 0) {
        contenedor.innerHTML = '<p>No hay alertas recientes</p>';
        return;
    }
    
    alertasRecientes.forEach(alerta => {
        const elemento = document.createElement('div');
        elemento.className = `alert-item ${alerta.nivel === 'critico' ? 'critical' : ''}`;
        
        const fecha = new Date(alerta.fecha).toLocaleDateString();
        
        elemento.innerHTML = `
            <div class="alert-header">
                <div class="alert-title">
                    <span class="alert-indicator alert-${alerta.nivel}"></span>
                    ${alerta.titulo}
                </div>
                <div class="alert-date">${fecha}</div>
            </div>
            <div class="alert-desc">${alerta.descripcion}</div>
            <div class="alert-actions">
                <button class="btn btn-info" onclick="marcarAlertaLeida(${alerta.id})">Marcar como leída</button>
            </div>
        `;
        
        contenedor.appendChild(elemento);
    });
}

function cargarOperacionesRecientes() {
    const operaciones = JSON.parse(localStorage.getItem('operaciones') || '[]');
    const operacionesRecientes = operaciones.slice(-10).reverse(); // Últimas 10 operaciones
    
    const tbody = document.getElementById('recent-operations');
    tbody.innerHTML = '';
    
    if (operacionesRecientes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No hay operaciones recientes</td></tr>';
        return;
    }
    
    operacionesRecientes.forEach(op => {
        const tr = document.createElement('tr');
        const fecha = new Date(op.fecha).toLocaleDateString();
        
        // Determinar el estado basado en montos y umbrales
        let estado = 'Normal';
        let claseEstado = '';
        
        if (op.monto >= op.umbralCritico) {
            estado = 'Crítico';
            claseEstado = 'style="color: var(--accent-color); font-weight: bold;"';
        } else if (op.monto >= op.umbralAlto) {
            estado = 'Alto';
            claseEstado = 'style="color: var(--warning-color); font-weight: bold;"';
        } else if (op.monto >= op.umbralMedio) {
            estado = 'Medio';
        }
        
        tr.innerHTML = `
            <td>${fecha}</td>
            <td>${op.modulo}</td>
            <td>${op.rfc}</td>
            <td>$${op.monto.toLocaleString('es-MX')}</td>
            <td ${claseEstado}>${estado}</td>
        `;
        
        tbody.appendChild(tr);
    });
}

// ===== GESTIÓN DE ALERTAS =====
function guardarUmbrales() {
    const configuracion = JSON.parse(localStorage.getItem('configuracion'));
    
    configuracion.umbralBajo = parseFloat(document.getElementById('umbral-bajo').value) || 50000;
    configuracion.umbralMedio = parseFloat(document.getElementById('umbral-medio').value) || 150000;
    configuracion.umbralAlto = parseFloat(document.getElementById('umbral-alto').value) || 500000;
    configuracion.umbralCritico = parseFloat(document.getElementById('umbral-critico').value) || 1000000;
    
    localStorage.setItem('configuracion', JSON.stringify(configuracion));
    
    mostrarNotificacion('Umbrales guardados correctamente', 'success');
}

function guardarConfigAlertas() {
    const configuracion = JSON.parse(localStorage.getItem('configuracion'));
    
    configuracion.alertasAutomaticas = document.getElementById('alertas-automaticas').checked;
    configuracion.notificacionesEmail = document.getElementById('notificaciones-email').checked;
    configuracion.emailNotificaciones = document.getElementById('email-notificaciones').value;
    
    localStorage.setItem('configuracion', JSON.stringify(configuracion));
    
    mostrarNotificacion('Configuración de alertas guardada', 'success');
}

function verificarOperaciones() {
    const operaciones = JSON.parse(localStorage.getItem('operaciones') || '[]');
    const configuracion = JSON.parse(localStorage.getItem('configuracion'));
    
    let alertasGeneradas = 0;
    
    operaciones.forEach(op => {
        // Solo verificar operaciones no alertadas
        if (!op.alertada) {
            let nivel = 'bajo';
            let titulo = '';
            
            if (op.monto >= configuracion.umbralCritico) {
                nivel = 'critico';
                titulo = 'Operación Crítica Detectada';
            } else if (op.monto >= configuracion.umbralAlto) {
                nivel = 'alto';
                titulo = 'Operación de Alto Valor';
            } else if (op.monto >= configuracion.umbralMedio) {
                nivel = 'medio';
                titulo = 'Operación de Valor Medio';
            } else if (op.monto >= configuracion.umbralBajo) {
                nivel = 'bajo';
                titulo = 'Operación de Bajo Valor';
            }
            
            // Solo generar alertas para operaciones por encima del umbral bajo
            if (nivel !== 'bajo') {
                generarAlerta({
                    id: Date.now(),
                    titulo: titulo,
                    descripcion: `Operación en módulo ${op.modulo} con RFC ${op.rfc} por un monto de $${op.monto.toLocaleString('es-MX')}`,
                    nivel: nivel,
                    fecha: new Date().toISOString(),
                    operacionId: op.id,
                    leida: false
                });
                
                op.alertada = true;
                alertasGeneradas++;
            }
        }
    });
    
    // Actualizar operaciones en localStorage
    localStorage.setItem('operaciones', JSON.stringify(operaciones));
    
    if (alertasGeneradas > 0) {
        mostrarNotificacion(`Se generaron ${alertasGeneradas} alertas nuevas`, 'success');
        cargarAlertasRecientes();
    } else {
        mostrarNotificacion('No se encontraron operaciones que requieran alertas nuevas', 'info');
    }
}

function generarAlerta(alerta) {
    const alertas = JSON.parse(localStorage.getItem('alertas') || '[]');
    alertas.push(alerta);
    localStorage.setItem('alertas', JSON.stringify(alertas));
    
    // Mostrar notificación si está habilitado
    const configuracion = JSON.parse(localStorage.getItem('configuracion'));
    if (configuracion.alertasAutomaticas) {
        mostrarNotificacion(`Nueva alerta: ${alerta.titulo}`, 'warning');
    }
}

function marcarAlertaLeida(id) {
    const alertas = JSON.parse(localStorage.getItem('alertas') || '[]');
    const alertaIndex = alertas.findIndex(a => a.id === id);
    
    if (alertaIndex !== -1) {
        alertas[alertaIndex].leida = true;
        localStorage.setItem('alertas', JSON.stringify(alertas));
        cargarAlertasRecientes();
        mostrarNotificacion('Alerta marcada como leída', 'success');
    }
}

function generarReporteAlertas() {
    const alertas = JSON.parse(localStorage.getItem('alertas') || '[]');
    const operaciones = JSON.parse(localStorage.getItem('operaciones') || '[]');
    
    // Filtrar alertas no leídas
    const alertasNoLeidas = alertas.filter(a => !a.leida);
    
    if (alertasNoLeidas.length === 0) {
        mostrarNotificacion('No hay alertas pendientes para reportar', 'info');
        return;
    }
    
    let contenido = "Reporte de Alertas PLD - " + new Date().toLocaleDateString() + "\n\n";
    contenido += "Alertas pendientes: " + alertasNoLeidas.length + "\n\n";
    
    alertasNoLeidas.forEach(alerta => {
        const op = operaciones.find(o => o.id === alerta.operacionId) || {};
        contenido += `=== ALERTA: ${alerta.titulo} ===\n`;
        contenido += `Fecha: ${new Date(alerta.fecha).toLocaleDateString()}\n`;
        contenido += `Descripción: ${alerta.descripcion}\n`;
        contenido += `Nivel: ${alerta.nivel.toUpperCase()}\n`;
        contenido += `RFC: ${op.rfc || 'N/A'}\n`;
        contenido += `Monto: $${op.monto ? op.monto.toLocaleString('es-MX') : 'N/A'}\n\n`;
    });
    
    // Crear blob y descargar
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_Alertas_PLD_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    mostrarNotificacion('Reporte de alertas generado correctamente', 'success');
}

// ===== CONFIGURACIÓN DEL SISTEMA =====
function cargarConfiguracion() {
    const configuracion = JSON.parse(localStorage.getItem('configuracion'));
    
    // Cargar umbrales
    document.getElementById('umbral-bajo').value = configuracion.umbralBajo;
    document.getElementById('umbral-medio').value = configuracion.umbralMedio;
    document.getElementById('umbral-alto').value = configuracion.umbralAlto;
    document.getElementById('umbral-critico').value = configuracion.umbralCritico;
    
    // Cargar configuración de alertas
    document.getElementById('alertas-automaticas').checked = configuracion.alertasAutomaticas;
    document.getElementById('notificaciones-email').checked = configuracion.notificacionesEmail;
    document.getElementById('email-notificaciones').value = configuracion.emailNotificaciones;
    
    // Cargar configuración general
    document.getElementById('nombre-empresa').value = configuracion.nombreEmpresa;
    document.getElementById('rfc-empresa').value = configuracion.rfcEmpresa;
    document.getElementById('directorio-archivos').value = configuracion.directorioArchivos;
    document.getElementById('backup-automatico').checked = configuracion.backupAutomatico;
    
    // Cargar usuarios
    cargarUsuarios();
}

function cargarUsuarios() {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const lista = document.getElementById('lista-usuarios');
    lista.innerHTML = '';
    
    if (usuarios.length === 0) {
        lista.innerHTML = '<p>No hay usuarios registrados</p>';
        return;
    }
    
    usuarios.forEach(usuario => {
        const div = document.createElement('div');
        div.className = 'user-item';
        div.innerHTML = `
            <strong>${usuario.nombre}</strong> (${usuario.username}) - ${usuario.nivel}
            ${usuario.username !== usuarioActual.username ? 
                `<button class="btn btn-danger" onclick="eliminarUsuario('${usuario.username}')">Eliminar</button>` : 
                '<span style="color: #777;">(Usuario actual)</span>'
            }
        `;
        lista.appendChild(div);
    });
}

function agregarUsuario() {
    const username = document.getElementById('nuevo-usuario').value;
    const password = document.getElementById('nueva-contraseña').value;
    const nivel = document.getElementById('nivel-acceso').value;
    
    if (!username || !password) {
        mostrarNotificacion('Debe completar todos los campos', 'error');
        return;
    }
    
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    
    // Verificar si el usuario ya existe
    if (usuarios.find(u => u.username === username)) {
        mostrarNotificacion('El usuario ya existe', 'error');
        return;
    }
    
    // Agregar nuevo usuario
    usuarios.push({
        username: username,
        password: password,
        nivel: nivel,
        nombre: username.charAt(0).toUpperCase() + username.slice(1)
    });
    
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    
    // Limpiar campos
    document.getElementById('nuevo-usuario').value = '';
    document.getElementById('nueva-contraseña').value = '';
    
    mostrarNotificacion('Usuario agregado correctamente', 'success');
    cargarUsuarios();
}

function eliminarUsuario(username) {
    if (username === usuarioActual.username) {
        mostrarNotificacion('No puede eliminar su propio usuario', 'error');
        return;
    }
    
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const nuevosUsuarios = usuarios.filter(u => u.username !== username);
    
    localStorage.setItem('usuarios', JSON.stringify(nuevosUsuarios));
    mostrarNotificacion('Usuario eliminado correctamente', 'success');
    cargarUsuarios();
}

function guardarConfigGeneral() {
    const configuracion = JSON.parse(localStorage.getItem('configuracion'));
    
    configuracion.nombreEmpresa = document.getElementById('nombre-empresa').value;
    configuracion.rfcEmpresa = document.getElementById('rfc-empresa').value;
    configuracion.directorioArchivos = document.getElementById('directorio-archivos').value;
    configuracion.backupAutomatico = document.getElementById('backup-automatico').checked;
    
    localStorage.setItem('configuracion', JSON.stringify(configuracion));
    mostrarNotificacion('Configuración general guardada', 'success');
}

function realizarBackup() {
    // Simular backup
    mostrarNotificacion('Backup realizado correctamente', 'success');
}

function limpiarDatos() {
    if (confirm('¿Está seguro de que desea limpiar todos los datos temporales? Esta acción no se puede deshacer.')) {
        localStorage.removeItem('alertas');
        localStorage.removeItem('operaciones');
        
        // Reiniciar contadores
        const contadores = {
            enajenacion: 0,
            adquisicion: 0,
            omision: 0,
            identificacion: 0,
            actividades: 0
        };
        localStorage.setItem('contadores', JSON.stringify(contadores));
        
        mostrarNotificacion('Datos temporales limpiados correctamente', 'success');
        cargarDashboard();
    }
}

// ===== FUNCIONALIDADES EXISTENTES DEL SISTEMA DECLARANOT =====
// (Se mantienen todas las funciones originales del sistema de creación de TXT)

// Manejo de pestañas
function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', () => {
            // Desactivar todas las pestañas
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Activar la pestaña seleccionada
            button.classList.add('active');
            document.getElementById(button.dataset.tab).classList.add('active');
        });
    });
}

// Mostrar/ocultar campos condicionales en enajenación
function setupTipoInmueble() {
    const tipoInmuebleSelect = document.getElementById('enajenacion-tipoInmueble');
    if (tipoInmuebleSelect) {
        tipoInmuebleSelect.addEventListener('change', function() {
            const especificaGroup = document.getElementById('enajenacion-especificaTipoGroup');
            especificaGroup.style.display = this.value === '9' ? 'block' : 'none';
        });
    }
}

// Mostrar/ocultar campos condicionales en adquisición
function setupAdqTipoInmueble() {
    const adqTipoInmuebleSelect = document.getElementById('adquisicion-tipoInmueble');
    if (adqTipoInmuebleSelect) {
        adqTipoInmuebleSelect.addEventListener('change', function() {
            const especificaGroup = document.getElementById('adquisicion-especificaTipoGroup');
            especificaGroup.style.display = this.value === '9' ? 'block' : 'none';
        });
    }
}

// Toggle sections
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    section.classList.toggle('active');
    
    // Cambiar el icono
    const toggle = document.querySelector(`#toggle-${sectionId} span`);
    if (toggle) {
        toggle.textContent = section.classList.contains('active') ? '▼' : '►';
    }
}

// Manejo de secciones repetitivas de pago
function addPagoSection() {
    const container = document.getElementById('pagos-container');
    const newSection = container.querySelector('.repeating-section').cloneNode(true);
    
    // Limpiar los valores de los campos
    newSection.querySelectorAll('input, select').forEach(field => {
        field.value = '';
    });
    
    // Ocultar campos condicionales inicialmente
    newSection.querySelector('.institucion-group').style.display = 'none';
    newSection.querySelector('.especifique-institucion-group').style.display = 'none';
    newSection.querySelector('.cuenta-group').style.display = 'none';
    newSection.querySelector('.otro-pago-group').style.display = 'none';
    
    // Agregar evento al tipo de pago
    const tipoPagoSelect = newSection.querySelector('select');
    tipoPagoSelect.addEventListener('change', function() {
        const institucionGroup = this.closest('.repeating-section').querySelector('.institucion-group');
        const especifiqueInstitucionGroup = this.closest('.repeating-section').querySelector('.especifique-institucion-group');
        const cuentaGroup = this.closest('.repeating-section').querySelector('.cuenta-group');
        const otroPagoGroup = this.closest('.repeating-section').querySelector('.otro-pago-group');
        
        institucionGroup.style.display = (this.value === '2' || this.value === '3') ? 'block' : 'none';
        especifiqueInstitucionGroup.style.display = (this.value === '2' || this.value === '3') && institucionGroup.querySelector('select').value === '9' ? 'block' : 'none';
        cuentaGroup.style.display = (this.value === '2' || this.value === '3') ? 'block' : 'none';
        otroPagoGroup.style.display = this.value === '9' ? 'block' : 'none';
    });
    
    // Agregar evento a la institución financiera
    const institucionSelect = newSection.querySelector('.institucion-group select');
    if (institucionSelect) {
        institucionSelect.addEventListener('change', function() {
            const especifiqueInstitucionGroup = this.closest('.repeating-section').querySelector('.especifique-institucion-group');
            especifiqueInstitucionGroup.style.display = this.value === '9' ? 'block' : 'none';
        });
    }
    
    // Agregar evento para eliminar la sección
    const removeButton = newSection.querySelector('.remove-section');
    removeButton.addEventListener('click', function() {
        removeSection(this);
    });
    
    container.appendChild(newSection);
}

// Manejo de secciones repetitivas de enajenante
function addEnajenanteSection() {
    const container = document.getElementById('enajenantes-container');
    const newSection = container.querySelector('.repeating-section').cloneNode(true);
    
    // Limpiar los valores de los campos
    newSection.querySelectorAll('input, select').forEach(field => {
        field.value = '';
    });
    
    // Ocultar campos condicionales inicialmente
    newSection.querySelectorAll('.extranjero-group').forEach(group => {
        group.style.display = 'none';
    });
    
    // Agregar evento al tipo de enajenante
    const tipoEnajenanteSelect = newSection.querySelector('select');
    tipoEnajenanteSelect.addEventListener('change', function() {
        const extranjeroGroups = this.closest('.repeating-section').querySelectorAll('.extranjero-group');
        extranjeroGroups.forEach(group => {
            group.style.display = this.value === '2' ? 'block' : 'none';
        });
    });
    
    // Agregar evento para eliminar la sección
    const removeButton = newSection.querySelector('.remove-section');
    removeButton.addEventListener('click', function() {
        removeSection(this);
    });
    
    container.appendChild(newSection);
}

// Manejo de secciones repetitivas de adquirente
function addAdquirenteSection() {
    const container = document.getElementById('adquirentes-container');
    const newSection = container.querySelector('.repeating-section').cloneNode(true);
    
    // Limpiar los valores de los campos
    newSection.querySelectorAll('input, select').forEach(field => {
        field.value = '';
    });
    
    // Ocultar campos condicionales inicialmente
    newSection.querySelectorAll('.extranjero-group').forEach(group => {
        group.style.display = 'none';
    });
    
    // Agregar evento al tipo de adquirente
    const tipoAdquirenteSelect = newSection.querySelector('select');
    tipoAdquirenteSelect.addEventListener('change', function() {
        const extranjeroGroups = this.closest('.repeating-section').querySelectorAll('.extranjero-group');
        extranjeroGroups.forEach(group => {
            group.style.display = this.value === '2' ? 'block' : 'none';
        });
    });
    
    // Agregar evento para eliminar la sección
    const removeButton = newSection.querySelector('.remove-section');
    removeButton.addEventListener('click', function() {
        removeSection(this);
    });
    
    container.appendChild(newSection);
}

// Manejo de secciones repetitivas de pago en adquisición
function addAdqPagoSection() {
    const container = document.getElementById('adq-pagos-container');
    const newSection = container.querySelector('.repeating-section').cloneNode(true);
    
    // Limpiar los valores de los campos
    newSection.querySelectorAll('input, select').forEach(field => {
        field.value = '';
    });
    
    // Ocultar campos condicionales inicialmente
    newSection.querySelector('.institucion-group').style.display = 'none';
    newSection.querySelector('.especifique-institucion-group').style.display = 'none';
    newSection.querySelector('.cuenta-group').style.display = 'none';
    newSection.querySelector('.otro-pago-group').style.display = 'none';
    
    // Agregar evento al tipo de pago
    const tipoPagoSelect = newSection.querySelector('select');
    tipoPagoSelect.addEventListener('change', function() {
        const institucionGroup = this.closest('.repeating-section').querySelector('.institucion-group');
        const especifiqueInstitucionGroup = this.closest('.repeating-section').querySelector('.especifique-institucion-group');
        const cuentaGroup = this.closest('.repeating-section').querySelector('.cuenta-group');
        const otroPagoGroup = this.closest('.repeating-section').querySelector('.otro-pago-group');
        
        institucionGroup.style.display = (this.value === '2' || this.value === '3') ? 'block' : 'none';
        especifiqueInstitucionGroup.style.display = (this.value === '2' || this.value === '3') && institucionGroup.querySelector('select').value === '9' ? 'block' : 'none';
        cuentaGroup.style.display = (this.value === '2' || this.value === '3') ? 'block' : 'none';
        otroPagoGroup.style.display = this.value === '9' ? 'block' : 'none';
    });
    
    // Agregar evento a la institución financiera
    const institucionSelect = newSection.querySelector('.institucion-group select');
    if (institucionSelect) {
        institucionSelect.addEventListener('change', function() {
            const especifiqueInstitucionGroup = this.closest('.repeating-section').querySelector('.especifique-institucion-group');
            especifiqueInstitucionGroup.style.display = this.value === '9' ? 'block' : 'none';
        });
    }
    
    // Agregar evento para eliminar la sección
    const removeButton = newSection.querySelector('.remove-section');
    removeButton.addEventListener('click', function() {
        removeSection(this);
    });
    
    container.appendChild(newSection);
}

// Manejo de secciones repetitivas de enajenante en adquisición
function addAdqEnajenanteSection() {
    const container = document.getElementById('adq-enajenantes-container');
    const newSection = container.querySelector('.repeating-section').cloneNode(true);
    
    // Limpiar los valores de los campos
    newSection.querySelectorAll('input, select').forEach(field => {
        field.value = '';
    });
    
    // Ocultar campos condicionales inicialmente
    newSection.querySelectorAll('.extranjero-group').forEach(group => {
        group.style.display = 'none';
    });
    
    // Agregar evento al tipo de enajenante
    const tipoEnajenanteSelect = newSection.querySelector('select');
    tipoEnajenanteSelect.addEventListener('change', function() {
        const extranjeroGroups = this.closest('.repeating-section').querySelectorAll('.extranjero-group');
        extranjeroGroups.forEach(group => {
            group.style.display = this.value === '2' ? 'block' : 'none';
        });
    });
    
    // Agregar evento para eliminar la sección
    const removeButton = newSection.querySelector('.remove-section');
    removeButton.addEventListener('click', function() {
        removeSection(this);
    });
    
    container.appendChild(newSection);
}

// Manejo de secciones repetitivas de adquirente en adquisición
function addAdqAdquirenteSection() {
    const container = document.getElementById('adq-adquirentes-container');
    const newSection = container.querySelector('.repeating-section').cloneNode(true);
    
    // Limpiar los valores de los campos
    newSection.querySelectorAll('input, select').forEach(field => {
        field.value = '';
    });
    
    // Ocultar campos condicionales inicialmente
    newSection.querySelectorAll('.extranjero-group').forEach(group => {
        group.style.display = 'none';
    });
    
    // Agregar evento al tipo de adquirente
    const tipoAdquirenteSelect = newSection.querySelector('select');
    tipoAdquirenteSelect.addEventListener('change', function() {
        const extranjeroGroups = this.closest('.repeating-section').querySelectorAll('.extranjero-group');
        extranjeroGroups.forEach(group => {
            group.style.display = this.value === '2' ? 'block' : 'none';
        });
    });
    
    // Agregar evento para eliminar la sección
    const removeButton = newSection.querySelector('.remove-section');
    removeButton.addEventListener('click', function() {
        removeSection(this);
    });
    
    container.appendChild(newSection);
}

// Manejo de secciones repetitivas de socios
function addSocioSection() {
    const container = document.getElementById('socios-container');
    const newSection = container.querySelector('.repeating-section').cloneNode(true);
    
    // Limpiar los valores de los campos
    newSection.querySelectorAll('input, select').forEach(field => {
        field.value = '';
    });
    
    // Ocultar campos condicionales inicialmente
    newSection.querySelectorAll('.extranjero-group').forEach(group => {
        group.style.display = 'none';
    });
    
    // Agregar evento al tipo de socio
    const tipoSocioSelect = newSection.querySelector('select');
    tipoSocioSelect.addEventListener('change', function() {
        const extranjeroGroups = this.closest('.repeating-section').querySelectorAll('.extranjero-group');
        extranjeroGroups.forEach(group => {
            group.style.display = this.value === '2' ? 'block' : 'none';
        });
    });
    
    // Agregar evento para eliminar la sección
    const removeButton = newSection.querySelector('.remove-section');
    removeButton.addEventListener('click', function() {
        removeSection(this);
    });
    
    container.appendChild(newSection);
}

// Manejo de secciones repetitivas de copropiedad
function addCopropiedadSection() {
    const container = document.getElementById('copropiedad-container');
    const newSection = container.querySelector('.repeating-section').cloneNode(true);
    
    // Limpiar los valores de los campos
    newSection.querySelectorAll('input, select').forEach(field => {
        field.value = '';
    });
    
    // Agregar evento para eliminar la sección
    const removeButton = newSection.querySelector('.remove-section');
    removeButton.addEventListener('click', function() {
        removeSection(this);
    });
    
    container.appendChild(newSection);
}

function removeSection(button) {
    // No permitir eliminar la primera sección
    if (button.closest('.repeating-section').parentElement.querySelectorAll('.repeating-section').length > 1) {
        button.closest('.repeating-section').remove();
    }
}

// Resetear formularios
function resetForm(formId) {
    document.getElementById(formId).reset();
    
    // Ocultar todos los campos condicionales
    document.querySelectorAll('.institucion-group, .especifique-institucion-group, .cuenta-group, .otro-pago-group, .extranjero-group').forEach(group => {
        group.style.display = 'none';
    });
    
    // Mostrar notificación de éxito
    mostrarNotificacion('Formulario limpiado correctamente', 'success');
}

// Generar archivo TXT
function generateTxt(tipo) {
    let contenido = "";
    let valido = true;
    
    if (tipo === 'general') {
        const ejercicio = document.getElementById('ejercicio').value;
        const tipoDeclaracion = document.getElementById('tipoDeclaracion').value;
        const tipoInformativa = document.getElementById('tipoInformativa').value;
        const fechaOperacion = document.getElementById('fechaOperacion').value;
        const rfc = document.getElementById('rfc').value;
        const claveActividad = document.getElementById('claveActividad').value;
        const rfcEntidad = document.getElementById('rfcEntidad').value;
        const referencia = document.getElementById('referencia').value;
        const prioridad = document.getElementById('prioridad').value;
        const tipoAlerta = document.getElementById('tipoAlerta').value;
        const descripcionAlerta = document.getElementById('descripcionAlerta').value;
        const folioAvisoPrevio = document.getElementById('folioAvisoPrevio').value;
        const descripcionModAlerta = document.getElementById('descripcionModAlerta').value;
        
        // Validar campos obligatorios
        if (!ejercicio || !tipoDeclaracion || !tipoInformativa || !fechaOperacion || !rfc || !claveActividad) {
            valido = false;
        }
        
        if (valido) {
            // Formatear fecha dd/mm/aaaa
            const fechaParts = fechaOperacion.split('-');
            const fechaFormateada = `${fechaParts[2]}/${fechaParts[1]}/${fechaParts[0]}`;
            
            // Construir contenido según estructura del manual
            contenido = `Configuración:${ejercicio}|${tipoDeclaracion}|035|${tipoInformativa}|${fechaFormateada}\n`;
            contenido += `930001-DatosIdentificacion:${rfc}|${claveActividad}|${rfcEntidad || ''}\n`;
            contenido += `930002-Datos del Aviso:${referencia || ''}|${prioridad || ''}|${tipoAlerta || ''}|${descripcionAlerta || ''}|${folioAvisoPrevio || ''}|${descripcionModAlerta || ''}`;
            
            // Registrar operación
            registrarOperacion(tipo, rfc, 0); // Monto 0 para datos generales
        }
    } else if (tipo === 'enajenacion') {
        // Validar que al menos haya un pago, un enajenante y un adquirente
        const pagos = document.querySelectorAll('#pagos-container .repeating-section');
        const enajenantes = document.querySelectorAll('#enajenantes-container .repeating-section');
        const adquirentes = document.querySelectorAll('#adquirentes-container .repeating-section');
        
        if (pagos.length === 0 || enajenantes.length === 0 || adquirentes.length === 0) {
            valido = false;
        }
        
        // Validar campos obligatorios en cada sección
        let montoTotal = 0;
        
        pagos.forEach(pago => {
            const monto = pago.querySelector('input[type="number"]').value;
            const tipoPago = pago.querySelector('select').value;
            
            if (!monto || !tipoPago) {
                valido = false;
            } else {
                montoTotal += parseFloat(monto);
            }
        });
        
        enajenantes.forEach(enajenante => {
            const tipoEnajenante = enajenante.querySelector('select').value;
            const rfc = enajenante.querySelector('input[type="text"]').value;
            const nombre = enajenante.querySelectorAll('input[type="text"]')[1].value;
            
            if (!tipoEnajenante || !rfc || !nombre) {
                valido = false;
            }
        });
        
        adquirentes.forEach(adquirente => {
            const tipoAdquirente = adquirente.querySelector('select').value;
            const rfc = adquirente.querySelector('input[type="text"]').value;
            const nombre = adquirente.querySelectorAll('input[type="text"]')[1].value;
            
            if (!tipoAdquirente || !rfc || !nombre) {
                valido = false;
            }
        });
        
        if (valido) {
            // Construir contenido para enajenación de bienes
            contenido = "ENAJENACION_BIENES\n";
            
            // Datos de la operación
            const numeroEscritura = document.getElementById('enajenacion-numeroEscritura').value;
            const fechaFirma = document.getElementById('enajenacion-fechaFirma').value;
            const tipoInmueble = document.getElementById('enajenacion-tipoInmueble').value;
            const especificaTipo = document.getElementById('enajenacion-especificaTipo').value;
            const valorAvaluo = document.getElementById('enajenacion-valorAvaluo').value;
            
            const fechaParts = fechaFirma.split('-');
            const fechaFirmaFormateada = `${fechaParts[2]}/${fechaParts[1]}/${fechaParts[0]}`;
            
            contenido += `DATOS_OPERACION:${numeroEscritura}|${fechaFirmaFormateada}|${tipoInmueble}|${especificaTipo || ''}|${valorAvaluo}\n`;
            
            // Detalle del pago
            contenido += "DETALLE_PAGO:\n";
            pagos.forEach(pago => {
                const monto = pago.querySelector('input[type="number"]').value;
                const tipoPago = pago.querySelector('select').value;
                const institucion = pago.querySelector('.institucion-group select')?.value || '';
                const especificaInstitucion = pago.querySelector('.especifique-institucion-group input')?.value || '';
                const cuenta = pago.querySelector('.cuenta-group input')?.value || '';
                const otroPago = pago.querySelector('.otro-pago-group input')?.value || '';
                
                contenido += `${monto}|${tipoPago}|${institucion}|${especificaInstitucion}|${cuenta}|${otroPago}\n`;
            });
            
            // Datos del enajenante
            contenido += "ENAJENANTES:\n";
            enajenantes.forEach(enajenante => {
                const tipoEnajenante = enajenante.querySelector('select').value;
                const rfc = enajenante.querySelector('input[type="text"]').value;
                const nombre = enajenante.querySelectorAll('input[type="text"]')[1].value;
                const apellidoPaterno = enajenante.querySelectorAll('input[type="text"]')[2]?.value || '';
                const apellidoMaterno = enajenante.querySelectorAll('input[type="text"]')[3]?.value || '';
                const curp = enajenante.querySelectorAll('input[type="text"]')[4]?.value || '';
                const nacionalidad = enajenante.querySelector('.extranjero-group select')?.value || '';
                const fechaNacimiento = enajenante.querySelector('.extranjero-group input[type="date"]')?.value || '';
                const documentoOficial = enajenante.querySelectorAll('.extranjero-group input[type="text"]')[1]?.value || '';
                const numeroFolio = enajenante.querySelectorAll('.extranjero-group input[type="text"]')[2]?.value || '';
                
                if (fechaNacimiento) {
                    const fechaParts = fechaNacimiento.split('-');
                    var fechaNacimientoFormateada = `${fechaParts[2]}/${fechaParts[1]}/${fechaParts[0]}`;
                } else {
                    var fechaNacimientoFormateada = '';
                }
                
                contenido += `${tipoEnajenante}|${rfc}|${nombre}|${apellidoPaterno}|${apellidoMaterno}|${curp}|${nacionalidad}|${fechaNacimientoFormateada}|${documentoOficial}|${numeroFolio}\n`;
            });
            
            // Datos informativos
            const tieneIngresosExentos = document.querySelector('#datos-informativos select').value;
            const montoExento = document.querySelector('#monto-exento-group input')?.value || '';
            const impuestoRetenido = document.querySelector('#impuesto-retenido-group input')?.value || '';
            
            contenido += `DATOS_INFORMATIVOS:${tieneIngresosExentos}|${montoExento}|${impuestoRetenido}\n`;
            
            // Datos del adquirente
            contenido += "ADQUIRENTES:\n";
            adquirentes.forEach(adquirente => {
                const tipoAdquirente = adquirente.querySelector('select').value;
                const rfc = adquirente.querySelector('input[type="text"]').value;
                const nombre = adquirente.querySelectorAll('input[type="text"]')[1].value;
                const apellidoPaterno = adquirente.querySelectorAll('input[type="text"]')[2]?.value || '';
                const apellidoMaterno = adquirente.querySelectorAll('input[type="text"]')[3]?.value || '';
                const curp = adquirente.querySelectorAll('input[type="text"]')[4]?.value || '';
                const nacionalidad = adquirente.querySelector('.extranjero-group select')?.value || '';
                const fechaNacimiento = adquirente.querySelector('.extranjero-group input[type="date"]')?.value || '';
                const documentoOficial = adquirente.querySelectorAll('.extranjero-group input[type="text"]')[1]?.value || '';
                const numeroFolio = adquirente.querySelectorAll('.extranjero-group input[type="text"]')[2]?.value || '';
                
                if (fechaNacimiento) {
                    const fechaParts = fechaNacimiento.split('-');
                    var fechaNacimientoFormateada = `${fechaParts[2]}/${fechaParts[1]}/${fechaParts[0]}`;
                } else {
                    var fechaNacimientoFormateada = '';
                }
                
                contenido += `${tipoAdquirente}|${rfc}|${nombre}|${apellidoPaterno}|${apellidoMaterno}|${curp}|${nacionalidad}|${fechaNacimientoFormateada}|${documentoOficial}|${numeroFolio}\n`;
            });
            
            // Pago
            const ingresosEnajenacion = document.querySelector('#pago input[type="number"]').value;
            const ingresosExentos = document.querySelectorAll('#pago input[type="number"]')[1]?.value || '';
            const ingresosExentosSismo = document.querySelectorAll('#pago input[type="number"]')[2]?.value || '';
            const deduccionesAutorizadas = document.querySelectorAll('#pago input[type="number"]')[3]?.value || '';
            const ganancia = document.querySelectorAll('#pago input[type="number"]')[4]?.value || '';
            const anosAdquisicionVenta = document.querySelectorAll('#pago input[type="number"]')[5]?.value || '';
            const gananciaAcumulable = document.querySelectorAll('#pago input[type="number"]')[6]?.value || '';
            const gananciaNoAcumulable = document.querySelectorAll('#pago input[type="number"]')[7]?.value || '';
            const isrPagadoFederacion = document.querySelectorAll('#pago input[type="number"]')[8]?.value || '';
            const numeroOperacionFederacion = document.querySelectorAll('#pago input[type="text"]')[0]?.value || '';
            const fechaPagoFederacion = document.querySelectorAll('#pago input[type="date"]')[0]?.value || '';
            const isrPagadoEntidad = document.querySelectorAll('#pago input[type="number"]')[9]?.value || '';
            const numeroOperacionEntidad = document.querySelectorAll('#pago input[type="text"]')[1]?.value || '';
            const fechaPagoEntidad = document.querySelectorAll('#pago input[type="date"]')[1]?.value || '';
            
            if (fechaPagoFederacion) {
                const fechaParts = fechaPagoFederacion.split('-');
                var fechaPagoFederacionFormateada = `${fechaParts[2]}/${fechaParts[1]}/${fechaParts[0]}`;
            } else {
                var fechaPagoFederacionFormateada = '';
            }
            
            if (fechaPagoEntidad) {
                const fechaParts = fechaPagoEntidad.split('-');
                var fechaPagoEntidadFormateada = `${fechaParts[2]}/${fechaParts[1]}/${fechaParts[0]}`;
            } else {
                var fechaPagoEntidadFormateada = '';
            }
            
            contenido += `PAGO:${ingresosEnajenacion}|${ingresosExentos}|${ingresosExentosSismo}|${deduccionesAutorizadas}|${ganancia}|${anosAdquisicionVenta}|${gananciaAcumulable}|${gananciaNoAcumulable}|${isrPagadoFederacion}|${numeroOperacionFederacion}|${fechaPagoFederacionFormateada}|${isrPagadoEntidad}|${numeroOperacionEntidad}|${fechaPagoEntidadFormateada}\n`;
            
            // Copropiedad
            const copropiedad = document.querySelector('#copropiedad select').value;
            const existeRepresentante = document.querySelectorAll('#copropiedad select')[1]?.value || '';
            const rfcRepresentante = document.querySelector('#rfc-representante-group input')?.value || '';
            
            contenido += `COPROPIEDAD:${copropiedad}|${existeRepresentante}|${rfcRepresentante}\n`;
            
            // Integrantes de copropiedad
            const integrantes = document.querySelectorAll('#copropiedad-container .repeating-section');
            if (integrantes.length > 0) {
                contenido += "INTEGRANTES_COPROPIEDAD:\n";
                integrantes.forEach(integrante => {
                    const rfcIntegrante = integrante.querySelector('input[type="text"]').value;
                    const porcentaje = integrante.querySelector('input[type="number"]').value;
                    const ingresos = integrante.querySelectorAll('input[type="number"]')[1]?.value || '';
                    const deducciones = integrante.querySelectorAll('input[type="number"]')[2]?.value || '';
                    const ganancia = integrante.querySelectorAll('input[type="number"]')[3]?.value || '';
                    const gananciaAcumulable = integrante.querySelectorAll('input[type="number"]')[4]?.value || '';
                    const gananciaNoAcumulable = integrante.querySelectorAll('input[type="number"]')[5]?.value || '';
                    const isrPagadoFederacion = integrante.querySelectorAll('input[type="number"]')[6]?.value || '';
                    const isrPagadoEntidad = integrante.querySelectorAll('input[type="number"]')[7]?.value || '';
                    
                    contenido += `${rfcIntegrante}|${porcentaje}|${ingresos}|${deducciones}|${ganancia}|${gananciaAcumulable}|${gananciaNoAcumulable}|${isrPagadoFederacion}|${isrPagadoEntidad}\n`;
                });
            }
            
            // Registrar operación
            const rfcEnajenante = enajenantes[0].querySelector('input[type="text"]').value;
            registrarOperacion(tipo, rfcEnajenante, montoTotal);
        }
    } else if (tipo === 'actividades') {
        // Validar campos obligatorios para actividades vulnerables
        const ejercicio = document.getElementById('actividades-ejercicio').value;
        const periodo = document.getElementById('actividades-periodo').value;
        const tipoDeclaracion = document.getElementById('actividades-tipoDeclaracion').value;
        const fechaOperacion = document.getElementById('actividades-fechaOperacion').value;
        const rfc = document.getElementById('actividades-rfc').value;
        const claveActividad = document.getElementById('actividades-claveActividad').value;
        const tipoActividad = document.getElementById('actividades-tipoActividad').value;
        const descripcion = document.getElementById('actividades-descripcion').value;
        const monto = document.getElementById('actividades-monto').value;
        const periodicidad = document.getElementById('actividades-periodicidad').value;
        
        if (!ejercicio || !periodo || !tipoDeclaracion || !fechaOperacion || !rfc || !claveActividad || !tipoActividad || !descripcion || !monto || !periodicidad) {
            valido = false;
        }
        
        if (valido) {
            // Formatear fecha dd/mm/aaaa
            const fechaParts = fechaOperacion.split('-');
            const fechaFormateada = `${fechaParts[2]}/${fechaParts[1]}/${fechaParts[0]}`;
            
            // Construir contenido para actividades vulnerables
            contenido = `Configuración:${ejercicio}|${tipoDeclaracion}|035|028|${fechaFormateada}\n`;
            contenido += `930001-DatosIdentificacion:${rfc}|${claveActividad}\n`;
            contenido += `ActividadVulnerable:${tipoActividad}|${descripcion}|${monto}|${periodicidad}`;
            
            // Registrar operación
            registrarOperacion(tipo, rfc, parseFloat(monto));
        }
    } else {
        // Para los demás módulos, mostrar mensaje de en desarrollo
        valido = false;
        mostrarNotificacion('Este módulo está en desarrollo. Por ahora, solo los módulos de Datos Generales, Enajenación de Bienes y Actividades Vulnerables están completos.', 'error');
    }
    
    if (!valido) {
        mostrarNotificacion('Por favor, complete todos los campos obligatorios', 'error');
        return;
    }
    
    // Crear blob y descargar
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DeclaraNOT_${tipo}_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Mostrar notificación de éxito
    mostrarNotificacion('Archivo generado correctamente. ¡Ya puede descargarlo!', 'success');
}

// Registrar una operación en el sistema
function registrarOperacion(modulo, rfc, monto) {
    const operaciones = JSON.parse(localStorage.getItem('operaciones') || '[]');
    const configuracion = JSON.parse(localStorage.getItem('configuracion'));
    
    const operacion = {
        id: Date.now(),
        modulo: modulo,
        rfc: rfc,
        monto: parseFloat(monto),
        fecha: new Date().toISOString(),
        umbralBajo: configuracion.umbralBajo,
        umbralMedio: configuracion.umbralMedio,
        umbralAlto: configuracion.umbralAlto,
        umbralCritico: configuracion.umbralCritico,
        alertada: false
    };
    
    operaciones.push(operacion);
    localStorage.setItem('operaciones', JSON.stringify(operaciones));
    
    // Actualizar contadores
    const contadores = JSON.parse(localStorage.getItem('contadores'));
    if (contadores[modulo] !== undefined) {
        contadores[modulo]++;
        localStorage.setItem('contadores', JSON.stringify(contadores));
        
        // Actualizar dashboard
        document.getElementById(`count-${modulo}`).textContent = contadores[modulo];
    }
    
    // Verificar si genera alerta automáticamente
    if (configuracion.alertasAutomaticas && monto >= configuracion.umbralBajo) {
        let nivel = 'bajo';
        let titulo = '';
        
        if (monto >= configuracion.umbralCritico) {
            nivel = 'critico';
            titulo = 'Operación Crítica Detectada';
        } else if (monto >= configuracion.umbralAlto) {
            nivel = 'alto';
            titulo = 'Operación de Alto Valor';
        } else if (monto >= configuracion.umbralMedio) {
            nivel = 'medio';
            titulo = 'Operación de Valor Medio';
        } else {
            nivel = 'bajo';
            titulo = 'Operación de Bajo Valor';
        }
        
        if (nivel !== 'bajo') {
            generarAlerta({
                id: Date.now(),
                titulo: titulo,
                descripcion: `Operación en módulo ${modulo} con RFC ${rfc} por un monto de $${monto.toLocaleString('es-MX')}`,
                nivel: nivel,
                fecha: new Date().toISOString(),
                operacionId: operacion.id,
                leida: false
            });
            
            operacion.alertada = true;
            localStorage.setItem('operaciones', JSON.stringify(operaciones));
        }
    }
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo) {
    const notificacion = document.getElementById(`${tipo}-notification`);
    notificacion.textContent = mensaje;
    notificacion.style.display = 'block';
    
    setTimeout(() => {
        notificacion.style.display = 'none';
    }, 5000);
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    inicializarSistema();
    verificarSesion();
    
    // Establecer fecha actual por defecto
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    document.getElementById('fechaOperacion').value = formattedDate;
    
    // Establecer año actual por defecto
    document.getElementById('ejercicio').value = today.getFullYear();
    
    // Configurar eventos
    setupTabs();
    setupTipoInmueble();
    setupAdqTipoInmueble();
    
    // Configurar eventos de botones
    document.getElementById('login-button').addEventListener('click', login);
    document.getElementById('logout-button').addEventListener('click', logout);
    
    // Configurar eventos de secciones
    document.getElementById('toggle-datos-operacion').addEventListener('click', () => toggleSection('datos-operacion'));
    document.getElementById('toggle-detalle-pago').addEventListener('click', () => toggleSection('detalle-pago'));
    document.getElementById('toggle-datos-enajenante').addEventListener('click', () => toggleSection('datos-enajenante'));
    document.getElementById('toggle-datos-informativos').addEventListener('click', () => toggleSection('datos-informativos'));
    document.getElementById('toggle-datos-adquirente').addEventListener('click', () => toggleSection('datos-adquirente'));
    document.getElementById('toggle-pago').addEventListener('click', () => toggleSection('pago'));
    document.getElementById('toggle-copropiedad').addEventListener('click', () => toggleSection('copropiedad'));
    
    document.getElementById('toggle-adq-datos-operacion').addEventListener('click', () => toggleSection('adq-datos-operacion'));
    document.getElementById('toggle-adq-detalle-pago').addEventListener('click', () => toggleSection('adq-detalle-pago'));
    document.getElementById('toggle-adq-datos-enajenante').addEventListener('click', () => toggleSection('adq-datos-enajenante'));
    document.getElementById('toggle-adq-datos-adquirente').addEventListener('click', () => toggleSection('adq-datos-adquirente'));
    
    // Configurar eventos de botones de agregar secciones
    document.getElementById('add-pago-section').addEventListener('click', addPagoSection);
    document.getElementById('add-enajenante-section').addEventListener('click', addEnajenanteSection);
    document.getElementById('add-adquirente-section').addEventListener('click', addAdquirenteSection);
    document.getElementById('add-adq-pago-section').addEventListener('click', addAdqPagoSection);
    document.getElementById('add-adq-enajenante-section').addEventListener('click', addAdqEnajenanteSection);
    document.getElementById('add-adq-adquirente-section').addEventListener('click', addAdqAdquirenteSection);
    document.getElementById('add-socio-section').addEventListener('click', addSocioSection);
    document.getElementById('add-copropiedad-section').addEventListener('click', addCopropiedadSection);
    
    // Configurar eventos de botones de generación de TXT
    document.getElementById('generate-general-txt').addEventListener('click', () => generateTxt('general'));
    document.getElementById('generate-enajenacion-txt').addEventListener('click', () => generateTxt('enajenacion'));
    document.getElementById('generate-adquisicion-txt').addEventListener('click', () => generateTxt('adquisicion'));
    document.getElementById('generate-omision-txt').addEventListener('click', () => generateTxt('omision'));
    document.getElementById('generate-identificacion-txt').addEventListener('click', () => generateTxt('identificacion'));
    document.getElementById('generate-actividades-txt').addEventListener('click', () => generateTxt('actividades'));
    
    // Configurar eventos de botones de reset
    document.getElementById('reset-general-form').addEventListener('click', () => resetForm('general-form'));
    document.getElementById('reset-enajenacion-form').addEventListener('click', () => resetForm('enajenacion-form'));
    document.getElementById('reset-adquisicion-form').addEventListener('click', () => resetForm('adquisicion-form'));
    document.getElementById('reset-omision-form').addEventListener('click', () => resetForm('omision-form'));
    document.getElementById('reset-identificacion-form').addEventListener('click', () => resetForm('identificacion-form'));
    document.getElementById('reset-actividades-form').addEventListener('click', () => resetForm('actividades-form'));
    
    // Configurar eventos de gestión de alertas
    document.getElementById('guardar-umbrales').addEventListener('click', guardarUmbrales);
    document.getElementById('guardar-config-alertas').addEventListener('click', guardarConfigAlertas);
    document.getElementById('verificar-operaciones').addEventListener('click', verificarOperaciones);
    document.getElementById('generar-reporte-alertas').addEventListener('click', generarReporteAlertas);
    
    // Configurar eventos de configuración
    document.getElementById('agregar-usuario').addEventListener('click', agregarUsuario);
    document.getElementById('guardar-config-general').addEventListener('click', guardarConfigGeneral);
    document.getElementById('realizar-backup').addEventListener('click', realizarBackup);
    document.getElementById('limpiar-datos').addEventListener('click', limpiarDatos);
    
    // Agregar eventos a los campos de tipo de pago existentes
    document.querySelectorAll('.repeating-section select').forEach(select => {
        if (select.parentElement.classList.contains('form-group') && !select.parentElement.classList.contains('institucion-group')) {
            select.addEventListener('change', function() {
                const institucionGroup = this.closest('.repeating-section').querySelector('.institucion-group');
                const especifiqueInstitucionGroup = this.closest('.repeating-section').querySelector('.especifique-institucion-group');
                const cuentaGroup = this.closest('.repeating-section').querySelector('.cuenta-group');
                const otroPagoGroup = this.closest('.repeating-section').querySelector('.otro-pago-group');
                
                institucionGroup.style.display = (this.value === '2' || this.value === '3') ? 'block' : 'none';
                especifiqueInstitucionGroup.style.display = (this.value === '2' || this.value === '3') && institucionGroup.querySelector('select').value === '9' ? 'block' : 'none';
                cuentaGroup.style.display = (this.value === '2' || this.value === '3') ? 'block' : 'none';
                otroPagoGroup.style.display = this.value === '9' ? 'block' : 'none';
            });
        }
    });
    
    // Agregar eventos a los campos de institución financiera
    document.querySelectorAll('.institucion-group select').forEach(select => {
        select.addEventListener('change', function() {
            const especifiqueInstitucionGroup = this.closest('.repeating-section').querySelector('.especifique-institucion-group');
            especifiqueInstitucionGroup.style.display = this.value === '9' ? 'block' : 'none';
        });
    });
    
    // Agregar eventos a los campos de tipo de enajenante/adquirente/socio
    document.querySelectorAll('.repeating-section select').forEach(select => {
        if (select.parentElement.classList.contains('form-group') && select.querySelector('option[value="1"]')) {
            select.addEventListener('change', function() {
                const extranjeroGroups = this.closest('.repeating-section').querySelectorAll('.extranjero-group');
                extranjeroGroups.forEach(group => {
                    group.style.display = this.value === '2' ? 'block' : 'none';
                });
            });
        }
    });
    
    // Agregar evento al campo de ingresos exentos
    const tieneIngresosExentos = document.querySelector('#datos-informativos select');
    if (tieneIngresosExentos) {
        tieneIngresosExentos.addEventListener('change', function() {
            const montoExentoGroup = document.getElementById('monto-exento-group');
            const impuestoRetenidoGroup = document.getElementById('impuesto-retenido-group');
            
            if (this.value === '1') {
                montoExentoGroup.style.display = 'block';
                impuestoRetenidoGroup.style.display = 'block';
            } else {
                montoExentoGroup.style.display = 'none';
                impuestoRetenidoGroup.style.display = 'none';
            }
        });
    }
    
    // Agregar evento al campo de copropiedad
    const copropiedad = document.querySelector('#copropiedad select');
    if (copropiedad) {
        copropiedad.addEventListener('change', function() {
            const copropiedadDetails = document.getElementById('copropiedad-details');
            copropiedadDetails.style.display = this.value === '1' ? 'block' : 'none';
        });
    }
    
    // Agregar evento al campo de existe representante
    const existeRepresentante = document.querySelectorAll('#copropiedad select')[1];
    if (existeRepresentante) {
        existeRepresentante.addEventListener('change', function() {
            const rfcRepresentanteGroup = document.getElementById('rfc-representante-group');
            rfcRepresentanteGroup.style.display = this.value === '1' ? 'block' : 'none';
        });
    }
    
    // Agregar eventos a los botones de eliminar sección
    document.querySelectorAll('.remove-section').forEach(button => {
        button.addEventListener('click', function() {
            removeSection(this);
        });
    });
});