let allWords = [];
let targetWordObj = {};
let targetWord = "";
let targetWordNormalized = "";
let wordLength = 5;
const maxAttempts = 6;
let currentAttempt = 0;
let currentTile = 0;
let isPracticeMode = false;
let gameOver = false;
let isAnimating = false;
let practiceIndex = 0;
let gameHistory = [];
let currentDailyDayIndex = -1;
let selectedStatTab = 'daily';
let countdownInterval = null;

const winMessages = [
  "¡Increíble! ¡A la primera!",
  "¡Genial! A la segunda",
  "¡Muy bien! A la tercera",
  "¡Bien jugado! A la cuarta",
  "¡Uf, por poco! A la quinta",
  "¡Por un pelo! Salvado en el último intento"
];

document.addEventListener('DOMContentLoaded', () => {
  loadGame();
  document.addEventListener('keydown', handlePhysicalKeyPress);
  
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !isPracticeMode && allWords.length > 0) {
      const todayIndex = getDailyIndex();
      if (todayIndex !== currentDailyDayIndex) {
        startNewGame();
      }
    }
  });
});

async function loadGame() {
  try {
    const response = await fetch('words.json');
    allWords = await response.json();
    
    document.getElementById('btn-daily').addEventListener('click', () => switchMode(false));
    document.getElementById('btn-practice').addEventListener('click', () => switchMode(true));
    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('share-btn').addEventListener('click', shareResult);
    
    document.getElementById('next-word-btn').addEventListener('click', () => {
      closeModal();
      practiceIndex = (practiceIndex + 1) % allWords.length;
      localStorage.setItem('wordle_aragones_practice_index', practiceIndex);
      localStorage.removeItem('wordle_aragones_practice_saved');
      startNewGame();
    });

    document.getElementById('retry-word-btn').addEventListener('click', () => {
      closeModal();
      localStorage.removeItem('wordle_aragones_practice_saved');
      startNewGame();
    });

    document.getElementById('btn-stats').addEventListener('click', showStatsModal);
    document.getElementById('close-stats').addEventListener('click', () => {
      document.getElementById('stats-modal').classList.add('hidden');
    });

    document.getElementById('tab-daily').addEventListener('click', () => switchStatTab('daily'));
    document.getElementById('tab-practice').addEventListener('click', () => switchStatTab('practice'));
    document.getElementById('tab-total').addEventListener('click', () => switchStatTab('total'));

    startNewGame();
  } catch (error) {
    console.error("Error al cargar las palabras:", error);
  }
}

function normalizeText(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
}

function switchMode(practice) {
  if (isAnimating) return;
  isPracticeMode = practice;
  document.getElementById('btn-daily').classList.toggle('active', !practice);
  document.getElementById('btn-practice').classList.toggle('active', practice);
  startNewGame();
}

function getDailyIndex() {
  const startDate = new Date(2026, 0, 1);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = today - startDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.abs(diffDays) % allWords.length;
}

function getDailySaveKey(dayIdx) {
  return `wordle_aragones_daily_saved_${dayIdx}`;
}

function startNewGame() {
  stopCountdown();
  currentAttempt = 0;
  currentTile = 0;
  gameOver = false;
  isAnimating = false;
  gameHistory = [];

  const counterEl = document.getElementById('word-counter');

  if (isPracticeMode) {
    const savedPracticeIdx = localStorage.getItem('wordle_aragones_practice_index');
    if (savedPracticeIdx !== null) {
      practiceIndex = parseInt(savedPracticeIdx, 10) % allWords.length;
    }
    targetWordObj = allWords[practiceIndex];
    const wordNum = targetWordObj.id || (practiceIndex + 1);
    counterEl.textContent = `Palabra #${wordNum}`;
  } else {
    currentDailyDayIndex = getDailyIndex();
    targetWordObj = allWords[currentDailyDayIndex];
    counterEl.textContent = '';
  }

  targetWord = targetWordObj.palabra.trim().toUpperCase();
  targetWordNormalized = normalizeText(targetWord);
  wordLength = targetWordNormalized.length;

  buildBoard();
  buildKeyboard();

  if (isPracticeMode) {
    const savedStateRaw = localStorage.getItem('wordle_aragones_practice_saved');
    if (savedStateRaw) {
      const savedState = JSON.parse(savedStateRaw);
      if (savedState.practiceIndex === practiceIndex) {
        restoreSavedGame(savedState);
      }
    }
  } else {
    const savedStateRaw = localStorage.getItem(getDailySaveKey(currentDailyDayIndex));
    if (savedStateRaw) {
      const savedState = JSON.parse(savedStateRaw);
      restoreSavedGame(savedState);
    }
  }
}

function restoreSavedGame(savedState) {
  gameHistory = savedState.history || [];
  const guessLetters = savedState.guessLetters || [];
  gameOver = savedState.gameOver || false;

  for (let r = 0; r < gameHistory.length; r++) {
    const rowStatuses = gameHistory[r];
    const rowLetters = guessLetters[r] || [];

    for (let c = 0; c < wordLength; c++) {
      const tile = document.getElementById(`tile-${r}-${c}`);
      const letter = rowLetters[c] || '';
      if (tile) {
        tile.textContent = letter;
        tile.classList.add(rowStatuses[c]);
      }
      
      const keyBtn = document.getElementById(`key-${letter}`);
      if (keyBtn) {
        const status = rowStatuses[c];
        if (status === 'correct') {
          keyBtn.classList.remove('present', 'absent');
          keyBtn.classList.add('correct');
        } else if (status === 'present' && !keyBtn.classList.contains('correct')) {
          keyBtn.classList.remove('absent');
          keyBtn.classList.add('present');
        } else if (status === 'absent' && !keyBtn.classList.contains('correct') && !keyBtn.classList.contains('present')) {
          keyBtn.classList.add('absent');
        }
      }
    }
  }

  if (gameOver) {
    if (!isPracticeMode) {
      const title = "¡Ya has completado la palabra aragonesa del día de hoy!";
      showModal(title, `Palabra: ${targetWordObj.palabra}`, targetWordObj.significado);
    } else {
      const isWin = savedState.win;
      const victoryTitle = isWin 
        ? (winMessages[gameHistory.length - 1] || "¡Omenache!") 
        : '¡Ánimo!';
      const wordText = isWin ? `Has acertado: ${targetWordObj.palabra}` : `La palabra era: ${targetWordObj.palabra}`;
      showModal(victoryTitle, wordText, targetWordObj.significado);
    }
  } else {
    currentAttempt = gameHistory.length;
    currentTile = 0;
  }
}

function buildBoard() {
  const board = document.getElementById('game-board');
  board.innerHTML = '';
  
  for (let i = 0; i < maxAttempts; i++) {
    const row = document.createElement('div');
    row.className = 'row';
    for (let j = 0; j < wordLength; j++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.id = `tile-${i}-${j}`;
      row.appendChild(tile);
    }
    board.appendChild(row);
  }
}

function buildKeyboard() {
  const keyboard = document.getElementById('keyboard');
  keyboard.innerHTML = '';
  const rows = [
    ['Q','W','E','R','T','Y','U','I','O','P'],
    ['A','S','D','F','G','H','J','K','L','Ñ'],
    ['ENTER','Z','X','C','V','B','N','M','DEL']
  ];

  rows.forEach(rowKeys => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'keyboard-row';
    rowKeys.forEach(key => {
      const btn = document.createElement('button');
      btn.textContent = key;
      btn.className = `key ${key.length > 1 ? 'large' : ''}`;
      btn.id = `key-${key}`;
      btn.addEventListener('click', () => handleKeyPress(key));
      rowDiv.appendChild(btn);
    });
    keyboard.appendChild(rowDiv);
  });
}

function handlePhysicalKeyPress(e) {
  if (gameOver || isAnimating) return;

  if (e.key === 'Enter') {
    handleKeyPress('ENTER');
  } else if (e.key === 'Backspace') {
    handleKeyPress('DEL');
  } else {
    const key = normalizeText(e.key);
    if (key.length === 1 && ((key >= 'A' && key <= 'Z') || key === 'Ñ')) {
      handleKeyPress(key);
    }
  }
}

function handleKeyPress(key) {
  if (gameOver || isAnimating) return;

  if (key === 'DEL') {
    if (currentTile > 0) {
      currentTile--;
      const tile = document.getElementById(`tile-${currentAttempt}-${currentTile}`);
      tile.textContent = '';
      tile.classList.remove('pop');
    }
  } else if (key === 'ENTER') {
    if (currentTile === wordLength) {
      checkGuess();
    }
  } else if (currentTile < wordLength && key.length === 1) {
    const tile = document.getElementById(`tile-${currentAttempt}-${currentTile}`);
    tile.textContent = key;
    
    tile.classList.remove('pop');
    void tile.offsetWidth;
    tile.classList.add('pop');
    
    currentTile++;
  }
}

function checkGuess() {
  isAnimating = true;

  let guess = '';
  const currentGuessLetters = [];
  for (let i = 0; i < wordLength; i++) {
    const letter = document.getElementById(`tile-${currentAttempt}-${i}`).textContent;
    guess += letter;
    currentGuessLetters.push(letter);
  }

  const targetArr = targetWordNormalized.split('');
  const guessArr = guess.split('');
  const statuses = new Array(wordLength).fill('absent');

  // Pase 1: Verdes
  for (let i = 0; i < wordLength; i++) {
    if (guessArr[i] === targetArr[i]) {
      statuses[i] = 'correct';
      targetArr[i] = null;
    }
  }

  // Pase 2: Amarillos
  for (let i = 0; i < wordLength; i++) {
    if (statuses[i] !== 'correct') {
      const targetIndex = targetArr.indexOf(guessArr[i]);
      if (targetIndex !== -1) {
        statuses[i] = 'present';
        targetArr[targetIndex] = null;
      }
    }
  }

  gameHistory.push([...statuses]);

  for (let i = 0; i < wordLength; i++) {
    const tile = document.getElementById(`tile-${currentAttempt}-${i}`);
    
    setTimeout(() => {
      tile.classList.remove('pop', 'flip');
      void tile.offsetWidth;
      tile.classList.add('flip');
      
      setTimeout(() => {
        tile.classList.add(statuses[i]);
        
        const letter = guessArr[i];
        const keyBtn = document.getElementById(`key-${letter}`);
        if (keyBtn) {
          const status = statuses[i];
          if (status === 'correct') {
            keyBtn.classList.remove('present', 'absent');
            keyBtn.classList.add('correct');
          } else if (status === 'present' && !keyBtn.classList.contains('correct')) {
            keyBtn.classList.remove('absent');
            keyBtn.classList.add('present');
          } else if (status === 'absent' && !keyBtn.classList.contains('correct') && !keyBtn.classList.contains('present')) {
            keyBtn.classList.add('absent');
          }
        }
      }, 250);

    }, i * 200);
  }

  const totalAnimationTime = wordLength * 200 + 300;

  setTimeout(() => {
    isAnimating = false;

    const isWin = (guess === targetWordNormalized);
    const isLoss = (!isWin && currentAttempt === maxAttempts - 1);

    const allGuessLetters = [];
    for (let r = 0; r <= currentAttempt; r++) {
      const rowLetters = [];
      for (let c = 0; c < wordLength; c++) {
        rowLetters.push(document.getElementById(`tile-${r}-${c}`).textContent);
      }
      allGuessLetters.push(rowLetters);
    }

    const saveData = {
      gameOver: isWin || isLoss,
      win: isWin,
      history: gameHistory,
      guessLetters: allGuessLetters,
      practiceIndex: practiceIndex
    };

    if (isPracticeMode) {
      localStorage.setItem('wordle_aragones_practice_saved', JSON.stringify(saveData));
      localStorage.setItem('wordle_aragones_practice_index', practiceIndex);
    } else {
      localStorage.setItem(getDailySaveKey(currentDailyDayIndex), JSON.stringify(saveData));
    }

    if (isWin || isLoss) {
      gameOver = true;
      updateStats(isWin, currentAttempt);

      if (isWin) {
        const victoryTitle = isPracticeMode 
          ? (winMessages[currentAttempt] || "¡Omenache!") 
          : "¡Ya has completado la palabra de hoy!";
        showModal(victoryTitle, `Has acertado: ${targetWordObj.palabra}`, targetWordObj.significado);
      } else {
        const lossTitle = isPracticeMode ? '¡Ánimo!' : '¡Ya has completado la palabra de hoy!';
        showModal(lossTitle, `La palabra era: ${targetWordObj.palabra}`, targetWordObj.significado);
      }
    } else {
      currentAttempt++;
      currentTile = 0;
    }
  }, totalAnimationTime);
}

function getEmptyStatGroup() {
  return {
    played: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    guesses: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, X: 0 }
  };
}

function getAllStats() {
  const rawStats = localStorage.getItem('wordle_aragones_stats_v3');
  let stats = rawStats ? JSON.parse(rawStats) : null;

  if (!stats) {
    stats = {
      daily: getEmptyStatGroup(),
      practice: getEmptyStatGroup()
    };
  } else {
    ['daily', 'practice'].forEach(k => {
      if (!stats[k].guesses) stats[k].guesses = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, X: 0 };
      if (stats[k].guesses.X === undefined) stats[k].guesses.X = 0;
    });
  }

  return stats;
}

function updateStats(isWin, attemptIndex) {
  const stats = getAllStats();
  const modeKey = isPracticeMode ? 'practice' : 'daily';
  const group = stats[modeKey];

  group.played++;
  if (isWin) {
    group.wins++;
    group.currentStreak++;
    if (group.currentStreak > group.maxStreak) {
      group.maxStreak = group.currentStreak;
    }
    const attemptNum = attemptIndex + 1;
    group.guesses[attemptNum] = (group.guesses[attemptNum] || 0) + 1;
  } else {
    group.currentStreak = 0;
    group.guesses['X'] = (group.guesses['X'] || 0) + 1;
  }

  localStorage.setItem('wordle_aragones_stats_v3', JSON.stringify(stats));
}

function getDisplayStats(category) {
  const stats = getAllStats();

  if (category === 'daily') return stats.daily;
  if (category === 'practice') return stats.practice;

  const combined = getEmptyStatGroup();
  ['daily', 'practice'].forEach(key => {
    const g = stats[key];
    combined.played += g.played;
    combined.wins += g.wins;
    combined.currentStreak = Math.max(combined.currentStreak, g.currentStreak);
    combined.maxStreak = Math.max(combined.maxStreak, g.maxStreak);
    ['1', '2', '3', '4', '5', '6', 'X'].forEach(i => {
      combined.guesses[i] += g.guesses[i] || 0;
    });
  });

  return combined;
}

function switchStatTab(tabKey) {
  selectedStatTab = tabKey;
  
  document.getElementById('tab-daily').classList.toggle('active', tabKey === 'daily');
  document.getElementById('tab-practice').classList.toggle('active', tabKey === 'practice');
  document.getElementById('tab-total').classList.toggle('active', tabKey === 'total');

  renderStats();
}

function showStatsModal() {
  switchStatTab(selectedStatTab);
  document.getElementById('stats-modal').classList.remove('hidden');
}

function renderStats() {
  const statsGroup = getDisplayStats(selectedStatTab);
  const winRate = statsGroup.played > 0 ? Math.round((statsGroup.wins / statsGroup.played) * 100) : 0;

  document.getElementById('stat-played').textContent = statsGroup.played;
  document.getElementById('stat-winrate').textContent = `${winRate}%`;
  document.getElementById('stat-streak').textContent = statsGroup.currentStreak;
  document.getElementById('stat-max-streak').textContent = statsGroup.maxStreak;

  const keys = ['1', '2', '3', '4', '5', '6', 'X'];
  const guessValues = keys.map(k => statsGroup.guesses[k] || 0);
  const maxGuessesCount = Math.max(...guessValues, 1);

  keys.forEach(key => {
    const count = statsGroup.guesses[key] || 0;
    const barEl = document.getElementById(`dist-${key}`);
    if (barEl) {
      if (count > 0) {
        const guessPct = statsGroup.played > 0 ? Math.round((count / statsGroup.played) * 100) : 0;
        barEl.textContent = `${count} (${guessPct}%)`;
      } else {
        barEl.textContent = '0';
      }

      const percentage = Math.max((count / maxGuessesCount) * 100, 8);
      const parentBar = barEl.parentElement;
      parentBar.style.width = `${percentage}%`;

      if (key === 'X') {
        parentBar.style.backgroundColor = count > 0 ? '#d9534f' : '#787c7e';
      } else {
        parentBar.style.backgroundColor = count > 0 ? '#6aaa64' : '#787c7e';
      }
    }
  });
}

async function shareResult() {
  const attemptsText = gameOver && gameHistory[gameHistory.length - 1].every(s => s === 'correct') 
    ? `${gameHistory.length}/${maxAttempts}` 
    : `X/${maxAttempts}`;

  const modeText = isPracticeMode ? `(Modo libre #${targetWordObj.id || practiceIndex + 1})` : '(Palabra del día)';
  
  let gridText = gameHistory.map(row => {
    return row.map(status => {
      if (status === 'correct') return '🟩';
      if (status === 'present') return '🟨';
      return '⬛';
    }).join('');
  }).join('\n');

  const textToShare = `#LaPalabraAragonesa ${modeText} ${attemptsText}\n\n${gridText}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'La Palabra Aragonesa',
        text: textToShare
      });
    } catch (err) {
      console.log('Compartir cancelado o no disponible:', err);
    }
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(textToShare).then(() => {
      const shareBtn = document.getElementById('share-btn');
      shareBtn.textContent = '¡Copiado al portapapeles! 📋';
      setTimeout(() => {
        shareBtn.textContent = '📲 Compartir resultado';
      }, 2500);
    });
  }
}

function startCountdown() {
  stopCountdown();
  const countdownEl = document.getElementById('modal-countdown');
  countdownEl.classList.remove('hidden');

  function updateTimer() {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const diff = tomorrow - now;

    if (diff <= 0) {
      countdownEl.innerHTML = "<p>¡La nueva palabra ya está disponible! Recarga la página.</p>";
      stopCountdown();
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');

    countdownEl.innerHTML = `
      <p>La próxima palabra estará disponible en...</p>
      <div class="countdown-timer">${hours}:${minutes}:${seconds}</div>
    `;
  }

  updateTimer();
  countdownInterval = setInterval(updateTimer, 1000);
}

function stopCountdown() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  const countdownEl = document.getElementById('modal-countdown');
  if (countdownEl) {
    countdownEl.classList.add('hidden');
    countdownEl.innerHTML = '';
  }
}

function showModal(title, word, def) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-word').textContent = word;
  document.getElementById('modal-definition').textContent = def;
  
  const nextBtn = document.getElementById('next-word-btn');
  const retryBtn = document.getElementById('retry-word-btn');

  const isWin = gameHistory.length > 0 && gameHistory[gameHistory.length - 1].every(s => s === 'correct');

  if (isPracticeMode) {
    stopCountdown();
    if (isWin) {
      nextBtn.classList.remove('hidden');
      retryBtn.classList.add('hidden');
    } else {
      nextBtn.classList.add('hidden');
      retryBtn.classList.remove('hidden');
    }
  } else {
    nextBtn.classList.add('hidden');
    retryBtn.classList.add('hidden');
    if (gameOver) {
      startCountdown();
    }
  }

  document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
  stopCountdown();
  document.getElementById('modal').classList.add('hidden');
}
