let validWords = [];

let currentGame = {
  mode: 'daily', // 'daily', 'free', 'timeattack', 'definitions'
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

// Variables específicas para el Modo Contrarreloj (120 segundos iniciales)
let timeAttackState = {
  timeLeft: 120, 
  score: 0,     
  timerInterval: null,
  isActive: false
};

// Variables específicas para el Modo Definiciones (90 segundos fijos)
let definitionsState = {
  timeLeft: 90, 
  score: 0,     
  timerInterval: null,
  isActive: false
};

// Estadísticas separadas por modo
let stats = {
  daily: { played: 0, wins: 0, streak: 0, maxStreak: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, X: 0 } },
  free: { played: 0, wins: 0, streak: 0, maxStreak: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, X: 0 } },
  timeattack: { played: 0, wins: 0, streak: 0, maxStreak: 0, bestScore: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, X: 0 } },
  definitions: { played: 0, wins: 0, streak: 0, maxStreak: 0, bestScore: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, X: 0 } }
};

let unlockedWords = [];
let activeStatsTab = 'daily';
let countdownInterval = null;

const winMessages = {
  1: "¡Increíble! ¡Adivinada a la primera! 🎯",
  2: "¡Espectacular! ¡En solo dos intentos! ⭐",
  3: "¡Excelente! ¡A la tercera va la vencida! 👏",
  4: "¡Muy bien! ¡Palabra adivinada! 👍",
  5: "¡Bien jugado! ¡Casi al límite! 😊",
  6: "¡Uff! ¡Adivinada en el último intento! 😅"
};

const BADGES_LIST = [
  { id: 'b1', name: 'Primer Paso', icon: '🥉', desc: 'Completa tu primera Palabra del Día' },
  { id: 'b2', name: 'Tres Seguidos', icon: '🔥', desc: 'Mantén una racha de 3 días consecutivos' },
  { id: 'b3', name: 'Constancia Semanal', icon: '🗓️', desc: 'Mantén una racha de 7 días consecutivos' },
  { id: 'b4', name: 'Dos Semanas Imparable', icon: '⭐', desc: 'Mantén una racha de 14 días consecutivos' },
  { id: 'b5', name: 'Mes Ininterrumpido', icon: '🏆', desc: 'Mantén una racha de 30 días consecutivos' },
  { id: 'b6', name: 'Bimestre Fiel', icon: '🏅', desc: 'Mantén una racha de 60 días consecutivos' },
  { id: 'b7', name: 'Trimestre Dorado', icon: '👑', desc: 'Mantén una racha de 90 días consecutivos' },
  { id: 'b8', name: 'Medio Año Activo', icon: '🏔️', desc: 'Mantén una racha de 180 días consecutivos' },
  { id: 'b9', name: 'Año Completo', icon: '🌟', desc: 'Mantén una racha de 365 días consecutivos' },
  { id: 'b10', name: 'Segunda Oportunidad', icon: '🔄', desc: 'Recupera una racha tras perderla' },
  { id: 'b11', name: 'Iniciador', icon: '🌱', desc: 'Consigue 5 victorias en total' },
  { id: 'b12', name: 'Principiante Prometedor', icon: '🌿', desc: 'Consigue 10 victorias en total' },
  { id: 'b13', name: 'Coleccionista de Palabras', icon: '📚', desc: 'Consigue 25 victorias en total' },
  { id: 'b14', name: 'Experto en Vocabulario', icon: '🧠', desc: 'Consigue 50 victorias en total' },
  { id: 'b15', name: 'Centenario', icon: '💯', desc: 'Consigue 100 victorias en total' },
  { id: 'b16', name: 'Gran Jugador', icon: '📜', desc: 'Consigue 200 victorias en total' },
  { id: 'b17', name: 'Maestro de las Palabras', icon: '🏛️', desc: 'Consigue 350 victorias en total' },
  { id: 'b18', name: 'Enciclopedia Humana', icon: '🧙‍♂️', desc: 'Consigue 500 victorias en total' },
  { id: 'b19', name: 'Leyenda del Juego', icon: '👑', desc: 'Consigue 750 victorias en total' },
  { id: 'b20', name: 'Mítico', icon: '💎', desc: 'Consigue 1000 victorias en total' }
];

let unlockedBadges = [];

function loadUnlockedBadges() {
  const saved = localStorage.getItem('palabra_aragonesa_badges');
  if (saved) {
    try { unlockedBadges = JSON.parse(saved); } catch (e) { unlockedBadges = []; }
  }
}

function checkAndUnlockBadge(badgeId) {
  loadUnlockedBadges();
  if (!unlockedBadges.includes(badgeId)) {
    unlockedBadges.push(badgeId);
    localStorage.setItem('palabra_aragonesa_badges', JSON.stringify(unlockedBadges));
    const badgeObj = BADGES_LIST.find(b => b.id === badgeId);
    if (badgeObj) {
      setTimeout(() => {
        showAlert(`🏅 ¡Nuevo Emblema Desbloqueado!\n\n${badgeObj.icon} ${badgeObj.name}\n${badgeObj.desc}`);
      }, 600);
    }
  }
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

// Elementos Modal Introducción por Modo
const modeIntroModal = document.getElementById('mode-intro-modal');
const modeIntroTitle = document.getElementById('mode-intro-title');
const modeIntroText = document.getElementById('mode-intro-text');
const dontShowModeIntro = document.getElementById('dont-show-mode-intro');
const modeIntroOkBtn = document.getElementById('mode-intro-ok-btn');

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
const btnModeTimeAttack = document.getElementById('btn-mode-timeattack');
const btnModeDefinitions = document.getElementById('btn-mode-definitions');

const freeControls = document.getElementById('free-mode-controls');
const timeAttackControls = document.getElementById('timeattack-controls');
const timeAttackTimerBadge = document.getElementById('timeattack-timer-badge');
const timeAttackScoreBadge = document.getElementById('timeattack-score-badge');

const definitionsControls = document.getElementById('definitions-controls');
const definitionsTimerBadge = document.getElementById('definitions-timer-badge');
const definitionsScoreBadge = document.getElementById('definitions-score-badge');
const definitionsBoxPanel = document.getElementById('definitions-box-panel');
const definitionsTextSpan = document.getElementById('definitions-text-span');

const wordBadge = document.getElementById('word-number-badge');
const dailyCompletedBanner = document.getElementById('daily-completed-banner');

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

function showAlert(message, isConfirm = false) {
  return new Promise((resolve) => {
    customAlertMessage.innerText = message;
    customAlertModal.classList.remove('hidden');
    if (isConfirm) customAlertCancelBtn.classList.remove('hidden');
    else customAlertCancelBtn.classList.add('hidden');

    const onOk = () => { cleanup(); resolve(true); };
    const onCancel = () => { cleanup(); resolve(false); };
    const cleanup = () => {
      customAlertModal.classList.add('hidden');
      customAlertOkBtn.removeEventListener('click', onOk);
      customAlertCancelBtn.removeEventListener('click', onCancel);
    };
    customAlertOkBtn.addEventListener('click', onOk);
    customAlertCancelBtn.addEventListener('click', onCancel);
  });
}

function setupDailyReminderNotification() {
  if (!('serviceWorker' in navigator) || !('Notification' in window)) return;
  navigator.serviceWorker.register('sw.js').then(registration => {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') scheduleLocalNotification(registration);
      });
    } else if (Notification.permission === 'granted') {
      scheduleLocalNotification(registration);
    }
  }).catch(err => console.error('Error SW:', err));
}

function scheduleLocalNotification(registration) {
  const savedDaily = localStorage.getItem('palabra_aragonesa_daily_game');
  let playedToday = false;
  if (savedDaily) {
    try {
      const data = JSON.parse(savedDaily);
      if (data.date === getTodayString() && data.status !== 'IN_PROGRESS') playedToday = true;
    } catch (e) {}
  }
  if (playedToday) return;

  const now = new Date();
  const reminderTime = new Date();
  reminderTime.setHours(20, 0, 0, 0);
  if (now > reminderTime) reminderTime.setDate(reminderTime.getDate() + 1);

  if ('showTrigger' in Notification.prototype) {
    registration.showNotification("La Palabra Aragonesa del Día", {
      body: "¿Has resuelto ya la palabra aragonesa de hoy? 🎯 ¡Entra y acepta el reto!",
      icon: "favicon.png",
      tag: "daily-reminder",
      showTrigger: new TimestampTrigger(reminderTime.getTime())
    });
  }
}

function loadUnlockedWords() {
  const saved = localStorage.getItem('palabra_aragonesa_unlocked_words');
  unlockedWords = saved ? JSON.parse(saved) : [];

  const savedFreeIndex = localStorage.getItem('palabra_aragonesa_free_index');
  if (savedFreeIndex !== null && validWords && validWords.length > 0) {
    const currentIndex = parseInt(savedFreeIndex, 10) || 0;
    let hasNewImport = false;
    for (let i = 0; i < currentIndex; i++) {
      const wObj = validWords[i];
      if (!wObj) continue;
      const wordId = wObj.id || wObj.palabra;
      const exists = unlockedWords.some(item => item.id === wordId || item.palabra.toUpperCase().trim() === wObj.palabra.toUpperCase().trim());
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
    return displayWord.toLowerCase().includes(filterText.toLowerCase()) || item.significado.toLowerCase().includes(filterText.toLowerCase());
  });

  if (filtered.length === 0) {
    dictionaryList.innerHTML = `<div class="dict-empty-msg">${unlockedWords.length === 0 ? 'Aún no has descubierto ninguna palabra.' : 'No se encontraron palabras.'}</div>`;
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'dict-card';
    const originalObj = validWords.find(w => (w.id && w.id === item.id) || w.palabra.toUpperCase().trim() === item.palabra.toUpperCase().trim());
    const textoMostrar = (originalObj && originalObj.palabraMostrar) || item.palabraMostrar || item.palabra;
    card.innerHTML = `
      <div class="dict-card-header"><span class="dict-word">${textoMostrar}</span></div>
      <div class="dict-definition">${item.significado}</div>
    `;
    dictionaryList.appendChild(card);
  });
}

function loadSavedStats() {
  const saved = localStorage.getItem('palabra_aragonesa_stats_v2');
  if (saved) {
    try { 
      const parsed = JSON.parse(saved);
      if (parsed) {
        stats = { ...stats, ...parsed };
        if (parsed.timeattack) stats.timeattack = { ...stats.timeattack, ...parsed.timeattack };
        if (parsed.definitions) stats.definitions = { ...stats.definitions, ...parsed.definitions };
      }
    } catch (e) {}
  }
  const savedFreeIndex = localStorage.getItem('palabra_aragonesa_free_index');
  if (savedFreeIndex !== null) currentGame.freeWordIndex = parseInt(savedFreeIndex, 10) || 0;
}

function saveStats() {
  localStorage.setItem('palabra_aragonesa_stats_v2', JSON.stringify(stats));
}

function saveGameState() {
  if (currentGame.mode === 'daily') {
    localStorage.setItem('palabra_aragonesa_daily_game', JSON.stringify({
      date: getTodayString(), attempts: currentGame.attempts, status: currentGame.status, hintLevel: currentGame.hintLevel
    }));
  } else if (currentGame.mode === 'free') {
    localStorage.setItem('palabra_aragonesa_free_game', JSON.stringify({
      wordIndex: currentGame.freeWordIndex, attempts: currentGame.attempts, status: currentGame.status, hintLevel: currentGame.hintLevel
    }));
  }
}

function loadWordsJSON() {
  fetch('words.json?v=' + new Date().getTime())
    .then(res => res.json())
    .then(data => {
      validWords = data.filter(item => item.palabra && item.palabra.trim().length >= 5 && item.palabra.trim().length <= 9);
      if (validWords.length === 0) return;
      loadUnlockedWords();
      checkFirstVisitTutorial();
      initGame('daily');
    })
    .catch(err => console.error('Error al cargar words.json:', err));
}

function checkFirstVisitTutorial() {
  if (!localStorage.getItem('palabra_aragonesa_hide_help')) {
    helpModal.classList.remove('hidden');
  }
}

// Comprueba y muestra la introducción específica de un modo si es su primera vez
function checkModeIntroduction(mode) {
  const key = `palabra_aragonesa_intro_${mode}`;
  if (!localStorage.getItem(key)) {
    let title = '';
    let desc = '';
    if (mode === 'daily') {
      title = '📅 Palabra del Día';
      desc = '¡Bienvenido al reto diario oficial! Cada día encontrarás una nueva palabra aragonesa para adivinar en 6 intentos. Todos los jugadores de la comunidad juegan la misma palabra. ¡Acepta el desafío y mantén tu racha!';
    } else if (mode === 'free') {
      title = '🗺️ Modo Libre';
      desc = 'Practica sin límites de tiempo ni restricciones diarias. Descubre palabras de la lengua aragonesa a tu propio ritmo, avanza a la siguiente o reintenta las que se te resistan.';
    } else if (mode === 'timeattack') {
      title = '⚡ Modo Contrarreloj';
      desc = 'Dispones de 2 minutos iniciales para adivinar tantas palabras de 5 y 6 letras como te sea posible. ¡Cada acierto te premia con 15 segundos extra en el crono!';
    } else if (mode === 'definitions') {
      title = '📜 Modo Definiciones';
      desc = 'Pon a prueba tu vocabulario cultural: dispones de 90 segundos fijos para adivinar palabras guiándote exclusivamente por su definición. ¡Demuestra tu agilidad y vocabulario!';
    }

    modeIntroTitle.textContent = title;
    modeIntroText.textContent = desc;
    dontShowModeIntro.checked = false;
    modeIntroModal.classList.remove('hidden');

    modeIntroOkBtn.onclick = () => {
      if (dontShowModeIntro.checked) {
        localStorage.setItem(key, 'true');
      }
      modeIntroModal.classList.add('hidden');
    };
  }
}

function initEventListeners() {
  btnHelp.addEventListener('click', () => helpModal.classList.remove('hidden'));
  closeHelp.addEventListener('click', () => helpModal.classList.add('hidden'));
  startGameBtn.addEventListener('click', () => {
    if (dontShowHelp.checked) localStorage.setItem('palabra_aragonesa_hide_help', 'true');
    helpModal.classList.add('hidden');
  });

  if (btnBadges) {
    btnBadges.addEventListener('click', () => { renderBadgesGrid(); badgesModal.classList.remove('hidden'); });
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
    dictSearchInput.addEventListener('input', (e) => renderDictionaryList(e.target.value));
  }

  if (btnHint) btnHint.addEventListener('click', handleHintClick);

  btnCloseResultModal.addEventListener('click', () => {
    resultModal.classList.add('hidden');
    updateMainActionButtons();
    if (currentGame.mode === 'timeattack' && !timeAttackState.isActive) {
      initGame('timeattack');
    } else if (currentGame.mode === 'definitions' && !definitionsState.isActive) {
      initGame('definitions');
    }
  });

  btnStats.addEventListener('click', () => { checkAndUnlockBadge('b86'); openStatsModal(); });
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
  if (btnModeTimeAttack) btnModeTimeAttack.addEventListener('click', () => switchMode('timeattack'));
  if (btnModeDefinitions) btnModeDefinitions.addEventListener('click', () => switchMode('definitions'));

  btnNextWord.addEventListener('click', () => {
    if (currentGame.mode === 'timeattack') {
      resultModal.classList.add('hidden');
      loadRandomTimeAttackWord();
      resetCurrentWord();
    } else if (currentGame.mode === 'definitions') {
      resultModal.classList.add('hidden');
      loadRandomDefinitionsWord();
      resetCurrentWord();
    } else {
      nextFreeWord();
    }
  });
  
  btnRetryWord.addEventListener('click', () => {
    if (currentGame.mode === 'timeattack') {
      resultModal.classList.add('hidden');
      initGame('timeattack');
    } else if (currentGame.mode === 'definitions') {
      resultModal.classList.add('hidden');
      initGame('definitions');
    } else {
      retryFreeWord();
    }
  });

  btnMainNext.addEventListener('click', nextFreeWord);
  btnMainRetry.addEventListener('click', retryFreeWord);
  btnShare.addEventListener('click', shareResults);

  keyboardEl.addEventListener('click', (e) => {
    const target = e.target.closest('.key');
    if (!target) return;
    handleKeyPress(target.getAttribute('data-key'));
  });

  document.addEventListener('keydown', (e) => {
    if (!helpModal.classList.contains('hidden') || 
        !statsModal.classList.contains('hidden') || 
        !resultModal.classList.contains('hidden') ||
        !dictionaryModal.classList.contains('hidden') ||
        !badgesModal.classList.contains('hidden') ||
        !customAlertModal.classList.contains('hidden') ||
        !modeIntroModal.classList.contains('hidden')) return;

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

  if (currentGame.mode === 'timeattack') stopTimeAttackTimer();
  if (currentGame.mode === 'definitions') stopDefinitionsTimer();

  if (btnModeDaily) btnModeDaily.classList.toggle('active', mode === 'daily');
  if (btnModeFree) btnModeFree.classList.toggle('active', mode === 'free');
  if (btnModeTimeAttack) btnModeTimeAttack.classList.toggle('active', mode === 'timeattack');
  if (btnModeDefinitions) btnModeDefinitions.classList.toggle('active', mode === 'definitions');

  if (freeControls) freeControls.classList.toggle('hidden', mode !== 'free');
  if (timeAttackControls) timeAttackControls.classList.toggle('hidden', mode !== 'timeattack');
  if (definitionsControls) definitionsControls.classList.toggle('hidden', mode !== 'definitions');
  if (definitionsBoxPanel) definitionsBoxPanel.classList.toggle('hidden', mode !== 'definitions');

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

// --- TEMPORIZADOR MODO CONTRARRELOJ (120s) ---
function startTimeAttackTimer() {
  stopTimeAttackTimer();
  timeAttackState.isActive = true;
  timeAttackState.timerInterval = setInterval(() => {
    if (timeAttackState.timeLeft > 0) {
      timeAttackState.timeLeft--;
      updateTimeAttackUI();
    } else {
      stopTimeAttackTimer();
      timeAttackState.isActive = false;
      currentGame.status = 'LOST';
      recordTimeAttackEnd();
      openTimeAttackResultModal();
    }
  }, 1000);
}

function stopTimeAttackTimer() {
  if (timeAttackState.timerInterval) {
    clearInterval(timeAttackState.timerInterval);
    timeAttackState.timerInterval = null;
  }
}

function updateTimeAttackUI() {
  if (!timeAttackTimerBadge) return;
  const mins = Math.floor(timeAttackState.timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeAttackState.timeLeft % 60).toString().padStart(2, '0');
  timeAttackTimerBadge.textContent = `⏱️ ${mins}:${secs}`;
  if (timeAttackScoreBadge) timeAttackScoreBadge.textContent = `🔥 Palabras: ${timeAttackState.score}`;
}

function loadRandomTimeAttackWord() {
  const pool = validWords.filter(w => {
    const len = w.palabra.trim().length;
    return len >= 5 && len <= 6;
  });
  currentGame.wordObj = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : validWords[0];
  currentGame.targetWord = currentGame.wordObj.palabra.toUpperCase().trim();
}

// --- TEMPORIZADOR MODO DEFINICIONES (90s fijos) ---
function startDefinitionsTimer() {
  stopDefinitionsTimer();
  definitionsState.isActive = true;
  definitionsState.timerInterval = setInterval(() => {
    if (definitionsState.timeLeft > 0) {
      definitionsState.timeLeft--;
      updateDefinitionsUI();
    } else {
      stopDefinitionsTimer();
      definitionsState.isActive = false;
      currentGame.status = 'LOST';
      recordDefinitionsEnd();
      openDefinitionsResultModal();
    }
  }, 1000);
}

function stopDefinitionsTimer() {
  if (definitionsState.timerInterval) {
    clearInterval(definitionsState.timerInterval);
    definitionsState.timerInterval = null;
  }
}

function updateDefinitionsUI() {
  if (!definitionsTimerBadge) return;
  const mins = Math.floor(definitionsState.timeLeft / 60).toString().padStart(2, '0');
  const secs = (definitionsState.timeLeft % 60).toString().padStart(2, '0');
  definitionsTimerBadge.textContent = `⏱️ ${mins}:${secs}`;
  if (definitionsScoreBadge) definitionsScoreBadge.textContent = `🔥 Palabras: ${definitionsState.score}`;
}

function loadRandomDefinitionsWord() {
  const pool = validWords.filter(w => w.significado && w.significado.trim().length > 0);
  currentGame.wordObj = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : validWords[0];
  currentGame.targetWord = currentGame.wordObj.palabra.toUpperCase().trim();
  if (definitionsTextSpan && currentGame.wordObj) {
    definitionsTextSpan.textContent = currentGame.wordObj.significado;
  }
}

function initGame(mode) {
  currentGame.mode = mode;
  currentGame.attempts = [];
  currentGame.status = 'IN_PROGRESS';
  currentGame.animatedRows = [];
  currentGame.hintLevel = 0;
  if (dailyCompletedBanner) dailyCompletedBanner.classList.add('hidden');
  hideMainActionButtons();

  if (freeControls) freeControls.classList.toggle('hidden', mode !== 'free');
  if (timeAttackControls) timeAttackControls.classList.toggle('hidden', mode !== 'timeattack');
  if (definitionsControls) definitionsControls.classList.toggle('hidden', mode !== 'definitions');
  if (definitionsBoxPanel) definitionsBoxPanel.classList.toggle('hidden', mode !== 'definitions');

  stopTimeAttackTimer();
  stopDefinitionsTimer();

  // Comprobar si hay que mostrar la intro del modo
  checkModeIntroduction(mode);

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
          if (currentGame.status === 'WON') unlockCurrentWord();
          if (currentGame.status === 'WON' || currentGame.status === 'LOST') {
            if (dailyCompletedBanner) dailyCompletedBanner.classList.remove('hidden');
            openDailyAlreadyPlayedModal();
          }
        }
      } catch (e) {}
    }
  } else if (mode === 'free') {
    if (currentGame.freeWordIndex >= validWords.length) currentGame.freeWordIndex = 0;
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
          if (currentGame.status === 'WON') { unlockCurrentWord(); updateMainActionButtons(); }
          else if (currentGame.status === 'LOST') updateMainActionButtons();
        }
      } catch (e) {}
    }
  } else if (mode === 'timeattack') {
    timeAttackState.timeLeft = 120;
    timeAttackState.score = 0;
    updateTimeAttackUI();
    loadRandomTimeAttackWord();
    startTimeAttackTimer();
  } else if (mode === 'definitions') {
    definitionsState.timeLeft = 90;
    definitionsState.score = 0;
    updateDefinitionsUI();
    loadRandomDefinitionsWord();
    startDefinitionsTimer();
  }

  resetInputArray();
  resetKeyboardColors();
  if (currentGame.attempts.length > 0) currentGame.attempts.forEach(att => updateKeyboardColors(att));
  if (currentGame.hintLevel >= 1) discardKeyboardLetters(3);

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
      if (currentGame.currentInput[i] === '') { nextEmpty = i; break; }
    }
    if (nextEmpty !== -1) currentGame.selectedTileIndex = nextEmpty;
    else if (currentGame.selectedTileIndex < wordLength - 1) currentGame.selectedTileIndex++;
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
    
    if (currentGame.mode === 'timeattack') {
      timeAttackState.score++;
      timeAttackState.timeLeft += 15;
      updateTimeAttackUI();
    } else if (currentGame.mode === 'definitions') {
      definitionsState.score++;
      // Sin bonificación de tiempo: se mantienen los 90s fijos
      updateDefinitionsUI();
      setTimeout(() => {
        loadRandomDefinitionsWord();
        resetCurrentWord();
        resetKeyboardColors();
        updateHintButtonUI();
        renderBoard();
      }, 500);
      return;
    } else {
      recordStats(true, currentGame.attempts.length);
    }
  } else if (isLoss) {
    if (currentGame.mode === 'timeattack') {
      renderBoard();
      currentGame.animatedRows.push(currentGame.attempts.length - 1);
      setTimeout(() => {
        showAlert(`¡Intentos agotados! La palabra era: ${currentGame.targetWord}.`);
        resetCurrentWord();
        loadRandomTimeAttackWord();
        resetKeyboardColors();
        updateHintButtonUI();
        renderBoard();
      }, 500);
      return;
    } else if (currentGame.mode === 'definitions') {
      renderBoard();
      currentGame.animatedRows.push(currentGame.attempts.length - 1);
      setTimeout(() => {
        showAlert(`¡Intentos agotados! La palabra era: ${currentGame.targetWord}.`);
        resetCurrentWord();
        loadRandomDefinitionsWord();
        resetKeyboardColors();
        updateHintButtonUI();
        renderBoard();
      }, 500);
      return;
    } else {
      currentGame.status = 'LOST';
      recordStats(false, 'X');
    }
  }

  saveGameState();
  updateHintButtonUI();

  if (currentGame.mode === 'daily' && (isWin || isLoss)) {
    if (dailyCompletedBanner) dailyCompletedBanner.classList.remove('hidden');
  }

  renderBoard();
  currentGame.animatedRows.push(currentGame.attempts.length - 1);

  if (currentGame.mode === 'timeattack' && isWin) {
    setTimeout(() => {
      loadRandomTimeAttackWord();
      resetCurrentWord();
      resetKeyboardColors();
      updateHintButtonUI();
      renderBoard();
    }, 700);
    return;
  }

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
      if (currentGame.targetWord[idx] === char) greenMap[idx] = char;
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
        tile.addEventListener('click', () => { currentGame.selectedTileIndex = c; renderBoard(); });
        if (c === currentGame.selectedTileIndex) tile.classList.add('selected');
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
  keyboardEl.querySelectorAll('.key').forEach(k => k.classList.remove('correct', 'present', 'absent'));
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
    btnHint.textContent = currentGame.hintLevel >= maxHints ? '💡 Pistas agotadas' : '💡 Pista';
    return;
  }
  btnHint.disabled = false;
  const nextHint = currentGame.hintLevel + 1;
  if (nextHint === 1) btnHint.textContent = `💡 Pista 1/${maxHints} (Descartar letras)`;
  else if (nextHint === maxHints) btnHint.textContent = `💡 Pista ${nextHint}/${maxHints} (Significado)`;
  else btnHint.textContent = `💡 Pista ${nextHint}/${maxHints} (Revelar letra)`;
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
    try { if (window.admob && typeof window.admob.start === 'function') window.admob.start(); } catch (e) {}
  }, false);
}

function simulateRewardedAd() {
  return new Promise(async (resolve) => {
    const confirmed = await showAlert("🎬 [Anuncio de prueba]\n\n¿Completar vídeo para obtener la pista?", true);
    resolve(confirmed);
  });
}

function applyHint(level) {
  const maxHints = getMaxHints();
  if (level === 1) {
    discardKeyboardLetters(3);
    showAlert(`💡 Pista 1/${maxHints}:\n\nSe han descartado 3 letras del teclado.`);
  } else if (level === maxHints) {
    const significado = currentGame.wordObj ? currentGame.wordObj.significado : 'Sin definición.';
    showAlert(`💡 Pista ${level}/${maxHints} (Significado):\n\n"${significado}"`);
  } else {
    revealGreenLetter(level, maxHints);
  }
}

function discardKeyboardLetters(count) {
  const target = currentGame.targetWord;
  const eligibleKeys = Array.from(keyboardEl.querySelectorAll('.key')).filter(keyEl => {
    const key = keyEl.getAttribute('data-key');
    return key && key !== 'ENTER' && key !== 'BACKSPACE' && !target.includes(key) && !keyEl.classList.contains('absent');
  });
  eligibleKeys.sort(() => 0.5 - Math.random()).slice(0, count).forEach(k => k.classList.add('absent'));
}

function revealGreenLetter(level, maxHints) {
  const target = currentGame.targetWord;
  const greenMap = getGreenLettersMap();
  const unrevealed = [];
  for (let i = 0; i < target.length; i++) {
    if (!greenMap[i]) unrevealed.push(i);
  }
  if (unrevealed.length === 0) return;
  const randomIndex = unrevealed[Math.floor(Math.random() * unrevealed.length)];
  showAlert(`💡 Pista ${level}/${maxHints}:\n\nLa letra en la posición ${randomIndex + 1} es la "${target[randomIndex]}".`);
  renderBoard();
}

function recordStats(isWin, attemptKey) {
  if (currentGame.mode === 'timeattack' || currentGame.mode === 'definitions') return;
  const currentStats = stats[currentGame.mode];
  currentStats.played++;
  if (isWin) {
    currentStats.wins++;
    currentStats.streak++;
    if (currentStats.streak > currentStats.maxStreak) currentStats.maxStreak = currentStats.streak;
    currentStats.distribution[attemptKey] = (currentStats.distribution[attemptKey] || 0) + 1;
  } else {
    currentStats.streak = 0;
    currentStats.distribution['X'] = (currentStats.distribution['X'] || 0) + 1;
  }
  saveStats();
}

function recordTimeAttackEnd() {
  if (!stats.timeattack) stats.timeattack = { played: 0, wins: 0, streak: 0, maxStreak: 0, bestScore: 0, distribution: {} };
  if (timeAttackState.score > (stats.timeattack.bestScore || 0)) stats.timeattack.bestScore = timeAttackState.score;
  saveStats();
}

function recordDefinitionsEnd() {
  if (!stats.definitions) stats.definitions = { played: 0, wins: 0, streak: 0, maxStreak: 0, bestScore: 0, distribution: {} };
  if (definitionsState.score > (stats.definitions.bestScore || 0)) stats.definitions.bestScore = definitionsState.score;
  saveStats();
}

function openResultModal(isWin) {
  if (currentGame.mode === 'timeattack' || currentGame.mode === 'definitions') return;

  resultWordDefinition.classList.add('hidden');
  resultCountdownBox.classList.add('hidden');
  btnShare.classList.add('hidden');
  btnNextWord.classList.add('hidden');
  btnRetryWord.classList.add('hidden');

  const textoMostrar = (currentGame.wordObj && currentGame.wordObj.palabraMostrar) || currentGame.targetWord;

  if (currentGame.mode === 'daily') {
    if (isWin) {
      resultBanner.textContent = winMessages[currentGame.attempts.length] || "¡Felicidades!";
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
      resultBanner.textContent = winMessages[currentGame.attempts.length] || "¡Felicidades!";
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

// Mensajes dinámicos y motivacionales según aciertos en Contrarreloj
function openTimeAttackResultModal() {
  resultWordDefinition.classList.add('hidden');
  resultCountdownBox.classList.add('hidden');
  btnShare.classList.remove('hidden');
  btnNextWord.classList.add('hidden');
  btnRetryWord.classList.remove('hidden');

  const score = timeAttackState.score;
  const textoMostrar = (currentGame.wordObj && currentGame.wordObj.palabraMostrar) || currentGame.targetWord;

  let dynamicMsg = "";
  if (score === 0) {
    dynamicMsg = "¡Vaya, no te dio tiempo a completar ninguna! No te preocupes, la práctica hace al maestro. ¡Inténtalo de nuevo y seguro que superas el cero! 🎯💪";
  } else if (score >= 1 && score <= 3) {
    dynamicMsg = `¡Buen trabajo! Has conseguido <strong>${score}</strong> palabra(s). Tienes buena base, pero con un poquito más de agilidad seguro que bates tu récord la próxima vez. ¡A por todas! 🚀🔥`;
  } else if (score >= 4 && score <= 7) {
    dynamicMsg = `¡Excelente ritmo! Has acertado <strong>${score}</strong> palabras. Demuestras una gran agilidad mental con el vocabulario aragonés. ¡Estás muy cerca de la élite, sigue así! ⭐🏅`;
  } else {
    dynamicMsg = `¡Impresionante! ¡Una auténtica barbaridad! Has logrado resolver <strong>${score}</strong> palabras en tiempo récord. ¡Eres una leyenda viva de la contrarreloj aragonesa! 👑⚡🔥`;
  }

  resultBanner.innerHTML = `⚡ ¡Tiempo agotado (Contrarreloj)!<br><br>${dynamicMsg}<br><br>La última palabra era: <strong>${textoMostrar}</strong>.`;
  resultBanner.className = 'feedback-banner lose';

  btnRetryWord.textContent = "🔄 Jugar otra vez";
  resultModal.classList.remove('hidden');
}

// Mensajes dinámicos y motivacionales según aciertos en Definiciones
function openDefinitionsResultModal() {
  resultWordDefinition.classList.add('hidden');
  resultCountdownBox.classList.add('hidden');
  btnShare.classList.remove('hidden');
  btnNextWord.classList.add('hidden');
  btnRetryWord.classList.remove('hidden');

  const score = definitionsState.score;
  const textoMostrar = (currentGame.wordObj && currentGame.wordObj.palabraMostrar) || currentGame.targetWord;

  let dynamicMsg = "";
  if (score === 0) {
    dynamicMsg = "¡Las definiciones rápidas son difíciles! No te desanimes, lee con atención las pistas de significado y lánzate a por tu primera palabra. ¡Tú puedes con la siguiente! 📖💪";
  } else if (score >= 1 && score <= 2) {
    dynamicMsg = `¡Bien hecho! Has acertado <strong>${score}</strong> palabra(s) por definición. Conoces el significado cultural, ¡sigue entrenando para duplicar tu marca en el siguiente intento! 💡📈`;
  } else if (score >= 3 && score <= 5) {
    dynamicMsg = `¡Gran nivel cultural! Has conseguido <strong>${score}</strong> aciertos interpretando definiciones. ¡Demuestras un dominio envidiable del tesoro léxico aragonés! Sigue superándote. 🌟👏`;
  } else {
    dynamicMsg = `¡Erudito absoluto! ¡<strong>${score}</strong> palabras acertadas por definición en 90 segundos! Es un resultado extraordinario. ¡Tu vocabulario es impecable, sigue rompiendo récords! 🏛️💎👑`;
  }

  resultBanner.innerHTML = `📜 ¡Tiempo agotado (Definiciones)!<br><br>${dynamicMsg}<br><br>La última palabra era: <strong>${textoMostrar}</strong>.`;
  resultBanner.className = 'feedback-banner lose';

  btnRetryWord.textContent = "🔄 Jugar otra vez";
  resultModal.classList.remove('hidden');
}

function openDailyAlreadyPlayedModal() {
  resultWordDefinition.classList.add('hidden');
  btnShare.classList.add('hidden');
  btnNextWord.classList.add('hidden');
  btnRetryWord.classList.add('hidden');

  const textoMostrar = (currentGame.wordObj && currentGame.wordObj.palabraMostrar) || currentGame.targetWord;
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
    if (currentGame.status === 'WON') btnMainNext.classList.remove('hidden');
    else if (currentGame.status === 'LOST') btnMainRetry.classList.remove('hidden');
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
  const summaryBox = document.querySelector('.stats-summary');
  const distributionTitle = document.querySelector('#stats-modal h3');
  const distributionContainer = document.getElementById('guess-distribution');
  
  const taRecordContainer = document.getElementById('stat-timeattack-record-container');
  const taBestEl = document.getElementById('stat-timeattack-best');

  const defRecordContainer = document.getElementById('stat-definitions-record-container');
  const defBestEl = document.getElementById('stat-definitions-best');

  if (activeStatsTab === 'timeattack') {
    if (summaryBox) summaryBox.style.display = 'none';
    if (distributionTitle) distributionTitle.style.display = 'none';
    if (distributionContainer) distributionContainer.style.display = 'none';
    if (defRecordContainer) defRecordContainer.classList.add('hidden');

    if (taRecordContainer) {
      taRecordContainer.classList.remove('hidden');
      if (taBestEl) taBestEl.textContent = stats.timeattack?.bestScore || 0;
    }
    return;
  }

  if (activeStatsTab === 'definitions') {
    if (summaryBox) summaryBox.style.display = 'none';
    if (distributionTitle) distributionTitle.style.display = 'none';
    if (distributionContainer) distributionContainer.style.display = 'none';
    if (taRecordContainer) taRecordContainer.classList.add('hidden');

    if (defRecordContainer) {
      defRecordContainer.classList.remove('hidden');
      if (defBestEl) defBestEl.textContent = stats.definitions?.bestScore || 0;
    }
    return;
  }

  if (summaryBox) summaryBox.style.display = 'flex';
  if (distributionTitle) distributionTitle.style.display = 'block';
  if (distributionContainer) distributionContainer.style.display = 'block';
  if (taRecordContainer) taRecordContainer.classList.add('hidden');
  if (defRecordContainer) defRecordContainer.classList.add('hidden');

  let combinedStats = { played: 0, wins: 0, streak: 0, maxStreak: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, X: 0 } };

  if (activeStatsTab === 'daily') combinedStats = stats.daily;
  else if (activeStatsTab === 'free') combinedStats = stats.free;
  else {
    combinedStats.played = (stats.daily?.played || 0) + (stats.free?.played || 0);
    combinedStats.wins = (stats.daily?.wins || 0) + (stats.free?.wins || 0);
    combinedStats.streak = stats.daily?.streak || 0;
    combinedStats.maxStreak = Math.max(stats.daily?.maxStreak || 0, stats.free?.maxStreak || 0);
    ['1', '2', '3', '4', '5', '6', 'X'].forEach(k => {
      combinedStats.distribution[k] = (stats.daily?.distribution?.[k] || 0) + (stats.free?.distribution?.[k] || 0);
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
  if (!container) return;
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
        <div class="dist-bar-fill" style="width: ${pctBar}%">${val} (${pctTotal}%)</div>
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
    dailyTimer.textContent = `${hours}:${mins}:${secs}`;
  }
  updateTimer();
  countdownInterval = setInterval(updateTimer, 1000);
}

function shareResults() {
  let shareText = `Wordle Aragonés - ${currentGame.mode === 'daily' ? '📅 Palabra del Día' : currentGame.mode === 'free' ? '🗺️ Modo Libre' : currentGame.mode === 'timeattack' ? '⚡ Contrarreloj' : '📜 Definiciones'}\n`;
  
  if (currentGame.mode === 'timeattack') {
    shareText += `¡He conseguido resolver ${timeAttackState.score} palabra(s) en 2 minutos en el Modo Contrarreloj! ⚡\n`;
  } else if (currentGame.mode === 'definitions') {
    shareText += `¡He acertado ${definitionsState.score} palabra(s) por definición en 90 segundos! 📜\n`;
  } else {
    shareText += `${currentGame.attempts.length}/6\n\n`;
    currentGame.attempts.forEach(att => {
      att.split('').forEach((char, idx) => {
        if (currentGame.targetWord[idx] === char) shareText += '🟩';
        else if (currentGame.targetWord.includes(char)) shareText += '🟨';
        else shareText += '⬜';
      });
      shareText += '\n';
    });
  }

  if (navigator.clipboard) {
    navigator.clipboard.writeText(shareText).then(() => showAlert('¡Resultado copiado al portapapeles!'));
  } else {
    showAlert(shareText);
  }
}
