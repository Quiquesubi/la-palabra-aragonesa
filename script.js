let allWords = [];
let targetWordObj = null;
let currentWord = "";
let currentRow = 0;
let isGameOver = false;

document.addEventListener("DOMContentLoaded", () => {
  loadGame();
});

async function loadGame() {
  try {
    const response = await fetch("words.json");
    allWords = await response.json();

    // Obtener la palabra del día según el índice diario
    const dailyIndex = getDailyIndex();
    targetWordObj = allWords[dailyIndex];

    setupEventListeners();
    checkFirstVisitHelp();
  } catch (error) {
    console.error("Error al cargar la lista de palabras:", error);
  }
}

function getDailyIndex() {
  const startDate = new Date(2026, 0, 1);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = today - startDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.abs(diffDays) % allWords.length;
}

function setupEventListeners() {
  // Eventos de teclado físico
  document.addEventListener("keydown", handleKeyPress);

  // Eventos de teclado en pantalla
  const keys = document.querySelectorAll(".key");
  keys.forEach((key) => {
    key.addEventListener("click", (e) => {
      const keyValue = e.target.getAttribute("data-key");
      processInput(keyValue);
    });
  });

  // Eventos de modales
  document.getElementById("btn-help").addEventListener("click", showHelpModal);
  document.getElementById("close-help").addEventListener("click", closeHelpModal);
  document.getElementById("start-game-btn").addEventListener("click", closeHelpModal);

  document.getElementById("btn-stats").addEventListener("click", showStatsModal);
  document.getElementById("close-stats").addEventListener("click", hideStatsModal);
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
  if (isGameOver) return;

  const wordLength = targetWordObj ? normalizeText(targetWordObj.palabra).length : 5;

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
  const wordLength = targetWordObj ? normalizeText(targetWordObj.palabra).length : 5;

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

  // Primera pasada: Letras en posición correcta (Verde)
  for (let i = 0; i < guess.length; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      tileStates[i] = "correct";
      targetLetters[i] = null;
    }
  }

  // Segunda pasada: Letras presentes en posición incorrecta (Amarillo)
  for (let i = 0; i < guess.length; i++) {
    if (tileStates[i] !== "correct") {
      const indexInTarget = targetLetters ocean = targetLetters.indexOf(guessLetters[i]);
      if (indexInTarget !== -1) {
        tileStates[i] = "present";
        targetLetters[indexInTarget] = null;
      }
    }
  }

  // Aplicar estilos a la fila y actualizar teclado
  for (let i = 0; i < rowTiles.length; i++) {
    rowTiles[i].classList.add(tileStates[i]);
    updateKeyboard(guessLetters[i], tileStates[i]);
  }

  if (guess === targetWord) {
    isGameOver = true;
    setTimeout(() => {
      showEndGameModal(true);
    }, 500);
  } else if (currentRow === 5) {
    isGameOver = true;
    setTimeout(() => {
      showEndGameModal(false);
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

function normalizeText(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

/* Gestión del Modal Tutorial */
function checkFirstVisitHelp() {
  const dontShow = localStorage.getItem("wordle_aragones_hide_help");
  if (!dontShow) {
    showHelpModal();
  }
}

function showHelpModal() {
  const dontShow = localStorage.getItem("wordle_aragones_hide_help");
  const checkbox = document.getElementById("dont-show-help");
  if (checkbox) {
    checkbox.checked = !!dontShow;
  }
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

/* Gestión del Modal de Estadísticas y Final */
function showEndGameModal(isWin) {
  const modal = document.getElementById("stats-modal");
  const title = document.getElementById("modal-title");
  const defBox = document.getElementById("word-definition");

  title.textContent = isWin ? "¡Excelente!" : "¡Casi!";
  
  defBox.innerHTML = `<strong>${targetWordObj.palabra}:</strong> ${targetWordObj.significado}`;
  defBox.classList.remove("hidden");

  modal.classList.remove("hidden");
}

function showStatsModal() {
  document.getElementById("stats-modal").classList.remove("hidden");
}

function hideStatsModal() {
  document.getElementById("stats-modal").classList.add("hidden");
}
