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

  const savedFreeIndex = localStorage.getItem('palabra_aragonesa_free_index');
  if (savedFreeIndex !== null) {
    currentGame.freeWordIndex = parseInt(savedFreeIndex, 10) || 0;
  }
}

function saveStats() {
  localStorage.setItem('palabra_aragonesa_stats', JSON.stringify(stats));
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

  btnStats.addEventListener('click', () => openStatsModal());
  closeStats.addEventListener('click', () => statsModal.classList.add('hidden'));
  btnModalClose.addEventListener('click', () => statsModal.classList.add('hidden'));

  btnModeDaily.addEventListener('click', () => switchMode('daily'));
  btnModeFree.addEventListener('click', () => switchMode('free'));

  modalNextBtn.addEventListener('click', () => {
    statsModal.classList.add('hidden');
    currentGame.freeWordIndex = (currentGame.freeWordIndex + 1) % validWords.length;
    localStorage.setItem('palabra_aragonesa_free_index', currentGame.freeWordIndex);
    initGame('free');
  });

  btnRetry.addEventListener('click', () => {
    statsModal.classList.add('hidden');
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

  if (mode === 'daily') {
    const dailyIdx = getDailyIndex();
    currentGame.wordObj = validWords[dailyIdx];
  } else {
    if (currentGame.freeWordIndex >= validWords.length) {
      currentGame.freeWordIndex = 0;
    }
    currentGame.wordObj = validWords[currentGame.freeWordIndex];
    // Muestra únicamente el número de palabra actual
    wordBadge.textContent = `Palabra ${currentGame.freeWordIndex + 1}`;
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
    recordStats(false, 6);
  }

  renderBoard();

  // Espera a que termine la animación de volteo antes de abrir las estadísticas
  if (isWin || isLoss) {
    const delay = (wordLength * 150) + 400;
    setTimeout(() => openStatsModal(), delay);
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
        
        // Aplicar animación con retardo escalonado para la última palabra comprobada
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
    if (currentGame.mode === 'free') {
      // En modo libre al fallar, NO se muestra ni la palabra ni su significado
      feedbackBanner.textContent = '¡Ánimo! Has agotado todos tus intentos.';
      feedbackBanner.className = 'feedback-banner lose';
      feedbackBanner.classList.remove('hidden');

      btnRetry.classList.remove('hidden');
      modalNextBtn.classList.remove('hidden');
    } else {
      // En modo diario sí se muestra la solución al fallar
      feedbackBanner.textContent = `¡Ánimo! La palabra era: ${currentGame.targetWord}`;
      feedbackBanner.className = 'feedback-banner lose';
      feedbackBanner.classList.remove('hidden');

      wordDefinition.innerHTML = `<strong>${currentGame.targetWord}</strong>: ${currentGame.wordObj.significado}`;
      wordDefinition.classList.remove('hidden');

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
