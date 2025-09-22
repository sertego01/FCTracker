// Variables globales
let allMatches = [];
let filteredMatches = [];

// Elementos del DOM
const formSection = document.getElementById('form-section');
const summarySection = document.getElementById('summary-section');
const navBtns = document.querySelectorAll('.nav-btn');
const matchForm = document.getElementById('match-form');
const matchesContainer = document.getElementById('matches-container');

// Filtros
const filterDateFrom = document.getElementById('filter-date-from');
const filterDateTo = document.getElementById('filter-date-to');
const filterType = document.getElementById('filter-type');
const applyFiltersBtn = document.getElementById('apply-filters');
const clearFiltersBtn = document.getElementById('clear-filters');

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadMatches();
});

// Configurar event listeners
function setupEventListeners() {
    // Navegación entre secciones
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.getAttribute('data-section');
            switchSection(section);
        });
    });

    // Formulario de partido
    matchForm.addEventListener('submit', handleFormSubmit);

    // Filtros
    applyFiltersBtn.addEventListener('click', applyFilters);
    clearFiltersBtn.addEventListener('click', clearFilters);

    // Auto-aplicar filtros cuando cambien los valores
    [filterDateFrom, filterDateTo, filterType].forEach(filter => {
        filter.addEventListener('change', applyFilters);
    });
}

// Inicializar la aplicación
function initializeApp() {
    // Establecer fecha actual como valor por defecto
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
    
    // Establecer fechas por defecto en los filtros
    filterDateFrom.value = '2025-09-19'; // 19/09/2025
    filterDateTo.value = today;
    
    // Inicializar scoreboard, slider y radio buttons
    initializeScoreboard();
    initializeMinuteSlider();
    initializePositionRadio();
    initializePossessionSync();
}

// Cambiar entre secciones
function switchSection(section) {
    // Actualizar botones de navegación
    navBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-section') === section) {
            btn.classList.add('active');
        }
    });

    // Mostrar/ocultar secciones
    document.querySelectorAll('.section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    if (section === 'form') {
        formSection.classList.add('active');
    } else {
        summarySection.classList.add('active');
        loadMatches(); // Recargar datos al cambiar a resumen
    }
}

// Manejar envío del formulario
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(matchForm);
    // Obtener posición para determinar qué datos van a quién
    const position = formData.get('position');
    const isVisitor = position === 'visitor';
    
    const matchData = {
        date: formData.get('date'),
        matchType: formData.get('matchType'),
        position: position,
        opponent: formData.get('opponent'),
        // Estadísticas del equipo propio - intercambiar si es visitante
        goalsFor: isVisitor ? parseInt(formData.get('goalsAgainst')) : parseInt(formData.get('goalsFor')),
        possession: isVisitor ? parseInt(formData.get('rivalPossession')) : parseInt(formData.get('possession')),
        shots: isVisitor ? parseInt(formData.get('rivalShots')) : parseInt(formData.get('shots')),
        expectedGoals: isVisitor ? parseFloat(formData.get('rivalExpectedGoals')) : parseFloat(formData.get('expectedGoals')),
        saves: isVisitor ? parseInt(formData.get('rivalSaves')) : parseInt(formData.get('saves')),
        offside: isVisitor ? parseInt(formData.get('rivalOffside')) : parseInt(formData.get('offside')),
        corners: isVisitor ? parseInt(formData.get('rivalCorners')) : parseInt(formData.get('corners')),
        yellowCards: isVisitor ? parseInt(formData.get('rivalYellowCards')) : parseInt(formData.get('yellowCards')),
        redCards: isVisitor ? parseInt(formData.get('rivalRedCards')) : parseInt(formData.get('redCards')),
        // Estadísticas del rival - intercambiar si es visitante
        goalsAgainst: isVisitor ? parseInt(formData.get('goalsFor')) : parseInt(formData.get('goalsAgainst')),
        rivalPossession: isVisitor ? parseInt(formData.get('possession')) : parseInt(formData.get('rivalPossession')),
        rivalShots: isVisitor ? parseInt(formData.get('shots')) : parseInt(formData.get('rivalShots')),
        rivalExpectedGoals: isVisitor ? parseFloat(formData.get('expectedGoals')) : parseFloat(formData.get('rivalExpectedGoals')),
        rivalSaves: isVisitor ? parseInt(formData.get('saves')) : parseInt(formData.get('rivalSaves')),
        rivalOffside: isVisitor ? parseInt(formData.get('offside')) : parseInt(formData.get('rivalOffside')),
        rivalCorners: isVisitor ? parseInt(formData.get('corners')) : parseInt(formData.get('rivalCorners')),
        rivalYellowCards: isVisitor ? parseInt(formData.get('yellowCards')) : parseInt(formData.get('rivalYellowCards')),
        rivalRedCards: isVisitor ? parseInt(formData.get('redCards')) : parseInt(formData.get('rivalRedCards')),
        matchMinute: parseInt(formData.get('matchMinute'))
    };

    // Obtener referencia al botón antes del try
    const submitBtn = matchForm.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    
    try {
        // Mostrar indicador de carga
        submitBtn.textContent = 'Guardando...';
        submitBtn.disabled = true;

        await addMatch(matchData);
        
        // Mostrar mensaje de éxito
        showNotification('Partido guardado correctamente', 'success');
        
        // Limpiar formulario
        matchForm.reset();
        // Solo establecer la fecha actual, dejar el resto vacío
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
        
        // Recargar partidos
        await loadMatches();
        
    } catch (error) {
        console.error('Error al guardar partido:', error);
        showNotification('Error al guardar el partido', 'error');
    } finally {
        // Restaurar botón
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Cargar todos los partidos
async function loadMatches() {
    try {
        allMatches = await getAllMatches();
        // Aplicar filtros por defecto al cargar
        await applyFilters();
    } catch (error) {
        console.error('Error al cargar partidos:', error);
        showNotification('Error al cargar los partidos', 'error');
    }
}

// Aplicar filtros
async function applyFilters() {
    const filters = {
        dateFrom: filterDateFrom.value || null,
        dateTo: filterDateTo.value || null,
        matchType: filterType.value || null
    };

    console.log('Aplicando filtros:', filters);

    try {
        if (Object.values(filters).some(filter => filter !== null)) {
            filteredMatches = await getFilteredMatches(filters);
            console.log('Partidos filtrados encontrados:', filteredMatches.length);
        } else {
            filteredMatches = [...allMatches];
            console.log('Sin filtros, mostrando todos los partidos:', filteredMatches.length);
        }
        
        updateSummary();
        displayMatches();
    } catch (error) {
        console.error('Error al aplicar filtros:', error);
        showNotification('Error al aplicar filtros', 'error');
    }
}

// Limpiar filtros
function clearFilters() {
    filterDateFrom.value = '';
    filterDateTo.value = '';
    filterType.value = '';
    
    filteredMatches = [...allMatches];
    updateSummary();
    displayMatches();
}

// Actualizar estadísticas del resumen
function updateSummary() {
    const matches = filteredMatches;
    
    if (matches.length === 0) {
        // Mostrar ceros si no hay partidos
        document.getElementById('total-matches').textContent = '0';
        document.getElementById('total-goals-for').textContent = '0';
        document.getElementById('total-goals-against').textContent = '0';
        document.getElementById('goal-difference').textContent = '0';
        document.getElementById('minutes-per-goal').textContent = '0';
        document.getElementById('win-percentage').textContent = '0%';
        
        // Estadísticas detalladas del equipo propio
        document.getElementById('avg-possession').textContent = '0%';
        document.getElementById('avg-shots').textContent = '0';
        document.getElementById('avg-expected-goals').textContent = '0';
        document.getElementById('avg-saves').textContent = '0';
        document.getElementById('avg-corners').textContent = '0';
        document.getElementById('total-yellow-cards').textContent = '0';
        document.getElementById('total-red-cards').textContent = '0';
        
        // Estadísticas detalladas del rival
        document.getElementById('avg-rival-possession').textContent = '0%';
        document.getElementById('avg-rival-shots').textContent = '0';
        document.getElementById('avg-rival-expected-goals').textContent = '0';
        document.getElementById('avg-rival-saves').textContent = '0';
        document.getElementById('avg-rival-corners').textContent = '0';
        document.getElementById('total-rival-yellow-cards').textContent = '0';
        document.getElementById('total-rival-red-cards').textContent = '0';
        return;
    }

    // Calcular estadísticas generales
    const totalMatches = matches.length;
    const totalGoalsFor = matches.reduce((sum, match) => sum + (match.goalsFor || 0), 0);
    const totalGoalsAgainst = matches.reduce((sum, match) => sum + (match.goalsAgainst || 0), 0);
    const goalDifference = totalGoalsFor - totalGoalsAgainst;
    
    // Calcular minutos por gol
    const totalMinutes = matches.reduce((sum, match) => sum + (match.matchMinute || 0), 0);
    const minutesPerGoal = totalGoalsFor > 0 ? Math.round(totalMinutes / totalGoalsFor) : 0;
    
    // Calcular % de victorias
    const victories = matches.filter(match => (match.goalsFor || 0) > (match.goalsAgainst || 0)).length;
    const winPercentage = totalMatches > 0 ? Math.round((victories / totalMatches) * 100) : 0;

    // Calcular estadísticas del equipo propio
    const avgPossession = Math.round(matches.reduce((sum, match) => sum + (match.possession || 0), 0) / totalMatches);
    const avgShots = Math.round(matches.reduce((sum, match) => sum + (match.shots || 0), 0) / totalMatches);
    
    // Debug para xG
    const totalExpectedGoals = matches.reduce((sum, match) => sum + (match.expectedGoals || 0), 0);
    const avgExpectedGoals = (totalExpectedGoals / totalMatches).toFixed(1);
    
    // Log para debug
    console.log('Partidos:', matches.length);
    console.log('xG por partido:', matches.map(m => m.expectedGoals || 0));
    console.log('Total xG:', totalExpectedGoals);
    console.log('Promedio xG:', avgExpectedGoals);
    
    const avgSaves = Math.round(matches.reduce((sum, match) => sum + (match.saves || 0), 0) / totalMatches);
    const avgCorners = Math.round(matches.reduce((sum, match) => sum + (match.corners || 0), 0) / totalMatches);
    const totalYellowCards = matches.reduce((sum, match) => sum + (match.yellowCards || 0), 0);
    const totalRedCards = matches.reduce((sum, match) => sum + (match.redCards || 0), 0);

    // Calcular estadísticas del rival
    const avgRivalPossession = Math.round(matches.reduce((sum, match) => sum + (match.rivalPossession || 0), 0) / totalMatches);
    const avgRivalShots = Math.round(matches.reduce((sum, match) => sum + (match.rivalShots || 0), 0) / totalMatches);
    
    // Debug para xG del rival
    const totalRivalExpectedGoals = matches.reduce((sum, match) => sum + (match.rivalExpectedGoals || 0), 0);
    const avgRivalExpectedGoals = (totalRivalExpectedGoals / totalMatches).toFixed(1);
    
    // Log para debug del rival
    console.log('xG rival por partido:', matches.map(m => m.rivalExpectedGoals || 0));
    console.log('Total xG rival:', totalRivalExpectedGoals);
    console.log('Promedio xG rival:', avgRivalExpectedGoals);
    
    const avgRivalSaves = Math.round(matches.reduce((sum, match) => sum + (match.rivalSaves || 0), 0) / totalMatches);
    const avgRivalCorners = Math.round(matches.reduce((sum, match) => sum + (match.rivalCorners || 0), 0) / totalMatches);
    const totalRivalYellowCards = matches.reduce((sum, match) => sum + (match.rivalYellowCards || 0), 0);
    const totalRivalRedCards = matches.reduce((sum, match) => sum + (match.rivalRedCards || 0), 0);

    // Actualizar elementos del DOM - Estadísticas generales
    document.getElementById('total-matches').textContent = totalMatches;
    document.getElementById('total-goals-for').textContent = totalGoalsFor;
    document.getElementById('total-goals-against').textContent = totalGoalsAgainst;
    document.getElementById('goal-difference').textContent = goalDifference > 0 ? `+${goalDifference}` : goalDifference;
    document.getElementById('minutes-per-goal').textContent = minutesPerGoal > 0 ? `${minutesPerGoal}'` : '0';
    document.getElementById('win-percentage').textContent = `${winPercentage}%`;
    
    // Actualizar elementos del DOM - Equipo propio
    document.getElementById('avg-possession').textContent = `${avgPossession}%`;
    document.getElementById('avg-shots').textContent = avgShots;
    document.getElementById('avg-expected-goals').textContent = avgExpectedGoals;
    document.getElementById('avg-saves').textContent = avgSaves;
    document.getElementById('avg-corners').textContent = avgCorners;
    document.getElementById('total-yellow-cards').textContent = totalYellowCards;
    document.getElementById('total-red-cards').textContent = totalRedCards;
    
    // Actualizar elementos del DOM - Rival
    document.getElementById('avg-rival-possession').textContent = `${avgRivalPossession}%`;
    document.getElementById('avg-rival-shots').textContent = avgRivalShots;
    document.getElementById('avg-rival-expected-goals').textContent = avgRivalExpectedGoals;
    document.getElementById('avg-rival-saves').textContent = avgRivalSaves;
    document.getElementById('avg-rival-corners').textContent = avgRivalCorners;
    document.getElementById('total-rival-yellow-cards').textContent = totalRivalYellowCards;
    document.getElementById('total-rival-red-cards').textContent = totalRivalRedCards;
}

// Mostrar lista de partidos
function displayMatches() {
    const matches = filteredMatches;
    
    if (matches.length === 0) {
        matchesContainer.innerHTML = '<p class="no-matches">No hay partidos que coincidan con los filtros</p>';
        return;
    }

    const matchesHTML = matches.map(match => {
        const date = new Date(match.date).toLocaleDateString('es-ES');
        const result = match.goalsFor > match.goalsAgainst ? 'Victoria' : 
                     match.goalsFor < match.goalsAgainst ? 'Derrota' : 'Empate';
        const resultClass = match.goalsFor > match.goalsAgainst ? 'victory' : 
                           match.goalsFor < match.goalsAgainst ? 'defeat' : 'draw';

        return `
            <div class="match-item">
                <div class="match-header">
                    <div class="match-info">
                        <span class="match-date">${date}</span>
                        <span class="match-teams">${match.position === 'visitor' ? `${match.opponent} ${match.goalsAgainst || 0} - ${match.goalsFor || 0} SinPies FC` : `SinPies FC ${match.goalsFor || 0} - ${match.goalsAgainst || 0} ${match.opponent}`}</span>
                        <span class="match-minute">Minuto: ${match.matchMinute || 0}'</span>
                    </div>
                    <div class="match-actions">
                        <span class="match-type">${getMatchTypeLabel(match.matchType)}</span>
                        <button class="delete-btn" onclick="deleteMatchFromUI('${match.id}')" title="Eliminar partido">
                            🗑️ Eliminar
                        </button>
                    </div>
                </div>
                <div class="match-details">
                    <div class="match-detail">
                        <span>Posesión:</span>
                        <span>${match.possession || 0}%</span>
                    </div>
                    <div class="match-detail">
                        <span>Tiros:</span>
                        <span>${match.shots || 0}</span>
                    </div>
                    <div class="match-detail">
                        <span>xG:</span>
                        <span>${match.expectedGoals || 0}</span>
                    </div>
                    <div class="match-detail">
                        <span>Paradas:</span>
                        <span>${match.saves || 0}</span>
                    </div>
                    <div class="match-detail">
                        <span>Fueras:</span>
                        <span>${match.offside || 0}</span>
                    </div>
                    <div class="match-detail">
                        <span>Corners:</span>
                        <span>${match.corners || 0}</span>
                    </div>
                    <div class="match-detail tarjetas">
                        <span>Tarjetas:</span>
                        <span>🟨${match.yellowCards || 0} 🟥${match.redCards || 0}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    matchesContainer.innerHTML = matchesHTML;
}

// Obtener etiqueta del tipo de partido
function getMatchTypeLabel(type) {
    const labels = {
        'futchampions': '🏆 FUT Champions',
        'rivals': '⚔️ Division Rivals',
        'squadbattles': '🎯 Squad Battles',
        'entrenamiento': '⚧️ Entrenamiento',
        'otro': '📄 Otro'
    };
    return labels[type] || type;
}

// Eliminar partido
async function deleteMatchFromUI(matchId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este partido?')) {
        return;
    }
    
    try {
        await deleteMatch(matchId);
        await loadMatches(); // Recargar la lista de partidos
        updateSummary(); // Actualizar el resumen
        showNotification('Partido eliminado correctamente', 'success');
    } catch (error) {
        console.error('Error al eliminar partido:', error);
        showNotification('Error al eliminar el partido', 'error');
    }
}


// Inicializar sincronización de posesión
function initializePossessionSync() {
    const possessionInput = document.getElementById('possession');
    const rivalPossessionInput = document.getElementById('rival-possession');
    
    // Función para sincronizar posesión
    function syncPossession() {
        const possessionValue = parseInt(possessionInput.value) || 0;
        const rivalPossessionValue = 100 - possessionValue;
        rivalPossessionInput.value = rivalPossessionValue;
    }
    
    // Función para sincronizar posesión del rival (modo inverso)
    function syncRivalPossession() {
        const rivalPossessionValue = parseInt(rivalPossessionInput.value) || 0;
        const possessionValue = 100 - rivalPossessionValue;
        possessionInput.value = possessionValue;
    }
    
    // Event listeners
    possessionInput.addEventListener('input', syncPossession);
    rivalPossessionInput.addEventListener('input', syncRivalPossession);
    
    // No establecer valores por defecto - dejar vacíos para evitar problemas en móvil
}

// Mostrar notificación
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Estilos de la notificación
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
    `;
    
    // Colores según el tipo
    if (type === 'success') {
        notification.style.background = '#27ae60';
    } else if (type === 'error') {
        notification.style.background = '#e74c3c';
    } else {
        notification.style.background = '#3498db';
    }
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Inicializar scoreboard
function initializeScoreboard() {
    const goalsForInput = document.getElementById('goals-for');
    const goalsAgainstInput = document.getElementById('goals-against');
    const opponentInput = document.getElementById('opponent');
    const scoreLeft = document.getElementById('score-left');
    const scoreRight = document.getElementById('score-right');
    const rivalNameDisplay = document.getElementById('rival-name-display');
    const positionRadios = document.querySelectorAll('input[name="position"]');

    // Función para actualizar el scoreboard según la posición
    function updateScoreboard() {
        const isVisitor = document.querySelector('input[name="position"]:checked').value === 'visitor';
        
        if (isVisitor) {
            // Si es visitante: rival a la izquierda, yo a la derecha
            scoreLeft.textContent = goalsAgainstInput.value || '';
            scoreRight.textContent = goalsForInput.value || '';
        } else {
            // Si es local: yo a la izquierda, rival a la derecha
            scoreLeft.textContent = goalsForInput.value || '';
            scoreRight.textContent = goalsAgainstInput.value || '';
        }
    }

    // Actualizar scoreboard cuando cambien los goles
    goalsForInput.addEventListener('input', updateScoreboard);
    goalsAgainstInput.addEventListener('input', updateScoreboard);

    // Actualizar scoreboard cuando cambie la posición
    positionRadios.forEach(radio => {
        radio.addEventListener('change', updateScoreboard);
    });

    // Actualizar nombre del rival
    opponentInput.addEventListener('input', () => {
        rivalNameDisplay.textContent = opponentInput.value || 'Rival';
    });

    // Inicializar scoreboard con valores vacíos
    updateScoreboard();
}

// Inicializar radio buttons de posición
function initializePositionRadio() {
    const positionRadios = document.querySelectorAll('input[name="position"]');
    const comparativeStats = document.querySelector('.comparative-stats');
    const scoreboard = document.querySelector('.scoreboard');
    
    positionRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'visitor') {
                // Si es visitante, invertir el orden de las columnas
                comparativeStats.style.direction = 'rtl';
                comparativeStats.classList.add('visitor-mode');
                
                // Invertir el scoreboard también
                scoreboard.style.direction = 'rtl';
                scoreboard.classList.add('visitor-mode');
            } else {
                // Si es local, orden normal
                comparativeStats.style.direction = 'ltr';
                comparativeStats.classList.remove('visitor-mode');
                
                // Restaurar scoreboard normal
                scoreboard.style.direction = 'ltr';
                scoreboard.classList.remove('visitor-mode');
            }
        });
    });
}

// Inicializar slider de minuto
function initializeMinuteSlider() {
    const minuteSlider = document.getElementById('match-minute');
    const minuteDisplay = document.getElementById('minute-display');

    // Actualizar display cuando cambie el slider
    minuteSlider.addEventListener('input', () => {
        minuteDisplay.textContent = minuteSlider.value + "'";
    });

    // Inicializar display
    minuteDisplay.textContent = minuteSlider.value + "'";
}

// Agregar estilos de animación para las notificaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .victory {
        color: #27ae60;
        font-weight: bold;
    }
    
    .defeat {
        color: #e74c3c;
        font-weight: bold;
    }
    
    .draw {
        color: #f39c12;
        font-weight: bold;
    }
`;
document.head.appendChild(style);
