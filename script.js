let palabras = [];
let validWords = [];
let currentGame = {
  mode: 'daily', // 'daily' | 'free'
  wordObj: null,
  targetWord: '',
  attempts: [],
  currentInput: '',
  status: 'IN_PROGRESS', // 'IN_PROGRESS' | 'WON' | 'LOST'
  freeWordIndex: 1
};

let stats = {
  played: 0,
  wins: 0,
  streak: 0,
  maxStreak: 0,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
};

let countdownInterval = null;

// Elementos DOM
const boardEl = document.getElementById('game-board');
const keyboardEl = document.getElementById('keyboard');
const btnHelp = document.getElementById('btn-help');
const btnStats = document.getElementById('btn-stats');
const helpModal = document.getElementById('help-modal');
const closeHelp = document.getElementById('close-help');
const startGameBtn = document.getElementById('start-game-btn');
const dontShowHelp = document.getElementById('dont-show-help');

const statsModal = document.getElementById('stats-modal');
const closeStats = document.getElementById('close-stats');
const btnModalClose = document.getElementById('btn-modal-close');

const btnModeDaily = document.getElementById('btn-mode-daily');
const btnModeFree = document.getElementById('btn-mode-free');
const freeControls = document.getElementById('free-mode-controls');
const wordBadge = document.getElementById('word-number-badge');
const btnNewWord = document.getElementById('btn-new-word');

const feedbackBanner = document.getElementById('feedback-banner');
const wordDefinition = document.getElementById('word-definition');
const dailyCountdownBox = document.getElementById('daily-countdown-box');
const dailyTimer = document.getElementById('daily-timer');

const btnShare = document.getElementById('btn-share');
const btnRetry = document.getElementById('btn-retry');
const modalNextBtn = document.getElementById('modal-next-btn');

document.addEventListener('DOMContentLoaded', () => {
  loadSavedStats();
  initEventListeners();
  loadWordsJSON();
});

function loadSavedStats() {
  const saved = localStorage.getItem('palabra_aragonesa_stats');
  if (saved) {
    try { stats = JSON.parse(saved); } catch (e) {}
  }
}

function saveStats() {
  localStorage.setItem('palabra_aragonesa_stats', JSON.stringify(stats));
}

function loadWordsJSON() {
  fetch('palabras.json')
    .then(res => res.json())
    .then(data => {
      palabras = data;
      // Filtrar palabras de 5 letras para el juego Wordle de 5 casillas
      validWords = palabras.filter(p => p.palabra && p.palabra.trim().length === 5);
      
      if (validWords.length === 0) {
        alert('No se encontraron palabras de 5 letras en el archivo JSON.');
        return;
      }

      checkFirstVisitTutorial();
      initGame('daily');
    })
    .catch(err => {
      console.error('Error al cargar palabras.json:', err);
    });
}

function checkFirstVisitTutorial() {
  const hideHelp = localStorage.getItem('palabra_aragonesa_hide_help');
  if (!hideHelp) {
    helpModal.classList.remove('hidden');
  }
}

function initEventListeners() {
  // Modales
  btnHelp.addEventListener('click', () => helpModal.classList.remove('hidden'));
  closeHelp.addEventListener('click', () => helpModal.classList.add('hidden'));
  startGameBtn.addEventListener('click', () => {
    if (dontShowHelp.checked) {
      localStorage.setItem('palabra_aragonesa_hide_help', 'true');
    }
    helpModal.classList.add('hidden');
  });

  btnStats.addEventListener('click', () => openStatsModal());
  closeStats.addEventListener('click', () => statsModal.classList.add('hidden'));
  btnModalClose.addEventListener('click', () => statsModal.classList.add('hidden'));

  // Cambios de modo
  btnModeDaily.addEventListener('click', () => switchMode('daily'));
  btnModeFree.addEventListener('click', () => switchMode('free'));

  // Controles de Modo Libre
  btnNewWord.addEventListener('click', () => {
    currentGame.freeWordIndex++;
    initGame('free');
  });

  modalNextBtn.addEventListener('click', () => {
    statsModal.classList.add('hidden');
    currentGame.freeWordIndex++;
    initGame('free');
  });

  btnRetry.addEventListener('click', () => {
    statsModal.classList.add('hidden');
    resetCurrentWord();
  });

  btnShare.addEventListener('click', shareResults);

  // Eventos de teclado
  keyboardEl.addEventListener('click', (e) => {
    const target = e.target.closest('.key');
    if (!target) return;
    const key = target.getAttribute('data-key');
    handleKeyPress(key);
  });

  document.addEventListener('keydown', (e) => {
    if (!helpModal.classList.contains('hidden') || !statsModal.classList.contains('hidden')) return;
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

function getDailyIndex() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return dayOfYear % validWords.length;
}

function initGame(mode) {
  currentGame.mode = mode;
  currentGame.attempts = [];
  currentGame.currentInput = '';
  currentGame.status = 'IN_PROGRESS';

  if (mode === 'daily') {
    const dailyIdx = getDailyIndex();
    currentGame.wordObj = validWords[dailyIdx];
  } else {
    const randomIdx = Math.floor(Math.random() * validWords.length);
    currentGame.wordObj = validWords[randomIdx];
    wordBadge.textContent = `Palabra #${currentGame.freeWordIndex}`;
  }

  currentGame.targetWord = currentGame.wordObj.palabra.toUpperCase().trim();
  
  resetKeyboardColors();
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

  if (key === 'ENTER') {
    submitAttempt();
  } else if (key === 'BACKSPACE') {
    currentGame.currentInput = currentGame.currentInput.slice(0, -1);
    renderBoard();
  } else if (currentGame.currentInput.length < 5 && /^[A-ZÑ]$/.test(key)) {
    currentGame.currentInput += key;
    renderBoard();
  }
}

function submitAttempt() {
  if (currentGame.currentInput.length !== 5) return;

  const attempt = currentGame.currentInput.toUpperCase();
  currentGame.attempts.push(attempt);
  currentGame.currentInput = '';

  updateKeyboardColors(attempt);

  if (attempt === currentGame.targetWord) {
    currentGame.status = 'WON';
    recordStats(true, currentGame.attempts.length);
    renderBoard();
    setTimeout(() => openStatsModal(), 600);
    return;
  }

  if (currentGame.attempts.length === 6) {
    currentGame.status = 'LOST';
    recordStats(false, 6);
    renderBoard();
    setTimeout(() => openStatsModal(), 600);
    return;
  }

  renderBoard();
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
  const greenMap = getGreenLettersMap();

  for (let r = 0; r < 6; r++) {
    const rowEl = document.createElement('div');
    rowEl.className = 'board-row';

    const attempt = currentGame.attempts[r];
    const isCurrentRow = (r === currentGame.attempts.length && currentGame.status === 'IN_PROGRESS');

    for (let c = 0; c < 5; c++) {
      const tile = document.createElement('div');
      tile.className = 'tile';

      if (attempt) {
        tile.textContent = attempt[c];
        const status = evaluateTileStatus(attempt, c);
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

  if (target[index] === char) return 'correct';

  let targetChars = target.split('');
  let attemptChars = attempt.split('');

  // Marcar verdes en temporales
  for (let i = 0; i < 5; i++) {
    if (attemptChars[i] === targetChars[i]) {
      targetChars[i] = null;
    }
  }

  // Verificar amarillos
  for (let i = 0; i < 5; i++) {
    if (attemptChars[i] === targetChars[i]) continue;
    if (i === index) {
      const foundIdx = targetChars.indexOf(char);
      if (foundIdx !== -1) {
        return 'present';
      }
    } else {
      const foundIdx = targetChars.indexOf(attemptChars[i]);
      if (foundIdx !== -1) {
        targetChars[foundIdx] = null;
      }
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

function recordStats(isWin, attemptCount) {
  stats.played++;
  if (isWin) {
    stats.wins++;
    stats.streak++;
    if (stats.streak > stats.maxStreak) stats.maxStreak = stats.streak;
    stats.distribution[attemptCount] = (stats.distribution[attemptCount] || 0) + 1;
  } else {
    stats.streak = 0;
  }
  saveStats();
}

function openStatsModal() {
  document.getElementById('stat-played').textContent = stats.played;
  const winrate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
  document.getElementById('stat-winrate').textContent = `${winrate}%`;
  document.getElementById('stat-streak').textContent = stats.streak;
  document.getElementById('stat-maxstreak').textContent = stats.maxStreak;

  renderDistribution();

  // Banner y definiciones
  feedbackBanner.classList.add('hidden');
  wordDefinition.classList.add('hidden');
  dailyCountdownBox.classList.add('hidden');
  btnShare.classList.add('hidden');
  btnRetry.classList.add('hidden');
  modalNextBtn.classList.add('hidden');

  if (currentGame.status === 'WON') {
    feedbackBanner.textContent = '¡Magnífico! Has adivinado la palabra.';
    feedbackBanner.className = 'feedback-banner win';
    feedbackBanner.classList.remove('hidden');

    wordDefinition.innerHTML = `<strong>${currentGame.targetWord}</strong>: ${currentGame.wordObj.significado}`;
    wordDefinition.classList.remove('hidden');

    btnShare.classList.remove('hidden');

    if (currentGame.mode === 'free') {
      modalNextBtn.classList.remove('hidden');
    } else {
      startCountdownTimer();
      dailyCountdownBox.classList.remove('hidden');
    }
  } else if (currentGame.status === 'LOST') {
    feedbackBanner.textContent = `¡Ánimo! La palabra era: ${currentGame.targetWord}`;
    feedbackBanner.className = 'feedback-banner lose';
    feedbackBanner.classList.remove('hidden');

    wordDefinition.innerHTML = `<strong>${currentGame.targetWord}</strong>: ${currentGame.wordObj.significado}`;
    wordDefinition.classList.remove('hidden');

    if (currentGame.mode === 'free') {
      btnRetry.classList.remove('hidden');
      modalNextBtn.classList.remove('hidden');
    } else {
      startCountdownTimer();
      dailyCountdownBox.classList.remove('hidden');
    }
  }

  statsModal.classList.remove('hidden');
}

function renderDistribution() {
  const container = document.getElementById('guess-distribution');
  container.innerHTML = '';
  const maxVal = Math.max(...Object.values(stats.distribution), 1);

  for (let i = 1; i <= 6; i++) {
    const val = stats.distribution[i] || 0;
    const pct = Math.max((val / maxVal) * 100, 7);

    const row = document.createElement('div');
    row.className = 'dist-row';
    row.innerHTML = `
      <span class="dist-num">${i}</span>
      <div class="dist-bar-bg">
        <div class="dist-bar-fill" style="width: ${pct}%">${val}</div>
      </div>
    `;
    container.appendChild(row);
  }
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
  let shareText = `Wordle Aragones - ${currentGame.mode === 'daily' ? 'Palabra do Día' : 'Modo Libre'}\n`;
  shareText += `${currentGame.attempts.length}/6\n\n`;

  currentGame.attempts.forEach(att => {
    att.split('').forEach((char, idx) => {
      if (currentGame.targetWord[idx] === char) shareText += '🟩';
      else if (currentGame.targetWord.includes(char)) shareText += '🟧';
      else shareText += '⬛';
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
