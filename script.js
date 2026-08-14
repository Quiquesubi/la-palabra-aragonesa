let validWords = [];

let currentGame = {
  mode: 'daily',
  wordObj: null,
  targetWord: '',
  attempts: [],
  currentInput: '',
  status: 'IN_PROGRESS',
  freeWordIndex: 0,
  animatedRows: [],
  hintLevel: 0 // 0 = ninguna pista
};

// Estadísticas separadas por modo
let stats = {
  daily: { played: 0, wins: 0, streak: 0, maxStreak: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, X: 0 } },
  free: { played: 0, wins: 0, streak: 0, maxStreak: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, X: 0 } }
};

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

// Elementos DOM
const boardEl = document.getElementById('game-board');
const keyboardEl = document.getElementById('keyboard');
const btnHelp = document.getElementById('btn-help');
const btnStats = document.getElementById('btn-stats');
const btnHint = document.getElementById('btn-hint');

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

document.addEventListener('DOMContentLoaded', () => {
  loadSavedStats();
  initEventListeners();
  loadWordsJSON();
  initAdMobPlugin();
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

  if (btnHint) {
    btnHint.addEventListener('click', handleHintClick);
  }

  btnCloseResultModal.addEventListener('click', () => {
    resultModal.classList.add('hidden');
    updateMainActionButtons();
  });

  btnStats.addEventListener('click', () => openStatsModal());
  closeStats.addEventListener('click', () => statsModal.classList.add('hidden'));
  btnModalCloseStats.addEventListener('click', () => statsModal.classList.add('hidden'));

  document.querySelectorAll('.stats-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.stats-tab-btn').forEach(b => b.classList.remove('active'));
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
  currentGame.currentInput = '';
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

          if (currentGame.status === 'WON' || currentGame.status === 'LOST') {
            updateMainActionButtons();
          }
        }
      } catch (e) {}
    }
  }

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

function resetCurrentWord() {
  currentGame.attempts = [];
  currentGame.currentInput = '';
  currentGame.status = 'IN_PROGRESS';
  currentGame.animatedRows = [];
  currentGame.hintLevel = 0;
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

  saveGameState();
  updateHintButtonUI();

  if (currentGame.mode === 'daily' && (isWin || isLoss)) {
    if (dailyCompletedBanner) dailyCompletedBanner.classList.remove('hidden');
  }

  renderBoard();

  const submittedRowIndex = currentGame.attempts.length - 1;
  currentGame.animatedRows.push(submittedRowIndex);

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

// --- SISTEMA DE PISTAS Y ANUNCIOS RECOMPENSADOS ---

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
  } else if (nextHint === 2) {
    btnHint.textContent = `💡 Pista 2/${maxHints} (Significado)`;
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
  return new Promise((resolve) => {
    try {
      if (window.admob && window.admob.rewarded && typeof window.admob.rewarded.prepare === 'function') {
        window.admob.rewarded.prepare({
          adId: 'ca-app-pub-3940256099942544/5224354917',
          isTesting: true
        }).then(() => {
          return window.admob.rewarded.show();
        }).then(() => {
          resolve(true);
        }).catch((err) => {
          console.warn('AdMob no listo o cancelado:', err);
          const confirmed = confirm("🎬 [Simulación de Anuncio]\n\n¿Completar vídeo para obtener la pista?");
          resolve(confirmed);
        });
      } else {
        const confirmed = confirm("🎬 [Anuncio de prueba]\n\nVisualizando vídeo publicitario de prueba...\n¿Completar vídeo para obtener la pista?");
        resolve(confirmed);
      }
    } catch (err) {
      const confirmed = confirm("🎬 [Anuncio de prueba]\n\n¿Completar vídeo para obtener la pista?");
      resolve(confirmed);
    }
  });
}

function applyHint(level) {
  const maxHints = getMaxHints();

  if (level === 1) {
    discardKeyboardLetters(3);
    alert(`💡 Pista 1/${maxHints}:\n\nSe han descartado 3 letras del teclado que NO forman parte de la palabra.`);
  } else if (level === 2) {
    const significado = currentGame.wordObj ? currentGame.wordObj.significado : 'Sin definición disponible.';
    alert(`💡 Pista 2/${maxHints} (Significado):\n\n"${significado}"`);
  } else {
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
    alert(`💡 Pista ${level}/${maxHints}:\n\n¡Ya tienes todas las letras del tablero descubiertas!`);
    return;
  }

  const randomIndex = unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
  const letter = target[randomIndex];

  alert(`💡 Pista ${level}/${maxHints} (Letra verde):\n\nLa letra en la posición ${randomIndex + 1} es la "${letter}".`);
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

  if (currentGame.mode === 'daily') {
    if (isWin) {
      const attemptCount = currentGame.attempts.length;
      resultBanner.textContent = winMessages[attemptCount] || "¡Felicidades! Has adivinado la palabra.";
      resultBanner.className = 'feedback-banner win';
    } else {
      resultBanner.textContent = `¡Ánimo! La palabra era: ${currentGame.targetWord}`;
      resultBanner.className = 'feedback-banner lose';
    }

    resultWordDefinition.innerHTML = `<strong>${currentGame.targetWord}</strong>: ${currentGame.wordObj.significado}`;
    resultWordDefinition.classList.remove('hidden');

    btnShare.classList.remove('hidden');

    startCountdownTimer();
    resultCountdownBox.classList.remove('hidden');

  } else {
    if (isWin) {
      const attemptCount = currentGame.attempts.length;
      resultBanner.textContent = winMessages[attemptCount] || "¡Felicidades! Has adivinado la palabra.";
      resultBanner.className = 'feedback-banner win';

      resultWordDefinition.innerHTML = `<strong>${currentGame.targetWord}</strong>: ${currentGame.wordObj.significado}`;
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

  resultBanner.textContent = "¡Ya has jugado la palabra de hoy! Vuelve mañana para un nuevo reto.";
  resultBanner.className = 'feedback-banner win';

  resultWordDefinition.innerHTML = `<strong>${currentGame.targetWord}</strong>: ${currentGame.wordObj.significado}`;
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
