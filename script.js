let allWords = [];
let targetWordObj = null;
let currentWord = "";
let currentRow = 0;
let isGameOver = false;
let gameMode = "daily"; // 'daily' o 'free'
let dailyGuesses = [];
let freeGuesses = [];
let freeModeIndex = 0;
let countdownInterval = null;

const WIN_MESSAGES = [
  "¡Impresionante! ¡A la primera!",
  "¡Magnífico! Lo has conseguido rapidísimo.",
  "¡Excelente trabajo! Gran intuición.",
  "¡Muy bien! Adivinado con solvencia.",
  "¡Por los pelos! Buena recuperación.",
  "¡Uf! Al límite, pero ¡conseguido!"
];

let stats = loadStats();

document.addEventListener("DOMContentLoaded", () => {
  loadGame();
});

async function loadGame() {
  try {
    const response = await fetch("words.json");
    allWords = await response.json();

    freeModeIndex = parseInt(localStorage.getItem("wordle_free_mode_index")) || 0;

    setupEventListeners();
    setGameMode("daily");
    checkFirstVisitHelp();
  } catch (error) {
    console.error("Error al cargar words.json:", error);
  }
}

function setupEventListeners() {
  document.addEventListener("keydown", handleKeyPress);

  const keys = document.querySelectorAll(".key");
  keys.forEach((key) => {
    key.addEventListener("click", (e) => {
      const keyValue = e.currentTarget.getAttribute("data-key");
      processInput(keyValue);
    });
  });

  document.getElementById("btn-mode-daily").addEventListener("click", () => setGameMode("daily"));
  document.getElementById("btn-mode-free").addEventListener("click", () => setGameMode("free"));
  document.getElementById("btn-new-word").addEventListener("click", advanceToNextFreeWord);

  document.getElementById("btn-help").addEventListener("click", showHelpModal);
  document.getElementById("close-help").addEventListener("click", closeHelpModal);
  document.getElementById("start-game-btn").addEventListener("click", closeHelpModal);

  document.getElementById("btn-stats").addEventListener("click", () => renderStatsModal());
  document.getElementById("close-stats").addEventListener("click", hideStatsModal);
  document.getElementById("btn-modal-close").addEventListener("click", hideStatsModal);

  document.getElementById("btn-retry").addEventListener("click", retryFreeGame);
  document.getElementById("modal-next-btn").addEventListener("click", () => {
    hideStatsModal();
    advanceToNextFreeWord();
  });
  document.getElementById("btn-share").addEventListener("click", shareResults);
}

function setGameMode(mode) {
  gameMode = mode;

  document.getElementById("btn-mode-daily").classList.toggle("active", mode === "daily");
  document.getElementById("btn-mode-free").classList.toggle("active", mode === "free");
  document.getElementById("free-mode-controls").classList.toggle("hidden", mode !== "free");

  if (mode === "daily") {
    setupDailyGame();
  } else {
    setupFreeGame();
  }
}

function buildBoardUI(wordLength) {
  const board = document.getElementById("game-board");
  board.innerHTML = "";
  for (let r = 0; r < 6; r++) {
    const row = document.createElement("div");
    row.className = "row";
    for (let c = 0; c < wordLength; c++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      row.appendChild(tile);
    }
    board.appendChild(row);
  }
}

function resetBoardUI() {
  currentWord = "";
  currentRow = 0;
  isGameOver = false;

  if (targetWordObj) {
    const len = normalizeText(targetWordObj.palabra).length;
    buildBoardUI(len);
  }

  const keys = document.querySelectorAll(".key");
  keys.forEach((key) => {
    key.className = key.classList.contains("wide-key") ? "key wide-key" : "key";
  });
}

function setupDailyGame() {
  const dailyIndex = getDailyIndex();
  targetWordObj = allWords[dailyIndex];
  dailyGuesses = [];

  resetBoardUI();

  const todayKey = getTodayDateKey();
  const savedDailyProgress = localStorage.getItem(`daily_progress_${todayKey}`);

  if (savedDailyProgress) {
    const progress = JSON.parse(savedDailyProgress);
    isGameOver = progress.isGameOver;
    dailyGuesses = progress.guesses || [];

    dailyGuesses.forEach((guessWord) => {
      currentWord = guessWord;
      updateRowUI();
      evaluateGuess(guessWord);
      currentRow++;
    });

    currentWord = "";

    if (isGameOver) {
      setTimeout(() => renderStatsModal(progress.isWin), 400);
    }
  }
}

function setupFreeGame() {
  if (freeModeIndex >= allWords.length) {
    freeModeIndex = 0;
  }

  targetWordObj = allWords[freeModeIndex];
  document.getElementById("word-number-badge").textContent = `Palabra #${freeModeIndex + 1}`;

  const savedFreeState = localStorage.getItem(`free_mode_game_${freeModeIndex}`);

  if (savedFreeState) {
    const state = JSON.parse(savedFreeState);
    freeGuesses = state.guesses || [];
    isGameOver = state.isGameOver || false;

    resetBoardUI();

    freeGuesses.forEach((guessWord) => {
      currentWord = guessWord;
      updateRowUI();
      evaluateGuess(guessWord);
      currentRow++;
    });

    currentWord = "";

    if (isGameOver) {
      setTimeout(() => renderStatsModal(state.isWin), 400);
    }
  } else {
    freeGuesses = [];
    resetBoardUI();
    saveFreeProgress(false, false);
  }
}

function advanceToNextFreeWord() {
  freeModeIndex = (freeModeIndex + 1) % allWords.length;
  localStorage.setItem("wordle_free_mode_index", freeModeIndex);
  setupFreeGame();
}

function retryFreeGame() {
  localStorage.removeItem(`free_mode_game_${freeModeIndex}`);
  freeGuesses = [];
  hideStatsModal();
  resetBoardUI();
}

function getDailyIndex() {
  const startDate = new Date(2026, 0, 1);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = today - startDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.abs(diffDays) % allWords.length;
}

function getTodayDateKey() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

function handleKeyPress(e) {
  if (isGameOver) return;

  const key = e.key.toUpperCase();
  if (key === "ENTER") {
    processInput("ENTER");
  } else if (key === "BACKSPACE" || key === "DELETE") {
    processInput("BACKSPACE");
  } else if (/^[A-ZÑÁÉÍÓÚ]$/.test(key)) {
    processInput(key);
  }
}

function processInput(key) {
  if (isGameOver || !targetWordObj) return;

  const wordLength = normalizeText(targetWordObj.palabra).length;

  if (key === "BACKSPACE") {
    if (currentWord.length > 0) {
      currentWord = currentWord.slice(0, -1);
      updateRowUI();
    }
  } else if (key === "ENTER") {
    if (currentWord.length === wordLength) {
      checkGuess();
    }
  } else if (currentWord.length < wordLength && key.length === 1) {
    currentWord += key;
    updateRowUI();
  }
}

function updateRowUI() {
  const board = document.getElementById("game-board");
  if (!board.children[currentRow]) return;
  const rowTiles = board.children[currentRow].children;
  const wordLength = normalizeText(targetWordObj.palabra).length;

  for (let i = 0; i < wordLength; i++) {
    rowTiles[i].textContent = currentWord[i] || "";
  }
}

function checkGuess() {
  const guess = normalizeText(currentWord);

  if (gameMode === "daily") {
    dailyGuesses.push(guess);
  } else {
    freeGuesses.push(guess);
  }

  const { isWin, isLoss } = evaluateGuess(guess);

  if (isWin || isLoss) {
    isGameOver = true;
    updateStats(isWin, currentRow + 1);

    if (gameMode === "daily") {
      saveDailyProgress(isWin);
    } else {
      saveFreeProgress(isWin, true);
    }

    setTimeout(() => {
      renderStatsModal(isWin);
    }, 500);
  } else {
    currentRow++;
    currentWord = "";

    if (gameMode === "daily") {
      saveDailyProgress(false);
    } else {
      saveFreeProgress(false, false);
    }
  }
}

function evaluateGuess(guess) {
  const targetWord = normalizeText(targetWordObj.palabra);
  const board = document.getElementById("game-board");
  const rowTiles = board.children[currentRow].children;

  const targetLetters = targetWord.split("");
  const guessLetters = guess.split("");
  const tileStates = new Array(guess.length).fill("absent");

  // Aciertos verdes
  for (let i = 0; i < guess.length; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      tileStates[i] = "correct";
      targetLetters[i] = null;
    }
  }

  // Aciertos amarillos
  for (let i = 0; i < guess.length; i++) {
    if (tileStates[i] !== "correct") {
      const indexInTarget = targetLetters.indexOf(guessLetters[i]);
      if (indexInTarget !== -1) {
        tileStates[i] = "present";
        targetLetters[indexInTarget] = null;
      }
    }
  }

  for (let i = 0; i < rowTiles.length; i++) {
    rowTiles[i].classList.add(tileStates[i]);
    updateKeyboard(guessLetters[i], tileStates[i]);
  }

  const isWin = guess === targetWord;
  const isLoss = !isWin && currentRow === 5;

  return { isWin, isLoss };
}

function updateKeyboard(letter, state) {
  const keys = document.querySelectorAll(".key");
  keys.forEach((key) => {
    if (key.getAttribute("data-key") === letter) {
      if (state === "correct") {
        key.className = "key correct";
      } else if (state === "present" && !key.classList.contains("correct")) {
        key.className = "key present";
      } else if (state === "absent" && !key.classList.contains("correct") && !key.classList.contains("present")) {
        key.className = "key absent";
      }
    }
  });
}

function normalizeText(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

function loadStats() {
  const defaultStats = {
    played: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    guesses: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, X: 0 }
  };
  const saved = JSON.parse(localStorage.getItem("wordle_aragones_stats")) || {};
  return { ...defaultStats, ...saved };
}

function updateStats(isWin, attempts) {
  stats.played++;
  if (isWin) {
    stats.wins++;
    stats.currentStreak++;
    if (stats.currentStreak > stats.maxStreak) stats.maxStreak = stats.currentStreak;
    stats.guesses[attempts] = (stats.guesses[attempts] || 0) + 1;
  } else {
    stats.currentStreak = 0;
    stats.guesses["X"] = (stats.guesses["X"] || 0) + 1;
  }
  localStorage.setItem("wordle_aragones_stats", JSON.stringify(stats));
}

function renderStatsModal(lastGameWon = null) {
  const feedbackBanner = document.getElementById("feedback-banner");
  const defBox = document.getElementById("word-definition");
  const btnRetry = document.getElementById("btn-retry");
  const btnNext = document.getElementById("modal-next-btn");
  const btnShare = document.getElementById("btn-share");
  const countdownBox = document.getElementById("daily-countdown-box");

  // Reset de botones opcionales
  btnRetry.classList.add("hidden");
  btnNext.classList.add("hidden");
  btnShare.classList.add("hidden");

  if (isGameOver && lastGameWon !== null) {
    feedbackBanner.classList.remove("hidden", "win", "loss");

    if (lastGameWon) {
      feedbackBanner.classList.add("win");
      feedbackBanner.textContent = WIN_MESSAGES[currentRow] || "¡Felicidades! Has adivinado la palabra.";
      
      if (targetWordObj) {
        defBox.innerHTML = `<strong>${targetWordObj.palabra.toUpperCase()}:</strong> ${targetWordObj.significado}`;
        defBox.classList.remove("hidden");
      }

      btnShare.classList.remove("hidden");

      if (gameMode === "free") {
        btnNext.classList.remove("hidden");
      }
    } else {
      feedbackBanner.classList.add("loss");
      defBox.classList.add("hidden"); // Ocultamos palabra y significado si no adivina

      if (gameMode === "free") {
        feedbackBanner.textContent = "Seguro que si lo reintentas consigues adivinarla.";
        btnRetry.classList.remove("hidden");
      } else {
        feedbackBanner.textContent = "¡Ánimo! No te preocupes, ¡la próxima vez lo conseguirás!";
        // En diario mostramos el significado al terminar el día
        if (targetWordObj) {
          defBox.innerHTML = `<strong>${targetWordObj.palabra.toUpperCase()}:</strong> ${targetWordObj.significado}`;
          defBox.classList.remove("hidden");
        }
      }
    }
  } else {
    feedbackBanner.classList.add("hidden");
    defBox.classList.add("hidden");
  }

  // Renderizar contadores de estadísticas generales
  document.getElementById("stat-played").textContent = stats.played;
  const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
  document.getElementById("stat-winrate").textContent = `${winRate}%`;
  document.getElementById("stat-streak").textContent = stats.currentStreak;
  document.getElementById("stat-maxstreak").textContent = stats.maxStreak;

  // Renderizar histograma
  const distContainer = document.getElementById("guess-distribution");
  distContainer.innerHTML = "";
  const maxVal = Math.max(...Object.values(stats.guesses), 1);
  const rowsKeys = ["1", "2", "3", "4", "5", "6", "X"];

  rowsKeys.forEach((key) => {
    const val = stats.guesses[key] || 0;
    const pctBar = Math.max(8, Math.round((val / maxVal) * 100));
    const pctTotal = stats.played > 0 ? Math.round((val / stats.played) * 100) : 0;

    const isCurrentHighlight = lastGameWon && String(currentRow + 1) === key;

    const row = document.createElement("div");
    row.className = "dist-row";
    row.innerHTML = `
      <span class="dist-label">${key}</span>
      <div class="dist-bar-wrapper">
        <div class="dist-bar ${isCurrentHighlight ? 'highlight' : ''}" style="width: ${pctBar}%">
          ${val}
        </div>
      </div>
      <span class="dist-pct">${pctTotal}%</span>
    `;
    distContainer.appendChild(row);
  });

  // Cuenta atrás o controles específicos del modo diario
  if (gameMode === "daily" && isGameOver) {
    countdownBox.classList.remove("hidden");
    startDailyCountdown();
  } else {
    countdownBox.classList.add("hidden");
    stopCountdown();
  }

  document.getElementById("stats-modal").classList.remove("hidden");
}

function shareResults() {
  const modeLabel = gameMode === "daily" ? "Diaria" : `#${freeModeIndex + 1}`;
  const attemptsText = isGameOver && currentRow < 6 ? `${currentRow + 1}/6` : "X/6";
  const titleText = `Palabra Aragonesa (${modeLabel}) ${attemptsText}\n\n`;

  const guessesList = gameMode === "daily" ? dailyGuesses : freeGuesses;
  const targetWord = normalizeText(targetWordObj.palabra);

  let gridText = "";
  guessesList.forEach((guess) => {
    const targetLetters = targetWord.split("");
    const guessLetters = guess.split("");
    const rowEmoji = new Array(guess.length).fill("⬛");

    for (let i = 0; i < guess.length; i++) {
      if (guessLetters[i] === targetLetters[i]) {
        rowEmoji[i] = "🟩";
        targetLetters[i] = null;
      }
    }

    for (let i = 0; i < guess.length; i++) {
      if (rowEmoji[i] !== "🟩") {
        const indexInTarget = targetLetters.indexOf(guessLetters[i]);
        if (indexInTarget !== -1) {
          rowEmoji[i] = "🟨";
          targetLetters[indexInTarget] = null;
        }
      }
    }
    gridText += rowEmoji.join("") + "\n";
  });

  const fullShareText = titleText + gridText;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(fullShareText).then(() => {
      alert("¡Resultado copiado al portapapeles!");
    }).catch(() => {
      alert("No se pudo copiar automáticamente.");
    });
  }
}

function hideStatsModal() {
  document.getElementById("stats-modal").classList.add("hidden");
}

function startDailyCountdown() {
  stopCountdown();

  function updateTimer() {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const diff = tomorrow - now;

    if (diff <= 0) {
      location.reload();
      return;
    }

    const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
    const minutes = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
    const seconds = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');

    const timerElement = document.getElementById("daily-timer");
    if (timerElement) {
      timerElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
  }

  updateTimer();
  countdownInterval = setInterval(updateTimer, 1000);
}

function stopCountdown() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

function saveDailyProgress(isWin) {
  const todayKey = getTodayDateKey();
  const data = {
    isWin: isWin,
    isGameOver: isGameOver,
    guesses: dailyGuesses
  };
  localStorage.setItem(`daily_progress_${todayKey}`, JSON.stringify(data));
}

function saveFreeProgress(isWin, gameOver) {
  const data = {
    guesses: freeGuesses,
    isWin: isWin,
    isGameOver: gameOver
  };
  localStorage.setItem(`free_mode_game_${freeModeIndex}`, JSON.stringify(data));
}

function checkFirstVisitHelp() {
  const dontShow = localStorage.getItem("wordle_aragones_hide_help");
  if (!dontShow) {
    showHelpModal();
  }
}

function showHelpModal() {
  document.getElementById("help-modal").classList.remove("hidden");
}

function closeHelpModal() {
  const checkbox = document.getElementById("dont-show-help");
  if (checkbox && checkbox.checked) {
    localStorage.setItem("wordle_aragones_hide_help", "true");
  } else {
    localStorage.removeItem("wordle_aragones_hide_help");
  }
  document.getElementById("help-modal").classList.add("hidden");
}
