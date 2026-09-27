let validWords = [];

let currentGame = {
  mode: 'daily',
  wordObj: null,
  targetWord: '',
  attempts: [],
  currentInput: [], 
  selectedTileIndex: 0, 
  status: 'IN_PROGRESS',
  freeWordIndex: 0,
  animatedRows: [],
  hintLevel: 0 
};

// Estadísticas separadas por modo
let stats = {
  daily: { played: 0, wins: 0, streak: 0, maxStreak: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, X: 0 } },
  free: { played: 0, wins: 0, streak: 0, maxStreak: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, X: 0 } }
};

// Lista global de palabras descubiertas para el Diccionario
let unlockedWords = [];

let activeStatsTab = 'daily';
let countdownInterval = null;

// Mensajes según el número de intento al adivinar
const winMessages = {
  1: "¡Increíble! ¡Adivinada a la primera! 🎯",
  2: "¡Espectacular! ¡En solo dos intentos! ⭐",
  3: "¡Excelente! ¡A la tercera va la vencida! 👏",
  4: "¡Muy bien! ¡Palabra adivinada! 👍",
  5: "¡Bien jugado! ¡Casi al límite! 😊",
  6: "¡Uff! ¡Adivinada en el último intento! 😅"
};

// --- LISTA COMPLETA DE 100 EMBLEMAS (ACTUALIZADA) ---
const BADGES_LIST = [
  // Racha
  { id: 'b1', icon: '🥉', name: 'Primer Paso', desc: 'Completa tu primera Palabra del Día.' },
  { id: 'b2', icon: '🔥', name: 'Tres Seguidos', desc: 'Mantén una racha de 3 días consecutivos.' },
  { id: 'b3', icon: '🗓️', name: 'Constancia Semanal', desc: 'Mantén una racha de 7 días consecutivos.' },
  { id: 'b4', icon: '⭐', name: 'Dos Semanas Imparable', desc: 'Mantén una racha de 14 días consecutivos.' },
  { id: 'b5', icon: '🏆', name: 'Mes Ininterrumpido', desc: 'Mantén una racha de 30 días consecutivos.' },
  { id: 'b6', icon: '🏅', name: 'Bimestre Fiel', desc: 'Mantén una racha de 60 días consecutivos.' },
  { id: 'b7', icon: '👑', name: 'Trimestre Dorado', desc: 'Mantén una racha de 90 días consecutivos.' },
  { id: 'b8', icon: '🏔️', name: 'Medio Año Activo', desc: 'Mantén una racha de 180 días consecutivos.' },
  { id: 'b9', icon: '🌟', name: 'Año Completo', desc: 'Mantén una racha de 365 días consecutivos.' },
  { id: 'b10', icon: '🔄', name: 'Segunda Oportunidad', desc: 'Recupera una racha tras perderla.' },

  // Victorias
  { id: 'b11', icon: '🌱', name: 'Iniciador', desc: 'Consigue 5 victorias en total.' },
  { id: 'b12', icon: '🌿', name: 'Principiante Prometedor', desc: 'Consigue 10 victorias en total.' },
  { id: 'b13', icon: '📚', name: 'Coleccionista de Palabras', desc: 'Consigue 25 victorias en total.' },
  { id: 'b14', icon: '🧠', name: 'Experto en Vocabulario', desc: 'Consigue 50 victorias en total.' },
  { id: 'b15', icon: '💯', name: 'Centenario', desc: 'Consigue 100 victorias en total.' },
  { id: 'b16', icon: '📜', name: 'Gran Jugador', desc: 'Consigue 200 victorias en total.' },
  { id: 'b17', icon: '🏛️', name: 'Maestro de las Palabras', desc: 'Consigue 350 victorias en total.' },
  { id: 'b18', icon: '🧙‍♂️', name: 'Enciclopedia Humana', desc: 'Consigue 500 victorias en total.' },
  { id: 'b19', icon: '👑', name: 'Leyenda del Juego', desc: 'Consigue 750 victorias en total.' },
  { id: 'b20', icon: '💎', name: 'Mítico', desc: 'Consigue 1000 victorias en total.' },

  // Eficiencia
  { id: 'b21', icon: '🎯', name: 'Visión Certera', desc: 'Adivina una palabra en 1 intento.' },
  { id: 'b22', icon: '⚡', name: 'Casi Perfecto', desc: 'Adivina una palabra en 2 intentos.' },
  { id: 'b23', icon: '👌', name: 'Trío Perfecto', desc: 'Adivina una palabra en 3 intentos.' },
  { id: 'b24', icon: '👍', name: 'A Mitad de Camino', desc: 'Adivina una palabra en 4 intentos.' },
  { id: 'b25', icon: '😊', name: 'Al Límite', desc: 'Adivina una palabra en 5 intentos.' },
  { id: 'b26', icon: '😅', name: 'Salvado por los Pelos', desc: 'Adivina una palabra en el 6º intento.' },
  { id: 'b27', icon: '🏹', name: 'Perfeccionista', desc: 'Adivina 5 palabras en el 1º intento.' },
  { id: 'b28', icon: '🎯', name: 'Francotirador', desc: 'Adivina 10 palabras en el 1º intento.' },
  { id: 'b29', icon: '⚡', name: 'Dominio Rápido', desc: 'Resuelve 3 palabras en ≤3 intentos.' },
  { id: 'b30', icon: '🧗', name: 'Resistencia Suprema', desc: 'Resuelve 3 palabras seguidas en el 6º intento.' },

  // Modo Libre
  { id: 'b31', icon: '🗺️', name: 'Explorador Libre', desc: 'Juega 10 partidas en Modo Libre.' },
  { id: 'b32', icon: '🧭', name: 'Aventurero del Libre', desc: 'Juega 50 partidas en Modo Libre.' },
  { id: 'b33', icon: '⛵', name: 'Navegante Incansable', desc: 'Juega 100 partidas en Modo Libre.' },
  { id: 'b34', icon: '🏃', name: 'Maratón de Palabras', desc: 'Juega 250 partidas en Modo Libre.' },
  { id: 'b35', icon: '🎮', name: 'Devorador de Partidas', desc: 'Juega 500 partidas en Modo Libre.' },
  { id: 'b36', icon: '⚡', name: 'Racha Libre 5', desc: 'Consigue 5 victorias seguidas en Modo Libre.' },
  { id: 'b37', icon: '🔥', name: 'Racha Libre 10', desc: 'Consigue 10 victorias seguidas en Modo Libre.' },
  { id: 'b38', icon: '🌟', name: 'Racha Libre 25', desc: 'Consigue 25 victorias seguidas en Modo Libre.' },
  { id: 'b39', icon: '🔄', name: 'Reintento Exitoso', desc: 'Resuelve una palabra tras reintentar.' },
  { id: 'b40', icon: '🚀', name: 'Sin Frenos', desc: 'Resuelve 10 palabras libres en una sesión.' },

  // Diccionario
  { id: 'b41', icon: '📖', name: 'Lector Curioso', desc: 'Abre el diccionario por primera vez.' },
  { id: 'b42', icon: '🔖', name: 'Primeros Descubrimientos', desc: 'Desbloquea 10 palabras.' },
  { id: 'b43', icon: '📕', name: 'Pequeño Glosario', desc: 'Desbloquea 25 palabras.' },
  { id: 'b44', icon: '📗', name: 'Gran Glosario', desc: 'Desbloquea 50 palabras.' },
  { id: 'b45', icon: '📘', name: 'Gran Colección', desc: 'Desbloquea 100 palabras.' },
  { id: 'b46', icon: '📙', name: 'Tesauro Completo', desc: 'Desbloquea 200 palabras.' },
  { id: 'b47', icon: '🏰', name: 'Erudito del Lenguaje', desc: 'Desbloquea 350 palabras.' },
  { id: 'b48', icon: '🎓', name: 'Biblioteca Viviente', desc: 'Desbloquea el 50% del diccionario.' },
  { id: 'b49', icon: '🏛️', name: 'Gran Archivista', desc: 'Desbloquea el 75% del diccionario.' },
  { id: 'b50', icon: '🌟', name: 'Diccionario Completo', desc: 'Desbloquea el 100% del diccionario.' },

  // Longitud de Palabra
  { id: 'b51', icon: '🧩', name: 'Palabras Cortas', desc: 'Adivina 10 palabras de 5 letras.' },
  { id: 'b52', icon: '🔍', name: 'Especialista en Cortas', desc: 'Adivina 50 palabras de 5 letras.' },
  { id: 'b53', icon: '⚖️', name: 'Equilibrio Perfecto', desc: 'Adivina 10 palabras de 6 letras.' },
  { id: 'b54', icon: '📐', name: 'Maestro de 6 Letras', desc: 'Adivina 50 palabras de 6 letras.' },
  { id: 'b55', icon: '📏', name: 'Desafío Mediano', desc: 'Adivina 10 palabras de 7 letras.' },
  { id: 'b56', icon: '🧵', name: 'Gran Longitud', desc: 'Adivina 10 palabras de 8 letras.' },
  { id: 'b57', icon: '🏢', name: 'El Reto Máximo', desc: 'Adivina 10 palabras de 9 letras.' },
  { id: 'b58', icon: '🏗️', name: 'Dominio XL', desc: 'Adivina 30 palabras de 8 o 9 letras.' },
  { id: 'b59', icon: '🛠️', name: 'Todoterreno', desc: 'Adivina palabras de 5, 6, 7, 8 y 9 letras.' },
  { id: 'b60', icon: '🎨', name: 'Variedad Absoluta', desc: 'Resuelve 5 palabras seguidas de diferente tamaño.' },

  // Pistas
  { id: 'b61', icon: '💪', name: 'Orgullo Intacto', desc: 'Adivina una palabra sin pedir pistas.' },
  { id: 'b62', icon: '🛡️', name: 'Pura Intuición', desc: 'Adivina 10 palabras seguidas sin pistas.' },
  { id: 'b63', icon: '💡', name: 'Primer Descarte', desc: 'Usa la pista para descartar letras.' },
  { id: 'b64', icon: '🟩', name: 'Buscador de Verdes', desc: 'Usa la pista para revelar letra verde.' },
  { id: 'b65', icon: '📖', name: 'Lector de Definiciones', desc: 'Usa la pista de significado.' },
  { id: 'b66', icon: '🎬', name: 'Apoyo Publicitario', desc: 'Usa todas las pistas en una partida.' },
  { id: 'b67', icon: '🧠', name: 'Estratega de Pistas', desc: 'Descarta letras y adivina en ese intento.' },
  { id: 'b68', icon: '🛟', name: 'Rescate en Extremis', desc: 'Pide significado en 5º intento y gana.' },
  { id: 'b69', icon: '🏔️', name: 'Independiente', desc: 'Adivina 50 palabras en total sin pistas.' },
  { id: 'b70', icon: '💎', name: 'Cero Ayudas', desc: 'Adivina una palabra de 9 letras sin pistas.' },

  // Horario y Calendario
  { id: 'b71', icon: '🌅', name: 'Madrugador', desc: 'Resuelve la palabra antes de las 08:00 AM.' },
  { id: 'b72', icon: '☀️', name: 'Pausa para Comer', desc: 'Juega entre las 13:00 y las 15:00.' },
  { id: 'b73', icon: '🌆', name: 'Tarde de Juego', desc: 'Juega entre las 17:00 y las 19:00.' },
  { id: 'b74', icon: '🌙', name: 'Noctámbulo', desc: 'Resuelve la palabra entre 22:00 y 02:00.' },
  { id: 'b75', icon: '🎡', name: 'Jugador de Finde', desc: 'Juega un sábado y un domingo.' },
  { id: 'b76', icon: '🥳', name: 'Sábado Triunfante', desc: 'Adivina la palabra en sábado.' },
  { id: 'b77', icon: '☕', name: 'Domingo Tranquilo', desc: 'Adivina la palabra en domingo.' },
  { id: 'b78', icon: '💼', name: 'Comienzo de Semana', desc: 'Resuelve el lunes por la mañana.' },
  { id: 'b79', icon: '🗓️', name: 'Fidelidad Mensual', desc: 'Juega en 3 meses diferentes.' },
  { id: 'b80', icon: '🌌', name: 'Nocturno Extremo', desc: 'Completa una partida pasadas las 03:00 AM.' },

  // Sociales e Interacción
  { id: 'b81', icon: '📤', name: 'Compartir es Vivir', desc: 'Comparte tu resultado por primera vez.' },
  { id: 'b82', icon: '🌐', name: 'Difusor del Juego', desc: 'Comparte tu resultado 5 veces.' },
  { id: 'b83', icon: '📢', name: 'Portavoz', desc: 'Comparte tu resultado 20 veces.' },
  { id: 'b84', icon: '🔍', name: 'Buscador', desc: 'Usa la búsqueda del diccionario 5 veces.' },
  { id: 'b85', icon: '📜', name: 'Lectura Detallada', desc: 'Baja hasta el final del diccionario.' },
  { id: 'b86', icon: '📊', name: 'Estadista', desc: 'Abre estadísticas 10 veces.' },
  { id: 'b87', icon: '❓', name: 'Repaso de Reglas', desc: 'Consulta las instrucciones de juego.' },
  { id: 'b88', icon: '📈', name: 'Analista', desc: 'Revisa tu distribución de intentos.' },
  { id: 'b89', icon: '🔄', name: 'Cambiador de Modo', desc: 'Alterna entre Diario y Libre 10 veces.' },
  { id: 'b90', icon: '📱', name: 'Fiel Compartidor', desc: 'Comparte una victoria a la primera.' },

  // Meta-Logros
  { id: 'b91', icon: '🥉', name: 'Iniciando Colección', desc: 'Desbloquea 5 emblemas.' },
  { id: 'b92', icon: '🥈', name: 'Primeros Logros', desc: 'Desbloquea 10 emblemas.' },
  { id: 'b93', icon: '🥉', name: 'Coleccionista Bronce', desc: 'Desbloquea 20 emblemas.' },
  { id: 'b94', icon: '🥈', name: 'Coleccionista Plata', desc: 'Desbloquea 35 emblemas.' },
  { id: 'b95', icon: '🏅', name: 'Medio Camino', desc: 'Desbloquea 50 emblemas.' },
  { id: 'b96', icon: '🥇', name: 'Coleccionista Oro', desc: 'Desbloquea 65 emblemas.' },
  { id: 'b97', icon: '💎', name: 'Casi Perfecto', desc: 'Desbloquea 80 emblemas.' },
  { id: 'b98', icon: '👑', name: 'Maestro de Logros', desc: 'Desbloquea 90 emblemas.' },
  { id: 'b99', icon: '🏆', name: 'Leyenda Absoluta', desc: 'Desbloquea 99 emblemas.' },
  { id: 'b100', icon: '🌟', name: 'Perfección Total', desc: 'Desbloquea los 100 emblemas.' }
];

let unlockedBadges = [];
let pendingBadgePopups = []; // Cola de avisos para mostrar cada emblema emergente secuencialmente

function loadUnlockedBadges() {
  const saved = localStorage.getItem('palabra_aragonesa_badges');
  if (saved) {
    try { unlockedBadges = JSON.parse(saved); } catch (e) { unlockedBadges = []; }
  }
}

// Función para desencadenar las ventanas emergentes por cada emblema desbloqueado
function checkAndUnlockBadge(badgeId) {
  loadUnlockedBadges();
  if (!unlockedBadges.includes(badgeId)) {
    unlockedBadges.push(badgeId);
    localStorage.setItem('palabra_aragonesa_badges', JSON.stringify(unlockedBadges));
    
    const badgeObj = BADGES_LIST.find(b => b.id === badgeId);
    if (badgeObj) {
      pendingBadgePopups.push(badgeObj);
      processNextBadgePopup();
    }
  }
}

// Muestra ventanas emergentes secuenciales una tras otra
let isDisplayingBadgePopup = false;
async function processNextBadgePopup() {
  if (isDisplayingBadgePopup || pendingBadgePopups.length === 0) return;

  isDisplayingBadgePopup = true;
  const badge = pendingBadgePopups.shift();

  await showAlert(`🏅 ¡NUEVO EMBLEMA DESBLOQUEADO!\n\n${badge.icon} ${badge.name}\n${badge.desc}`);

  isDisplayingBadgePopup = false;
  if (pendingBadgePopups.length > 0) {
    setTimeout(() => {
      processNextBadgePopup();
    }, 300);
  }
}

function evaluateBadgesOnGameEnd(isWin, attemptsCount, wordLength, hintsUsedCount) {
  const totalWins = (stats.daily?.wins || 0) + (stats.free?.wins || 0);
  const totalPlayed = (stats.daily?.played || 0) + (stats.free?.played || 0);
  const dailyStreak = stats.daily?.streak || 0;

  if (totalPlayed >= 1) checkAndUnlockBadge('b1');
  if (dailyStreak >= 3) checkAndUnlockBadge('b2');
  if (dailyStreak >= 7) checkAndUnlockBadge('b3');
  if (dailyStreak >= 14) checkAndUnlockBadge('b4');
  if (dailyStreak >= 30) checkAndUnlockBadge('b5');
  if (dailyStreak >= 60) checkAndUnlockBadge('b6');
  if (dailyStreak >= 90) checkAndUnlockBadge('b7');
  if (dailyStreak >= 180) checkAndUnlockBadge('b8');
  if (dailyStreak >= 365) checkAndUnlockBadge('b9');

  if (totalWins >= 5) checkAndUnlockBadge('b11');
  if (totalWins >= 10) checkAndUnlockBadge('b12');
  if (totalWins >= 25) checkAndUnlockBadge('b13');
  if (totalWins >= 50) checkAndUnlockBadge('b14');
  if (totalWins >= 100) checkAndUnlockBadge('b15');
  if (totalWins >= 200) checkAndUnlockBadge('b16');
  if (totalWins >= 350) checkAndUnlockBadge('b17');
  if (totalWins >= 500) checkAndUnlockBadge('b18');
  if (totalWins >= 750) checkAndUnlockBadge('b19');
  if (totalWins >= 1000) checkAndUnlockBadge('b20');

  if (isWin) {
    if (attemptsCount === 1) checkAndUnlockBadge('b21');
    if (attemptsCount === 2) checkAndUnlockBadge('b22');
    if (attemptsCount === 3) checkAndUnlockBadge('b23');
    if (attemptsCount === 4) checkAndUnlockBadge('b24');
    if (attemptsCount === 5) checkAndUnlockBadge('b25');
    if (attemptsCount === 6) checkAndUnlockBadge('b26');

    if (wordLength === 5) checkAndUnlockBadge('b51');
    if (wordLength === 6) checkAndUnlockBadge('b53');
    if (wordLength === 7) checkAndUnlockBadge('b55');
    if (wordLength === 8) checkAndUnlockBadge('b56');
    if (wordLength === 9) checkAndUnlockBadge('b57');

    if (hintsUsedCount === 0) checkAndUnlockBadge('b61');

    if (unlockedWords.length >= 10) checkAndUnlockBadge('b42');
    if (unlockedWords.length >= 25) checkAndUnlockBadge('b43');
    if (unlockedWords.length >= 50) checkAndUnlockBadge('b44');
    if (unlockedWords.length >= 100) checkAndUnlockBadge('b45');
    if (unlockedWords.length >= 200) checkAndUnlockBadge('b46');
    if (unlockedWords.length >= 350) checkAndUnlockBadge('b47');
  }

  const currentHour = new Date().getHours();
  if (currentHour < 8) checkAndUnlockBadge('b71');
  if (currentHour >= 13 && currentHour <= 15) checkAndUnlockBadge('b72');
  if (currentHour >= 17 && currentHour <= 19) checkAndUnlockBadge('b73');
  if (currentHour >= 22 || currentHour <= 2) checkAndUnlockBadge('b74');
  if (currentHour >= 3 && currentHour < 6) checkAndUnlockBadge('b80');

  const unlockedCount = unlockedBadges.length;
  if (unlockedCount >= 5) checkAndUnlockBadge('b91');
  if (unlockedCount >= 10) checkAndUnlockBadge('b92');
  if (unlockedCount >= 20) checkAndUnlockBadge('b93');
  if (unlockedCount >= 35) checkAndUnlockBadge('b94');
  if (unlockedCount >= 50) checkAndUnlockBadge('b95');
  if (unlockedCount >= 65) checkAndUnlockBadge('b96');
  if (unlockedCount >= 80) checkAndUnlockBadge('b97');
  if (unlockedCount >= 90) checkAndUnlockBadge('b98');
  if (unlockedCount >= 99) checkAndUnlockBadge('b99');
  if (unlockedCount >= 100) checkAndUnlockBadge('b100');
}

function renderBadgesGrid() {
  loadUnlockedBadges();
  const container = document.getElementById('badges-grid');
  const counter = document.getElementById('badges-counter');
  if (!container) return;

  container.innerHTML = '';
  if (counter) counter.textContent = `Desbloqueados: ${unlockedBadges.length} / ${BADGES_LIST.length}`;

  BADGES_LIST.forEach(b => {
    const isUnlocked = unlockedBadges.includes(b.id);
    const card = document.createElement('div');
    card.className = `badge-card ${isUnlocked ? 'unlocked' : 'locked'}`;

    card.innerHTML = `
      <div class="badge-icon">${b.icon}</div>
      <div class="badge-title">${b.name}</div>
      <div class="badge-desc">${b.desc}</div>
      <div class="badge-status">${isUnlocked ? 'Conseguido' : 'Bloqueado'}</div>
    `;
    container.appendChild(card);
  });
}

// Elementos DOM
const boardEl = document.getElementById('game-board');
const keyboardEl = document.getElementById('keyboard');
const btnHelp = document.getElementById('btn-help');
const btnStats = document.getElementById('btn-stats');
const btnHint = document.getElementById('btn-hint');

// Elementos Diccionario y Emblemas
const btnBadges = document.getElementById('btn-badges');
const badgesModal = document.getElementById('badges-modal');
const closeBadges = document.getElementById('close-badges');
const btnModalCloseBadges = document.getElementById('btn-modal-close-badges');

const btnDictionary = document.getElementById('btn-dictionary');
const dictionaryModal = document.getElementById('dictionary-modal');
const closeDictionary = document.getElementById('close-dictionary');
const btnModalCloseDict = document.getElementById('btn-modal-close-dict');
const dictionaryList = document.getElementById('dictionary-list');
const dictCounter = document.getElementById('dict-counter');
const dictSearchInput = document.getElementById('dict-search-input');

const helpModal = document.getElementById('help-modal');
const closeHelp = document.getElementById('close-help');
const startGameBtn = document.getElementById('start-game-btn');
const dontShowHelp = document.getElementById('dont-show-help');

const resultModal = document.getElementById('result-modal');
const btnCloseResultModal = document.getElementById('btn-close-result-modal');
const resultBanner = document.getElementById('result-banner');
const resultWordDefinition = document.getElementById('result-word-definition');
const resultCountdownBox = document.getElementById('result-countdown-box');
const dailyTimer = document.getElementById('daily-timer');

const btnShare = document.getElementById('btn-share');
const btnNextWord = document.getElementById('btn-next-word');
const btnRetryWord = document.getElementById('btn-retry-word');

const btnMainNext = document.getElementById('btn-main-next');
const btnMainRetry = document.getElementById('btn-main-retry');

const statsModal = document.getElementById('stats-modal');
const closeStats = document.getElementById('close-stats');
const btnModalCloseStats = document.getElementById('btn-modal-close-stats');

const btnModeDaily = document.getElementById('btn-mode-daily');
const btnModeFree = document.getElementById('btn-mode-free');
const freeControls = document.getElementById('free-mode-controls');
const wordBadge = document.getElementById('word-number-badge');
const dailyCompletedBanner = document.getElementById('daily-completed-banner');

// Elementos Modal de Alerta Personalizado
const customAlertModal = document.getElementById('custom-alert-modal');
const customAlertMessage = document.getElementById('custom-alert-message');
const customAlertOkBtn = document.getElementById('custom-alert-ok-btn');
const customAlertCancelBtn = document.getElementById('custom-alert-cancel-btn');

document.addEventListener('DOMContentLoaded', () => {
  loadSavedStats();
  initEventListeners();
  loadWordsJSON();
  initAdMobPlugin();
  setupDailyReminderNotification();
});

// --- SISTEMA DE ALERTA PERSONALIZADO ---
function showAlert(message, isConfirm = false) {
  return new Promise((resolve) => {
    customAlertMessage.innerText = message;
    customAlertModal.classList.remove('hidden');

    if (isConfirm) {
      customAlertCancelBtn.classList.remove('hidden');
    } else {
      customAlertCancelBtn.classList.add('hidden');
    }

    const onOk = () => {
      cleanup();
      resolve(true);
    };

    const onCancel = () => {
      cleanup();
      resolve(false);
    };

    const cleanup = () => {
      customAlertModal.classList.add('hidden');
      customAlertOkBtn.removeEventListener('click', onOk);
      customAlertCancelBtn.removeEventListener('click', onCancel);
    };

    customAlertOkBtn.addEventListener('click', onOk);
    customAlertCancelBtn.addEventListener('click', onCancel);
  });
}

// --- NOTIFICACIONES LOCALES VÍA SERVICE WORKER A LAS 20:00 H ---
function setupDailyReminderNotification() {
  if (!('serviceWorker' in navigator) || !('Notification' in window)) return;

  navigator.serviceWorker.register('sw.js').then(registration => {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          scheduleLocalNotification(registration);
        }
      });
    } else if (Notification.permission === 'granted') {
      scheduleLocalNotification(registration);
    }
  }).catch(err => console.error('Error al registrar Service Worker:', err));
}

function scheduleLocalNotification(registration) {
  const savedDaily = localStorage.getItem('palabra_aragonesa_daily_game');
  let playedToday = false;

  if (savedDaily) {
    try {
      const data = JSON.parse(savedDaily);
      if (data.date === getTodayString() && data.status !== 'IN_PROGRESS') {
        playedToday = true;
      }
    } catch (e) {}
  }

  if (playedToday) return;

  const now = new Date();
  const reminderTime = new Date();
  reminderTime.setHours(20, 0, 0, 0);

  if (now > reminderTime) {
    reminderTime.setDate(reminderTime.getDate() + 1);
  }

  if ('showTrigger' in Notification.prototype) {
    registration.showNotification("La Palabra Aragonesa del Día", {
      body: "¿Has resuelto ya la palabra aragonesa de hoy? 🎯 ¡Entra y acepta el reto!",
      icon: "favicon.png",
      tag: "daily-reminder",
      showTrigger: new TimestampTrigger(reminderTime.getTime())
    });
  } else {
    const delay = reminderTime.getTime() - now.getTime();
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        action: 'schedule_notification',
        delay: delay
      });
    }
  }
}

// --- GESTIÓN DEL DICCIONARIO Y PALABRAS DESBLOQUEADAS ---
function loadUnlockedWords() {
  const saved = localStorage.getItem('palabra_aragonesa_unlocked_words');
  if (saved) {
    try { 
      unlockedWords = JSON.parse(saved); 
    } catch (e) {
      unlockedWords = [];
    }
  } else {
    unlockedWords = [];
  }

  const savedFreeIndex = localStorage.getItem('palabra_aragonesa_free_index');
  if (savedFreeIndex !== null && validWords && validWords.length > 0) {
    const currentIndex = parseInt(savedFreeIndex, 10) || 0;
    
    let hasNewImport = false;
    for (let i = 0; i < currentIndex; i++) {
      const wObj = validWords[i];
      if (!wObj) continue;

      const wordId = wObj.id || wObj.palabra;
      const exists = unlockedWords.some(item => 
        item.id === wordId || 
        item.palabra.toUpperCase().trim() === wObj.palabra.toUpperCase().trim()
      );

      if (!exists) {
        unlockedWords.push({
          id: wordId,
          palabra: wObj.palabra.toUpperCase().trim(),
          palabraMostrar: wObj.palabraMostrar || wObj.palabra,
          significado: wObj.significado
        });
        hasNewImport = true;
      }
    }

    if (hasNewImport) {
      localStorage.setItem('palabra_aragonesa_unlocked_words', JSON.stringify(unlockedWords));
    }
  }
}

function unlockCurrentWord() {
  if (!currentGame.wordObj) return;

  loadUnlockedWords();

  const wordId = currentGame.wordObj.id || currentGame.wordObj.palabra;
  const existsIndex = unlockedWords.findIndex(item => item.id === wordId || item.palabra.toUpperCase().trim() === currentGame.wordObj.palabra.toUpperCase().trim());

  if (existsIndex === -1) {
    unlockedWords.push({
      id: wordId,
      palabra: currentGame.wordObj.palabra.toUpperCase().trim(),
      palabraMostrar: currentGame.wordObj.palabraMostrar || currentGame.wordObj.palabra,
      significado: currentGame.wordObj.significado
    });
  } else {
    unlockedWords[existsIndex].palabraMostrar = currentGame.wordObj.palabraMostrar || currentGame.wordObj.palabra;
  }
  
  localStorage.setItem('palabra_aragonesa_unlocked_words', JSON.stringify(unlockedWords));
}

function renderDictionaryList(filterText = '') {
  loadUnlockedWords();

  dictionaryList.innerHTML = '';
  dictCounter.textContent = `Descubiertas: ${unlockedWords.length} / ${validWords.length}`;

  const filtered = unlockedWords.filter(item => {
    const originalObj = validWords.find(w => (w.id && w.id === item.id) || w.palabra.toUpperCase().trim() === item.palabra.toUpperCase().trim());
    const displayWord = (originalObj && originalObj.palabraMostrar) || item.palabraMostrar || item.palabra;
    
    return displayWord.toLowerCase().includes(filterText.toLowerCase()) ||
           item.significado.toLowerCase().includes(filterText.toLowerCase());
  });

  if (filtered.length === 0) {
    dictionaryList.innerHTML = `<div class="dict-empty-msg">${
      unlockedWords.length === 0 
        ? 'Aún no has descubierto ninguna palabra. ¡Gana una partida para añadir tu primera palabra!' 
        : 'No se encontraron palabras con ese filtro.'
    }</div>`;
    return;
  }

  filtered.sort((a, b) => {
    const origA = validWords.find(w => (w.id && w.id === a.id) || w.palabra.toUpperCase().trim() === a.palabra.toUpperCase().trim());
    const origB = validWords.find(w => (w.id && w.id === b.id) || w.palabra.toUpperCase().trim() === b.palabra.toUpperCase().trim());

    const wordA = (origA && origA.palabraMostrar) || a.palabraMostrar || a.palabra;
    const wordB = (origB && origB.palabraMostrar) || b.palabraMostrar || b.palabra;
    return wordA.localeCompare(wordB);
  }).forEach(item => {
    const card = document.createElement('div');
    card.className = 'dict-card';
    
    const originalObj = validWords.find(w => (w.id && w.id === item.id) || w.palabra.toUpperCase().trim() === item.palabra.toUpperCase().trim());
    const textoMostrar = (originalObj && originalObj.palabraMostrar) || item.palabraMostrar || item.palabra;

    card.innerHTML = `
      <div class="dict-card-header">
        <span class="dict-word">${textoMostrar}</span>
      </div>
      <div class="dict-definition">${item.significado}</div>
    `;
    dictionaryList.appendChild(card);
  });
}

function loadSavedStats() {
  const saved = localStorage.getItem('palabra_aragonesa_stats_v2');
  if (saved) {
    try { stats = JSON.parse(saved); } catch (e) {}
  }

  const savedFreeIndex = localStorage.getItem('palabra_aragonesa_free_index');
  if (savedFreeIndex !== null) {
    currentGame.freeWordIndex = parseInt(savedFreeIndex, 10) || 0;
  }
}

function saveStats() {
  localStorage.setItem('palabra_aragonesa_stats_v2', JSON.stringify(stats));
}

function saveGameState() {
  if (currentGame.mode === 'daily') {
    localStorage.setItem('palabra_aragonesa_daily_game', JSON.stringify({
      date: getTodayString(),
      attempts: currentGame.attempts,
      status: currentGame.status,
      hintLevel: currentGame.hintLevel
    }));
  } else if (currentGame.mode === 'free') {
    localStorage.setItem('palabra_aragonesa_free_game', JSON.stringify({
      wordIndex: currentGame.freeWordIndex,
      attempts: currentGame.attempts,
      status: currentGame.status,
      hintLevel: currentGame.hintLevel
    }));
  }
}

function loadWordsJSON() {
  fetch('words.json?v=' + new Date().getTime())
    .then(res => res.json())
    .then(data => {
      validWords = data.filter(item => item.palabra && item.palabra.trim().length >= 5 && item.palabra.trim().length <= 9);

      if (validWords.length === 0) {
        showAlert('No se encontraron palabras válidas en words.json.');
        return;
      }

      loadUnlockedWords();
      checkFirstVisitTutorial();
      initGame('daily');
    })
    .catch(err => {
      console.error('Error al cargar words.json:', err);
    });
}

function checkFirstVisitTutorial() {
  const hideHelp = localStorage.getItem('palabra_aragonesa_hide_help');
  if (!hideHelp) {
    helpModal.classList.remove('hidden');
  }
}

function initEventListeners() {
  btnHelp.addEventListener('click', () => helpModal.classList.remove('hidden'));
  closeHelp.addEventListener('click', () => helpModal.classList.add('hidden'));
  startGameBtn.addEventListener('click', () => {
    if (dontShowHelp.checked) {
      localStorage.setItem('palabra_aragonesa_hide_help', 'true');
    }
    helpModal.classList.add('hidden');
  });

  if (btnBadges) {
    btnBadges.addEventListener('click', () => {
      renderBadgesGrid();
      badgesModal.classList.remove('hidden');
    });
  }

  if (closeBadges) closeBadges.addEventListener('click', () => badgesModal.classList.add('hidden'));
  if (btnModalCloseBadges) btnModalCloseBadges.addEventListener('click', () => badgesModal.classList.add('hidden'));

  if (btnDictionary) {
    btnDictionary.addEventListener('click', () => {
      checkAndUnlockBadge('b41');
      if (dictSearchInput) dictSearchInput.value = '';
      renderDictionaryList();
      dictionaryModal.classList.remove('hidden');
    });
  }

  if (closeDictionary) closeDictionary.addEventListener('click', () => dictionaryModal.classList.add('hidden'));
  if (btnModalCloseDict) btnModalCloseDict.addEventListener('click', () => dictionaryModal.classList.add('hidden'));

  if (dictSearchInput) {
    dictSearchInput.addEventListener('input', (e) => {
      renderDictionaryList(e.target.value);
    });
  }

  if (btnHint) {
    btnHint.addEventListener('click', handleHintClick);
  }

  btnCloseResultModal.addEventListener('click', () => {
    resultModal.classList.add('hidden');
    updateMainActionButtons();
  });

  btnStats.addEventListener('click', () => {
    checkAndUnlockBadge('b86');
    openStatsModal();
  });
  closeStats.addEventListener('click', () => statsModal.classList.add('hidden'));
  btnModalCloseStats.addEventListener('click', () => statsModal.classList.add('hidden'));

  document.querySelectorAll('.stats-tab-menu .stats-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.stats-tab-menu .stats-tab-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeStatsTab = e.target.getAttribute('data-tab');
      renderStatsData();
    });
  });

  if (btnModeDaily) btnModeDaily.addEventListener('click', () => switchMode('daily'));
  if (btnModeFree) btnModeFree.addEventListener('click', () => switchMode('free'));

  btnNextWord.addEventListener('click', nextFreeWord);
  btnRetryWord.addEventListener('click', retryFreeWord);

  btnMainNext.addEventListener('click', nextFreeWord);
  btnMainRetry.addEventListener('click', retryFreeWord);

  btnShare.addEventListener('click', shareResults);

  keyboardEl.addEventListener('click', (e) => {
    const target = e.target.closest('.key');
    if (!target) return;
    const key = target.getAttribute('data-key');
    handleKeyPress(key);
  });

  document.addEventListener('keydown', (e) => {
    if (!helpModal.classList.contains('hidden') || 
        !statsModal.classList.contains('hidden') || 
        !resultModal.classList.contains('hidden') ||
        !dictionaryModal.classList.contains('hidden') ||
        !badgesModal.classList.contains('hidden') ||
        !customAlertModal.classList.contains('hidden')) return;

    if (e.key === 'Enter') handleKeyPress('ENTER');
    else if (e.key === 'Backspace') handleKeyPress('BACKSPACE');
    else {
      const key = e.key.toUpperCase();
      if (/^[A-ZÑ]$/.test(key)) handleKeyPress(key);
    }
  });
}

function switchMode(mode) {
  if (currentGame.mode === mode) return;
  if (btnModeDaily) btnModeDaily.classList.toggle('active', mode === 'daily');
  if (btnModeFree) btnModeFree.classList.toggle('active', mode === 'free');
  if (freeControls) freeControls.classList.toggle('hidden', mode === 'daily');
  initGame(mode);
}

function getTodayString() {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

function getDailyIndex() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDate = new Date(2026, 7, 13);

  const diffTime = today - startDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const targetId = 1201;
  const baseIndex = validWords.findIndex(w => w.id === targetId);
  const startIndex = baseIndex !== -1 ? baseIndex : 1200;

  return (startIndex + diffDays) % validWords.length;
}

function initGame(mode) {
  currentGame.mode = mode;
  currentGame.attempts = [];
  currentGame.status = 'IN_PROGRESS';
  currentGame.animatedRows = [];
  currentGame.hintLevel = 0;
  if (dailyCompletedBanner) dailyCompletedBanner.classList.add('hidden');
  hideMainActionButtons();

  if (mode === 'daily') {
    const dailyIdx = getDailyIndex();
    currentGame.wordObj = validWords[dailyIdx];
    currentGame.targetWord = currentGame.wordObj.palabra.toUpperCase().trim();

    const savedDaily = localStorage.getItem('palabra_aragonesa_daily_game');
    if (savedDaily) {
      try {
        const dailyData = JSON.parse(savedDaily);
        if (dailyData.date === getTodayString()) {
          currentGame.attempts = dailyData.attempts || [];
          currentGame.status = dailyData.status || 'IN_PROGRESS';
          currentGame.hintLevel = dailyData.hintLevel || 0;
          currentGame.animatedRows = currentGame.attempts.map((_, idx) => idx);

          if (currentGame.status === 'WON') {
            unlockCurrentWord();
          }

          if (currentGame.status === 'WON' || currentGame.status === 'LOST') {
            if (dailyCompletedBanner) dailyCompletedBanner.classList.remove('hidden');
            openDailyAlreadyPlayedModal();
          }
        }
      } catch (e) {}
    }
  } else {
    if (currentGame.freeWordIndex >= validWords.length) {
      currentGame.freeWordIndex = 0;
    }
    currentGame.wordObj = validWords[currentGame.freeWordIndex];
    currentGame.targetWord = currentGame.wordObj.palabra.toUpperCase().trim();
    const displayNum = currentGame.wordObj.id || (currentGame.freeWordIndex + 1);
    if (wordBadge) wordBadge.textContent = `Palabra ${displayNum}`;

    const savedFree = localStorage.getItem('palabra_aragonesa_free_game');
    if (savedFree) {
      try {
        const freeData = JSON.parse(savedFree);
        if (freeData.wordIndex === currentGame.freeWordIndex) {
          currentGame.attempts = freeData.attempts || [];
          currentGame.status = freeData.status || 'IN_PROGRESS';
          currentGame.hintLevel = freeData.hintLevel || 0;
          currentGame.animatedRows = currentGame.attempts.map((_, idx) => idx);

          if (currentGame.status === 'WON') {
            unlockCurrentWord();
            updateMainActionButtons();
          } else if (currentGame.status === 'LOST') {
            updateMainActionButtons();
          }
        }
      } catch (e) {}
    }
  }

  resetInputArray();
  resetKeyboardColors();
  if (currentGame.attempts.length > 0) {
    currentGame.attempts.forEach(att => updateKeyboardColors(att));
  }
  
  if (currentGame.hintLevel >= 1) {
    discardKeyboardLetters(3);
  }

  updateHintButtonUI();
  renderBoard();
}

function resetInputArray() {
  const wordLength = currentGame.targetWord.length;
  currentGame.currentInput = new Array(wordLength).fill('');
  currentGame.selectedTileIndex = 0;
}

function resetCurrentWord() {
  currentGame.attempts = [];
  currentGame.status = 'IN_PROGRESS';
  currentGame.animatedRows = [];
  currentGame.hintLevel = 0;
  resetInputArray();
  hideMainActionButtons();
  saveGameState();
  resetKeyboardColors();
  updateHintButtonUI();
  renderBoard();
}

function nextFreeWord() {
  resultModal.classList.add('hidden');
  hideMainActionButtons();
  currentGame.freeWordIndex = (currentGame.freeWordIndex + 1) % validWords.length;
  localStorage.setItem('palabra_aragonesa_free_index', currentGame.freeWordIndex);
  localStorage.removeItem('palabra_aragonesa_free_game');
  initGame('free');
}

function retryFreeWord() {
  resultModal.classList.add('hidden');
  localStorage.removeItem('palabra_aragonesa_free_game');
  resetCurrentWord();
}

function handleKeyPress(key) {
  if (currentGame.status !== 'IN_PROGRESS') return;

  const wordLength = currentGame.targetWord.length;

  if (key === 'ENTER') {
    submitAttempt();
  } else if (key === 'BACKSPACE') {
    if (currentGame.currentInput[currentGame.selectedTileIndex] !== '') {
      currentGame.currentInput[currentGame.selectedTileIndex] = '';
    } else if (currentGame.selectedTileIndex > 0) {
      currentGame.selectedTileIndex--;
      currentGame.currentInput[currentGame.selectedTileIndex] = '';
    }
    renderBoard();
  } else if (/^[A-ZÑ]$/.test(key)) {
    currentGame.currentInput[currentGame.selectedTileIndex] = key;

    let nextEmpty = -1;
    for (let i = currentGame.selectedTileIndex + 1; i < wordLength; i++) {
      if (currentGame.currentInput[i] === '') {
        nextEmpty = i;
        break;
      }
    }

    if (nextEmpty !== -1) {
      currentGame.selectedTileIndex = nextEmpty;
    } else if (currentGame.selectedTileIndex < wordLength - 1) {
      currentGame.selectedTileIndex++;
    }

    renderBoard();
  }
}

function submitAttempt() {
  const wordLength = currentGame.targetWord.length;
  const isComplete = currentGame.currentInput.every(char => char !== '');

  if (!isComplete) {
    showAlert('Debes completar todas las casillas antes de enviar la palabra.');
    return;
  }

  const attempt = currentGame.currentInput.join('').toUpperCase();
  currentGame.attempts.push(attempt);
  resetInputArray();

  updateKeyboardColors(attempt);

  const isWin = (attempt === currentGame.targetWord);
  const isLoss = (currentGame.attempts.length === 6 && !isWin);

  if (isWin) {
    currentGame.status = 'WON';
    unlockCurrentWord();
    recordStats(true, currentGame.attempts.length);
  } else if (isLoss) {
    currentGame.status = 'LOST';
    recordStats(false, 'X');
  }

  saveGameState();
  updateHintButtonUI();

  if (currentGame.mode === 'daily' && (isWin || isLoss)) {
    if (dailyCompletedBanner) dailyCompletedBanner.classList.remove('hidden');
  }

  renderBoard();

  const submittedRowIndex = currentGame.attempts.length - 1;
  currentGame.animatedRows.push(submittedRowIndex);

  if (isWin || isLoss) {
    evaluateBadgesOnGameEnd(isWin, currentGame.attempts.length, wordLength, currentGame.hintLevel);
    const delay = (wordLength * 150) + 400;
    setTimeout(() => openResultModal(isWin), delay);
  }
}

function getGreenLettersMap() {
  const greenMap = {};
  currentGame.attempts.forEach(att => {
    att.split('').forEach((char, idx) => {
      if (currentGame.targetWord[idx] === char) {
        greenMap[idx] = char;
      }
    });
  });
  return greenMap;
}

function renderBoard() {
  boardEl.innerHTML = '';
  const wordLength = currentGame.targetWord.length;
  const greenMap = getGreenLettersMap();

  for (let r = 0; r < 6; r++) {
    const rowEl = document.createElement('div');
    rowEl.className = 'board-row';

    const attempt = currentGame.attempts[r];
    const isCurrentRow = (r === currentGame.attempts.length && currentGame.status === 'IN_PROGRESS');
    const isLatestSubmitted = (r === currentGame.attempts.length - 1);

    for (let c = 0; c < wordLength; c++) {
      const tile = document.createElement('div');
      tile.className = 'tile';

      if (attempt) {
        tile.textContent = attempt[c];
        const status = evaluateTileStatus(attempt, c);

        if (isLatestSubmitted && !currentGame.animatedRows.includes(r)) {
          tile.classList.add('flip');
          tile.style.animationDelay = `${c * 150}ms`;
        }

        tile.classList.add(status);
      } else if (isCurrentRow) {
        const char = currentGame.currentInput[c] || '';
        
        tile.dataset.col = c;
        tile.classList.add('selectable');
        tile.addEventListener('click', () => {
          currentGame.selectedTileIndex = c;
          renderBoard();
        });

        if (c === currentGame.selectedTileIndex) {
          tile.classList.add('selected');
        }

        if (char) {
          tile.textContent = char;
          tile.classList.add('filled');
        } else if (greenMap[c]) {
          tile.textContent = greenMap[c];
          tile.classList.add('ghost-green');
        }
      }

      rowEl.appendChild(tile);
    }

    boardEl.appendChild(rowEl);
  }
}

function evaluateTileStatus(attempt, index) {
  const target = currentGame.targetWord;
  const wordLength = target.length;
  const statuses = new Array(wordLength).fill('absent');
  const targetChars = target.split('');
  const attemptChars = attempt.split('');

  for (let i = 0; i < wordLength; i++) {
    if (attemptChars[i] === targetChars[i]) {
      statuses[i] = 'correct';
      targetChars[i] = null;
    }
  }

  for (let i = 0; i < wordLength; i++) {
    if (statuses[i] !== 'correct') {
      const char = attemptChars[i];
      const foundIdx = targetChars.indexOf(char);
      if (foundIdx !== -1) {
        statuses[i] = 'present';
        targetChars[foundIdx] = null;
      }
    }
  }

  return statuses[index];
}

function updateKeyboardColors(attempt) {
  attempt.split('').forEach((char, idx) => {
    const keyEl = keyboardEl.querySelector(`[data-key="${char}"]`);
    if (!keyEl) return;

    if (currentGame.targetWord[idx] === char) {
      keyEl.classList.remove('present', 'absent');
      keyEl.classList.add('correct');
    } else if (currentGame.targetWord.includes(char)) {
      if (!keyEl.classList.contains('correct')) {
        keyEl.classList.remove('absent');
        keyEl.classList.add('present');
      }
    } else {
      if (!keyEl.classList.contains('correct') && !keyEl.classList.contains('present')) {
        keyEl.classList.add('absent');
      }
    }
  });
}

function resetKeyboardColors() {
  const keys = keyboardEl.querySelectorAll('.key');
  keys.forEach(k => k.classList.remove('correct', 'present', 'absent'));
}

function getMaxHints() {
  if (!currentGame.targetWord) return 3;
  const len = currentGame.targetWord.length;
  if (len <= 6) return 3;
  if (len === 7) return 4;
  return 5;
}

function updateHintButtonUI() {
  if (!btnHint) return;

  const maxHints = getMaxHints();

  if (currentGame.status !== 'IN_PROGRESS' || currentGame.hintLevel >= maxHints) {
    btnHint.disabled = true;
    if (currentGame.hintLevel >= maxHints) {
      btnHint.textContent = '💡 Pistas agotadas';
    } else {
      btnHint.textContent = '💡 Pista';
    }
    return;
  }

  btnHint.disabled = false;
  const nextHint = currentGame.hintLevel + 1;

  if (nextHint === 1) {
    btnHint.textContent = `💡 Pista 1/${maxHints} (Descartar letras)`;
  } else if (nextHint === maxHints) {
    btnHint.textContent = `💡 Pista ${nextHint}/${maxHints} (Significado)`;
  } else {
    btnHint.textContent = `💡 Pista ${nextHint}/${maxHints} (Revelar letra)`;
  }
}

async function handleHintClick() {
  const maxHints = getMaxHints();
  if (currentGame.status !== 'IN_PROGRESS' || currentGame.hintLevel >= maxHints) return;

  const adWatched = await simulateRewardedAd();

  if (adWatched) {
    currentGame.hintLevel++;
    saveGameState();
    applyHint(currentGame.hintLevel);
    updateHintButtonUI();
  }
}

function initAdMobPlugin() {
  document.addEventListener('deviceready', () => {
    try {
      if (window.admob && typeof window.admob.start === 'function') {
        window.admob.start();
      }
    } catch (e) {
      console.warn('AdMob seguro:', e);
    }
  }, false);
}

function simulateRewardedAd() {
  return new Promise(async (resolve) => {
    try {
      if (window.admob && window.admob.rewarded && typeof window.admob.rewarded.prepare === 'function') {
        window.admob.rewarded.prepare({
          adId: 'ca-app-pub-3940256099942544/5224354917',
          isTesting: true
        }).then(() => {
          return window.admob.rewarded.show();
        }).then(() => {
          resolve(true);
        }).catch(async (err) => {
          console.warn('AdMob no listo o cancelado:', err);
          const confirmed = await showAlert("🎬 [Simulación de Anuncio]\n\n¿Completar vídeo para obtener la pista?", true);
          resolve(confirmed);
        });
      } else {
        const confirmed = await showAlert("🎬 [Anuncio de prueba]\n\nVisualizando vídeo publicitario de prueba...\n¿Completar vídeo para obtener la pista?", true);
        resolve(confirmed);
      }
    } catch (err) {
      const confirmed = await showAlert("🎬 [Anuncio de prueba]\n\n¿Completar vídeo para obtener la pista?", true);
      resolve(confirmed);
    }
  });
}

function applyHint(level) {
  const maxHints = getMaxHints();

  if (level === 1) {
    checkAndUnlockBadge('b63');
    discardKeyboardLetters(3);
    showAlert(`💡 Pista 1/${maxHints}:\n\nSe han descartado 3 letras del teclado que NO forman parte de la palabra.`);
  } else if (level === maxHints) {
    checkAndUnlockBadge('b65');
    const significado = currentGame.wordObj ? currentGame.wordObj.significado : 'Sin definición disponible.';
    showAlert(`💡 Pista ${level}/${maxHints} (Significado):\n\n"${significado}"`);
  } else {
    checkAndUnlockBadge('b64');
    revealGreenLetter(level, maxHints);
  }
}

function discardKeyboardLetters(count) {
  const target = currentGame.targetWord;
  const allKeys = Array.from(keyboardEl.querySelectorAll('.key'));

  const eligibleKeys = allKeys.filter(keyEl => {
    const key = keyEl.getAttribute('data-key');
    if (!key || key === 'ENTER' || key === 'BACKSPACE') return false;
    return !target.includes(key) && !keyEl.classList.contains('absent');
  });

  const shuffled = eligibleKeys.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);

  selected.forEach(keyEl => {
    keyEl.classList.add('absent');
  });
}

function revealGreenLetter(level, maxHints) {
  const target = currentGame.targetWord;
  const greenMap = getGreenLettersMap();

  const unrevealedIndices = [];
  for (let i = 0; i < target.length; i++) {
    if (!greenMap[i]) {
      unrevealedIndices.push(i);
    }
  }

  if (unrevealedIndices.length === 0) {
    showAlert(`💡 Pista ${level}/${maxHints}:\n\n¡Ya tienes todas las letras del tablero descubiertas!`);
    return;
  }

  const randomIndex = unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
  const letter = target[randomIndex];

  showAlert(`💡 Pista ${level}/${maxHints} (Letra verde):\n\nLa letra en la posición ${randomIndex + 1} es la "${letter}".`);
  renderBoard();
}

function recordStats(isWin, attemptKey) {
  const currentStats = stats[currentGame.mode];
  currentStats.played++;

  if (isWin) {
    currentStats.wins++;
    currentStats.streak++;
    if (currentStats.streak > currentStats.maxStreak) {
      currentStats.maxStreak = currentStats.streak;
    }
    currentStats.distribution[attemptKey] = (currentStats.distribution[attemptKey] || 0) + 1;
  } else {
    currentStats.streak = 0;
    currentStats.distribution['X'] = (currentStats.distribution['X'] || 0) + 1;
  }

  saveStats();
}

function openResultModal(isWin) {
  resultWordDefinition.classList.add('hidden');
  resultCountdownBox.classList.add('hidden');
  btnShare.classList.add('hidden');
  btnNextWord.classList.add('hidden');
  btnRetryWord.classList.add('hidden');

  const textoMostrar = (currentGame.wordObj && currentGame.wordObj.palabraMostrar) 
    ? currentGame.wordObj.palabraMostrar 
    : currentGame.targetWord;

  if (currentGame.mode === 'daily') {
    if (isWin) {
      const attemptCount = currentGame.attempts.length;
      resultBanner.textContent = winMessages[attemptCount] || "¡Felicidades! Has adivinado la palabra.";
      resultBanner.className = 'feedback-banner win';
    } else {
      resultBanner.textContent = `¡Ánimo! La palabra era: ${textoMostrar}`;
      resultBanner.className = 'feedback-banner lose';
    }

    resultWordDefinition.innerHTML = `<strong>${textoMostrar}</strong>: ${currentGame.wordObj.significado}`;
    resultWordDefinition.classList.remove('hidden');

    btnShare.classList.remove('hidden');

    startCountdownTimer();
    resultCountdownBox.classList.remove('hidden');

  } else {
    if (isWin) {
      const attemptCount = currentGame.attempts.length;
      resultBanner.textContent = winMessages[attemptCount] || "¡Felicidades! Has adivinado la palabra.";
      resultBanner.className = 'feedback-banner win';

      resultWordDefinition.innerHTML = `<strong>${textoMostrar}</strong>: ${currentGame.wordObj.significado}`;
      resultWordDefinition.classList.remove('hidden');

      btnShare.classList.remove('hidden');
      btnNextWord.classList.remove('hidden');
    } else {
      resultBanner.textContent = "¡Ánimo! Si la reintentas seguro que la adivinas.";
      resultBanner.className = 'feedback-banner win';

      btnRetryWord.classList.remove('hidden');
    }
  }

  resultModal.classList.remove('hidden');
}

function openDailyAlreadyPlayedModal() {
  resultWordDefinition.classList.add('hidden');
  btnShare.classList.add('hidden');
  btnNextWord.classList.add('hidden');
  btnRetryWord.classList.add('hidden');

  const textoMostrar = (currentGame.wordObj && currentGame.wordObj.palabraMostrar) 
    ? currentGame.wordObj.palabraMostrar 
    : currentGame.targetWord;

  resultBanner.textContent = "¡Ya has jugado la palabra de hoy! Vuelve mañana para un nuevo reto.";
  resultBanner.className = 'feedback-banner win';

  resultWordDefinition.innerHTML = `<strong>${textoMostrar}</strong>: ${currentGame.wordObj.significado}`;
  resultWordDefinition.classList.remove('hidden');

  btnShare.classList.remove('hidden');

  startCountdownTimer();
  resultCountdownBox.classList.remove('hidden');

  resultModal.classList.remove('hidden');
}

function updateMainActionButtons() {
  hideMainActionButtons();

  if (currentGame.mode === 'free') {
    if (currentGame.status === 'WON') {
      btnMainNext.classList.remove('hidden');
    } else if (currentGame.status === 'LOST') {
      btnMainRetry.classList.remove('hidden');
    }
  }
}

function hideMainActionButtons() {
  btnMainNext.classList.add('hidden');
  btnMainRetry.classList.add('hidden');
}

function openStatsModal() {
  renderStatsData();
  statsModal.classList.remove('hidden');
}

function renderStatsData() {
  let combinedStats = {
    played: 0,
    wins: 0,
    streak: 0,
    maxStreak: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, X: 0 }
  };

  if (activeStatsTab === 'daily') {
    combinedStats = stats.daily;
  } else if (activeStatsTab === 'free') {
    combinedStats = stats.free;
  } else {
    combinedStats.played = stats.daily.played + stats.free.played;
    combinedStats.wins = stats.daily.wins + stats.free.wins;
    combinedStats.streak = stats.daily.streak;
    combinedStats.maxStreak = Math.max(stats.daily.maxStreak, stats.free.maxStreak);

    const keys = ['1', '2', '3', '4', '5', '6', 'X'];
    keys.forEach(k => {
      combinedStats.distribution[k] = (stats.daily.distribution[k] || 0) + (stats.free.distribution[k] || 0);
    });
  }

  document.getElementById('stat-played').textContent = combinedStats.played;
  const winrate = combinedStats.played > 0 ? Math.round((combinedStats.wins / combinedStats.played) * 100) : 0;
  document.getElementById('stat-winrate').textContent = `${winrate}%`;
  document.getElementById('stat-streak').textContent = combinedStats.streak;
  document.getElementById('stat-maxstreak').textContent = combinedStats.maxStreak;

  renderDistribution(combinedStats);
}

function renderDistribution(statsObj) {
  const container = document.getElementById('guess-distribution');
  container.innerHTML = '';

  const totalPlayed = statsObj.played || 0;
  const keys = ['1', '2', '3', '4', '5', '6', 'X'];
  const maxVal = Math.max(...keys.map(k => statsObj.distribution[k] || 0), 1);

  keys.forEach(key => {
    const val = statsObj.distribution[key] || 0;
    const pctBar = Math.max((val / maxVal) * 100, 8);
    const pctTotal = totalPlayed > 0 ? Math.round((val / totalPlayed) * 100) : 0;

    const row = document.createElement('div');
    row.className = 'dist-row';
    row.innerHTML = `
      <span class="dist-num">${key}</span>
      <div class="dist-bar-bg">
        <div class="dist-bar-fill" style="width: ${pctBar}%">
          ${val} (${pctTotal}%)
        </div>
      </div>
    `;
    container.appendChild(row);
  });
}

function startCountdownTimer() {
  if (countdownInterval) clearInterval(countdownInterval);

  function updateTimer() {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const diff = tomorrow - now;

    const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
    const mins = Math.floor((diff / (1000 * 60)) % 60).toString().padStart(2, '0');
    const secs = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');

    dailyTimer.textContent = `${hours}:${secs}`;
  }

  updateTimer();
  countdownInterval = setInterval(updateTimer, 1000);
}

function shareResults() {
  checkAndUnlockBadge('b81');
  if (currentGame.attempts.length === 1) checkAndUnlockBadge('b90');

  let shareText = `Wordle Aragonés - ${currentGame.mode === 'daily' ? 'Palabra del Día' : 'Modo Libre'}\n`;
  shareText += `${currentGame.attempts.length}/6\n\n`;

  currentGame.attempts.forEach(att => {
    att.split('').forEach((char, idx) => {
      if (currentGame.targetWord[idx] === char) shareText += '🟩';
      else if (currentGame.targetWord.includes(char)) shareText += '🟨';
      else shareText += '⬜';
    });
    shareText += '\n';
  });

  if (navigator.clipboard) {
    navigator.clipboard.writeText(shareText).then(() => {
      showAlert('¡Resultado copiado al portapapeles!');
    });
  } else {
    showAlert(shareText);
  }
}
