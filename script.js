let allWords = [];
let targetWordObj = null;
let currentWord = "";
let currentRow = 0;
let isGameOver = false;
let gameMode = "daily"; // 'daily' o 'free'

// Cargar estadísticas guardadas
let stats = loadStats();

document.addEventListener("DOMContentLoaded", () => {
  loadGame();
});

async function loadGame() {
  try {
    const response = await fetch("words.json");
    allWords = await response.json();

    setupEventListeners();
    setGameMode("daily");
    checkFirstVisitHelp();
  } catch (error) {
    console.error("Error al cargar words.json:", error);
  }
}

function setupEventListeners() {
  document.addEventListener("keydown", handleKeyPress);

  // Teclado virtual
  const keys = document.querySelectorAll(".key");
  keys.forEach((key) => {
    key.addEventListener("click", (e) => {
      const keyValue = e.currentTarget.getAttribute("data-key");
      processInput(keyValue);
    });
  });

  // Selector de Modos
  document.getElementById("btn-mode-daily").addEventListener("click", () => setGameMode("daily"));
  document.getElementById("btn-mode-free").addEventListener("click", () => setGameMode("free"));
  document.getElementById("btn-new-word").addEventListener("click", startNewFreeGame);

  // Modales
  document.getElementById("btn-help").addEventListener("click", showHelpModal);
  document.getElementById("close-help").addEventListener("click", closeHelpModal);
  document.getElementById("start-game-btn").addEventListener("click", closeHelpModal);

  document.getElementById("btn-stats").addEventListener("click", () => renderStatsModal());
  document.getElementById("close-stats").addEventListener("click", hideStatsModal);
  document.getElementById("modal-next-btn").addEventListener("click", () => {
    hideStatsModal();
    if (gameMode === "free") startNewFreeGame();
  });
}

function setGameMode(mode) {
  gameMode = mode;

  document.getElementById("btn-mode-daily").classList.toggle("active", mode === "daily");
  document.getElementById("btn-mode-free").classList.toggle("active", mode === "free");
  document.getElementById("free-mode-controls").classList.toggle("hidden", mode !== "free");

  resetBoardUI();

  if (mode === "daily") {
    setupDailyGame();
  } else {
    startNewFreeGame();
  }
}

function setupDailyGame() {
  const dailyIndex = getDailyIndex();
  targetWordObj = allWords[dailyIndex];

  const todayKey = getTodayDateKey();
  const savedDailyProgress = localStorage.getItem(`daily_progress_${todayKey}`);

  if (savedDailyProgress) {
    const progress = JSON.parse(savedDailyProgress);
    isGameOver = progress.isGameOver;
    if (isGameOver) {
      setTimeout(() => renderStatsModal(progress.isWin), 300);
    }
  }
}

function startNewFreeGame() {
  resetBoardUI();
  const randomIndex = Math.floor(Math.random() * allWords.length);
  targetWordObj = allWords[randomIndex];
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
  const rowTiles = board.children[currentRow].children;
  const wordLength = normalizeText(targetWordObj.palabra).length;

  for (let i = 0; i < wordLength; i++) {
    rowTiles[i].textContent = currentWord[i] || "";
  }
}

function checkGuess() {
  const targetWord = normalizeText(targetWordObj.palabra);
  const guess = normalizeText(currentWord);

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

  if (isWin || isLoss) {
    isGameOver = true;
    updateStats(isWin, currentRow + 1);

    if (gameMode === "daily") {
      saveDailyProgress(isWin);
    }

    setTimeout(() => {
      renderStatsModal(isWin);
    }, 500);
  } else {
    currentRow++;
    currentWord = "";
  }
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

function resetBoardUI() {
  currentWord = "";
  currentRow = 0;
  isGameOver = false;

  const tiles = document.querySelectorAll(".tile");
  tiles.forEach((tile) => {
    tile.textContent = "";
    tile.className = "tile";
  });

  const keys = document.querySelectorAll(".key");
  keys.forEach((key) => {
    key.className = key.classList.contains("wide-key") ? "key wide-key" : "key";
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
    guesses: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
  };
  return JSON.parse(localStorage.getItem("wordle_aragones_stats")) || defaultStats;
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
  }
  localStorage.setItem("wordle_aragones_stats", JSON.stringify(stats));
}

function renderStatsModal(lastGameWon = null) {
  document.getElementById("stat-played").textContent = stats.played;
  const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
  document.getElementById("stat-winrate").textContent = `${winRate}%`;
  document.getElementById("stat-streak").textContent = stats.currentStreak;
  document.getElementById("stat-maxstreak").textContent = stats.maxStreak;

  const distContainer = document.getElementById("guess-distribution");
  distContainer.innerHTML = "";

  const maxVal = Math.max(...Object.values(stats.guesses), 1);

  for (let i = 1; i <= 6; i++) {
    const val = stats.guesses[i] || 0;
    const pct = Math.max(8, Math.round((val / maxVal) * 100));

    const row = document.createElement("div");
    row.className = "dist-row";
    row.innerHTML = `
      <span>${i}</span>
      <div class="dist-bar ${lastGameWon && currentRow + 1 === i ? 'highlight' : ''}" style="width: ${pct}%">
        ${val}
      </div>
    `;
    distContainer.appendChild(row);
  }

  const defBox = document.getElementById("word-definition");
  const nextBtn = document.getElementById("modal-next-btn");

  if (targetWordObj && isGameOver) {
    defBox.innerHTML = `<strong>${targetWordObj.palabra}:</strong> ${targetWordObj.significado}`;
    defBox.classList.remove("hidden");
  } else {
    defBox.classList.add("hidden");
  }

  if (gameMode === "free") {
    nextBtn.classList.remove("hidden");
  } else {
    nextBtn.classList.add("hidden");
  }

  document.getElementById("stats-modal").classList.remove("hidden");
}

function hideStatsModal() {
  document.getElementById("stats-modal").classList.add("hidden");
}

function saveDailyProgress(isWin) {
  const todayKey = getTodayDateKey();
  const data = {
    isWin: isWin,
    isGameOver: true,
    targetWordObj: targetWordObj
  };
  localStorage.setItem(`daily_progress_${todayKey}`, JSON.stringify(data));
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
