let validWords = [];

let currentGame = {
  mode: 'daily',
  wordObj: null,
  targetWord: '',
  attempts: [],
  currentInput: '',
  status: 'IN_PROGRESS',
  freeWordIndex: 0
};

// Estadísticas separadas por modo
let stats = {
  daily: { played: 0, wins: 0, streak: 0, maxStreak: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, X: 0 } },
  free: { played: 0, wins: 0, streak: 0, maxStreak: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, X: 0 } }
};

let activeStatsTab = 'daily';

// Mensajes según el número de intento al adivinar
const winMessages = {
  1: "¡Increíble! ¡Adivinada a la primera! 🎯",
  2: "¡Espectacular! ¡En solo dos intentos! ⭐",
  3: "¡Excelente! ¡A la tercera va la vencida! 👏",
  4: "¡Muy bien! ¡Palabra adivinada! 👍",
  5: "¡Bien jugado! ¡Casi al límite! 😊",
  6: "¡Uff! ¡Adivinada en el último intento! 😅"
};

// Elementos DOM
const boardEl = document.getElementById('game-board');
const keyboardEl = document.getElementById('keyboard');
const btnHelp = document.getElementById('btn-help');
const btnStats = document.getElementById('btn-stats');

const helpModal = document.getElementById('help-modal');
const closeHelp = document.getElementById('close-help');
const startGameBtn = document.getElementById('start-game-btn');
const dontShowHelp = document.getElementById('dont-show-help');

const resultModal = document.getElementById('result-modal');
const closeResult = document.getElementById('close-result');
const btnCloseResultModal = document.getElementById('btn-close-result-modal');
const resultBanner = document.getElementById('result-banner');
const resultWordDefinition = document.getElementById('result-word-definition');
const btnShare = document.getElementById('btn-share');
const btnNextWord = document.getElementById('btn-next-word');
const btnRetryWord = document.getElementById('btn-retry-word');

const statsModal = document.getElementById('stats-modal');
const closeStats = document.getElementById('close-stats');
const btnModalCloseStats = document.getElementById('btn-modal-close-stats');

const btnModeDaily = document.getElementById('btn-mode-daily');
const btnModeFree = document.getElementById('btn-mode-free');
const freeControls = document.getElementById('free-mode-controls');
const wordBadge = document.getElementById('word-number-badge');
const dailyCompletedBanner = document.getElementById('daily-completed-banner');

document.addEventListener('DOMContentLoaded', () => {
  loadSavedStats();
  initEventListeners();
  loadWordsJSON();
});

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

function loadWordsJSON() {
  fetch('words.json')
    .then(res => res.json())
    .then(data => {
      validWords = data.filter(item => item.palabra && item.palabra.trim().length >= 5 && item.palabra.trim().length <= 9);

      if (validWords.length === 0) {
        alert('No se encontraron palabras válidas en words.json.');
        return;
      }

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

  // Modal Resultados
  closeResult.addEventListener('click', () => resultModal.classList.add('hidden'));
  btnCloseResultModal.addEventListener('click', () => resultModal.classList.add('hidden'));

  // Modal Estadísticas
  btnStats.addEventListener('click', () => openStatsModal());
  closeStats.addEventListener('click', () => statsModal.classList.add('hidden'));
  btnModalCloseStats.addEventListener('click', () => statsModal.classList.add('hidden'));

  // Pestañas Filtro Estadísticas
  document.querySelectorAll('.stats-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.stats-tab-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeStatsTab = e.target.getAttribute('data-tab');
      renderStatsData();
    });
  });

  btnModeDaily.addEventListener('click', () => switchMode('daily'));
  btnModeFree.addEventListener('click', () => switchMode('free'));

  btnNextWord.addEventListener('click', () => {
    resultModal.classList.add('hidden');
    currentGame.freeWordIndex = (currentGame.freeWordIndex + 1) % validWords.length;
    localStorage.setItem('palabra_aragonesa_free_index', currentGame.freeWordIndex);
    initGame('free');
  });

  btnRetryWord.addEventListener('click', () => {
    resultModal.classList.add('hidden');
    resetCurrentWord();
  });

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
        !resultModal.classList.contains('hidden')) return;

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
  btnModeDaily.classList.toggle('active', mode === 'daily');
  btnModeFree.classList.toggle('active', mode === 'free');
  freeControls.classList.toggle('hidden', mode === 'daily');
  initGame(mode);
}

function getTodayString() {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

function getDailyIndex() {
  const epoch = new Date(2026, 0, 1);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = today - epoch;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.abs(diffDays) % validWords.length;
}

function initGame(mode) {
  currentGame.mode = mode;
  currentGame.attempts = [];
  currentGame.currentInput = '';
  currentGame.status = 'IN_PROGRESS';
  dailyCompletedBanner.classList.add('hidden');

  if (mode === 'daily') {
    const dailyIdx = getDailyIndex();
    currentGame.wordObj = validWords[dailyIdx];
    currentGame.targetWord = currentGame.wordObj.palabra.toUpperCase().trim();

    // Comprobar si ya se jugó la palabra diaria de hoy
    const savedDaily = localStorage.getItem('palabra_aragonesa_daily_game');
    if (savedDaily) {
      try {
        const dailyData = JSON.parse(savedDaily);
        if (dailyData.date === getTodayString()) {
          currentGame.attempts = dailyData.attempts;
          currentGame.status = dailyData.status;
          dailyCompletedBanner.classList.remove('hidden');
        }
      } catch (e) {}
    }
  } else {
    if (currentGame.freeWordIndex >= validWords.length) {
      currentGame.freeWordIndex = 0;
    }
    currentGame.wordObj = validWords[currentGame.freeWordIndex];
    currentGame.targetWord = currentGame.wordObj.palabra.toUpperCase().trim();
    wordBadge.textContent = `Palabra ${currentGame.freeWordIndex + 1}`;
  }

  resetKeyboardColors();
  if (currentGame.attempts.length > 0) {
    currentGame.attempts.forEach(att => updateKeyboardColors(att));
  }
  renderBoard();
}

function resetCurrentWord() {
  currentGame.attempts = [];
  currentGame.currentInput = '';
  currentGame.status = 'IN_PROGRESS';
  resetKeyboardColors();
  renderBoard();
}

function handleKeyPress(key) {
  if (currentGame.status !== 'IN_PROGRESS') return;

  const wordLength = currentGame.targetWord.length;

  if (key === 'ENTER') {
    submitAttempt();
  } else if (key === 'BACKSPACE') {
    currentGame.currentInput = currentGame.currentInput.slice(0, -1);
    renderBoard();
  } else if (currentGame.currentInput.length < wordLength && /^[A-ZÑ]$/.test(key)) {
    currentGame.currentInput += key;
    renderBoard();
  }
}

function submitAttempt() {
  const wordLength = currentGame.targetWord.length;
  if (currentGame.currentInput.length !== wordLength) return;

  const attempt = currentGame.currentInput.toUpperCase();
  currentGame.attempts.push(attempt);
  currentGame.currentInput = '';

  updateKeyboardColors(attempt);

  const isWin = (attempt === currentGame.targetWord);
  const isLoss = (currentGame.attempts.length === 6 && !isWin);

  if (isWin) {
    currentGame.status = 'WON';
    recordStats(true, currentGame.attempts.length);
  } else if (isLoss) {
    currentGame.status = 'LOST';
    recordStats(false, 'X');
  }

  // Guardar estado diario si estamos en modo diario
  if (currentGame.mode === 'daily') {
    localStorage.setItem('palabra_aragonesa_daily_game', JSON.stringify({
      date: getTodayString(),
      attempts: currentGame.attempts,
      status: currentGame.status
    }));
    if (isWin || isLoss) {
      dailyCompletedBanner.classList.remove('hidden');
    }
  }

  renderBoard();

  if (isWin || isLoss) {
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
    const isLatestAttempt = (r === currentGame.attempts.length - 1);

    for (let c = 0; c < wordLength; c++) {
      const tile = document.createElement('div');
      tile.className = 'tile';

      if (attempt) {
        tile.textContent = attempt[c];
        const status = evaluateTileStatus(attempt, c);

        if (isLatestAttempt) {
          tile.classList.add('flip');
          tile.style.animationDelay = `${c * 150}ms`;
        }

        tile.classList.add(status);
      } else if (isCurrentRow) {
        const char = currentGame.currentInput[c] || '';
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
  const char = attempt[index];
  const target = currentGame.targetWord;
  const wordLength = target.length;

  if (target[index] === char) return 'correct';

  let targetChars = target.split('');
  let attemptChars = attempt.split('');

  for (let i = 0; i < wordLength; i++) {
    if (attemptChars[i] === targetChars[i]) {
      targetChars[i] = null;
    }
  }

  for (let i = 0; i < wordLength; i++) {
    if (attemptChars[i] === targetChars[i]) continue;
    if (i === index) {
      const foundIdx = targetChars.indexOf(char);
      if (foundIdx !== -1) return 'present';
    } else {
      const foundIdx = targetChars.indexOf(attemptChars[i]);
      if (foundIdx !== -1) targetChars[foundIdx] = null;
    }
  }

  return 'absent';
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

/* Modal de Resultados al finalizar la partida */
function openResultModal(isWin) {
  resultWordDefinition.classList.add('hidden');
  btnShare.classList.add('hidden');
  btnNextWord.classList.add('hidden');
  btnRetryWord.classList.add('hidden');

  if (isWin) {
    const attemptCount = currentGame.attempts.length;
    resultBanner.textContent = winMessages[attemptCount] || "¡Felicidades! Has adivinado la palabra.";
    resultBanner.className = 'feedback-banner win';

    resultWordDefinition.innerHTML = `<strong>${currentGame.targetWord}</strong>: ${currentGame.wordObj.significado}`;
    resultWordDefinition.classList.remove('hidden');

    btnShare.classList.remove('hidden');

    if (currentGame.mode === 'free') {
      btnNextWord.classList.remove('hidden');
    }
  } else {
    resultBanner.textContent = "¡Ánimo! Si la reintentas seguro que adivinas.";
    resultBanner.className = 'feedback-banner lose';

    btnRetryWord.classList.remove('hidden');
  }

  resultModal.classList.remove('hidden');
}

/* Modal de Estadísticas */
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
    // Total (Diario + Libre)
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

function shareResults() {
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
      alert('¡Resultado copiado al portapapeles!');
    });
  } else {
    alert(shareText);
  }
}
