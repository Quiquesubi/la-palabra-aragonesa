// ==========================================
// CONFIGURACIÓN Y ESTADO DEL JUEGO
// ==========================================

const MAX_ATTEMPTS = 6;
let currentWord = "RASMIA"; // Palabra por defecto (se puede cambiar o cargar dinámicamente)
let currentAttempt = 0;
let currentTile = 0;
let gameOver = false;
let hintsUsed = 0;
const MAX_HINTS = 3;

// Elementos del DOM
const gameBoard = document.getElementById('game-board');
const keyboard = document.getElementById('keyboard');
const btnHint = document.getElementById('btn-hint');

// Modales y botones
const helpModal = document.getElementById('help-modal');
const statsModal = document.getElementById('stats-modal');
const resultModal = document.getElementById('result-modal');

const btnHelp = document.getElementById('btn-help');
const closeHelp = document.getElementById('close-help');
const startGameBtn = document.getElementById('start-game-btn');

const btnStats = document.getElementById('btn-stats');
const closeStats = document.getElementById('close-stats');
const btnModalCloseStats = document.getElementById('btn-modal-close-stats');

const btnCloseResultModal = document.getElementById('btn-close-result-modal');

// ==========================================
// INICIALIZACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  initBoard();
  setupEventListeners();
});

function initBoard() {
  if (!gameBoard) return;
  gameBoard.innerHTML = '';
  
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const row = document.createElement('div');
    row.className = 'board-row';
    row.dataset.row = i;

    for (let j = 0; j < currentWord.length; j++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.dataset.tile = j;
      row.appendChild(tile);
    }
    gameBoard.appendChild(row);
  }
}

// ==========================================
// CONTROL DE MODALES Y BOTONES
// ==========================================

function setupEventListeners() {
  // Modal Ayuda
  if (btnHelp) btnHelp.addEventListener('click', () => showModal(helpModal));
  if (closeHelp) closeHelp.addEventListener('click', () => hideModal(helpModal));
  if (startGameBtn) startGameBtn.addEventListener('click', () => hideModal(helpModal));

  // Modal Estadísticas
  if (btnStats) btnStats.addEventListener('click', () => showModal(statsModal));
  if (closeStats) closeStats.addEventListener('click', () => hideModal(statsModal));
  if (btnModalCloseStats) btnModalCloseStats.addEventListener('click', () => hideModal(statsModal));

  // Modal Resultados
  if (btnCloseResultModal) btnCloseResultModal.addEventListener('click', () => hideModal(resultModal));

  // Teclado virtual
  if (keyboard) {
    keyboard.addEventListener('click', (e) => {
      const target = e.target.closest('button');
      if (!target) return;
      const key = target.dataset.key;
      if (key) handleKeyPress(key);
    });
  }

  // Teclado físico
  document.addEventListener('keydown', (e) => {
    if (gameOver) return;
    if (e.key === 'Enter') handleKeyPress('ENTER');
    else if (e.key === 'Backspace') handleKeyPress('BACKSPACE');
    else {
      const letter = e.key.toUpperCase();
      if (/^[A-ZÑ]$/.test(letter)) handleKeyPress(letter);
    }
  });

  // Botón de Pistas con Anuncio Recompensado
  if (btnHint) {
    btnHint.addEventListener('click', solicitarPistaConAnuncio);
  }
}

function showModal(modal) {
  if (modal) modal.classList.remove('hidden');
}

function hideModal(modal) {
  if (modal) modal.classList.add('hidden');
}

// ==========================================
// LÓGICA DE TECLADO Y PARTIDA
// ==========================================

function handleKeyPress(key) {
  if (gameOver) return;

  const currentRow = gameBoard.children[currentAttempt];
  if (!currentRow) return;

  if (key === 'BACKSPACE') {
    if (currentTile > 0) {
      currentTile--;
      const tile = currentRow.children[currentTile];
      tile.textContent = '';
      tile.classList.remove('filled');
    }
  } else if (key === 'ENTER') {
    if (currentTile === currentWord.length) {
      checkAttempt();
    } else {
      alert('¡Faltan letras para completar la palabra!');
    }
  } else if (/^[A-ZÑ]$/.test(key)) {
    if (currentTile < currentWord.length) {
      const tile = currentRow.children[currentTile];
      tile.textContent = key;
      tile.classList.add('filled');
      currentTile++;
    }
  }
}

function checkAttempt() {
  const currentRow = gameBoard.children[currentAttempt];
  let guess = '';
  
  for (let i = 0; i < currentWord.length; i++) {
    guess += currentRow.children[i].textContent;
  }

  const wordLetters = currentWord.split('');

  // Evaluar colores
  for (let i = 0; i < currentWord.length; i++) {
    const tile = currentRow.children[i];
    const letter = guess[i];

    if (letter === currentWord[i]) {
      tile.classList.add('correct');
      markKeyboardKey(letter, 'correct');
    } else if (currentWord.includes(letter)) {
      tile.classList.add('present');
      markKeyboardKey(letter, 'present');
    } else {
      tile.classList.add('absent');
      markKeyboardKey(letter, 'absent');
    }
  }

  if (guess === currentWord) {
    gameOver = true;
    setTimeout(() => {
      mostrarResultado(true);
    }, 500);
  } else {
    currentAttempt++;
    currentTile = 0;

    if (currentAttempt >= MAX_ATTEMPTS) {
      gameOver = true;
      setTimeout(() => {
        mostrarResultado(false);
      }, 500);
    }
  }
}

function markKeyboardKey(letter, status) {
  const keyBtn = keyboard.querySelector(`[data-key="${letter}"]`);
  if (!keyBtn) return;

  if (status === 'correct') {
    keyBtn.className = 'key correct';
  } else if (status === 'present' && !keyBtn.classList.contains('correct')) {
    keyBtn.className = 'key present';
  } else if (status === 'absent' && !keyBtn.classList.contains('correct') && !keyBtn.classList.contains('present')) {
    keyBtn.className = 'key absent';
  }
}

function mostrarResultado(victoria) {
  const resultBanner = document.getElementById('result-banner');
  if (resultBanner) {
    resultBanner.textContent = victoria 
      ? '🎉 ¡Enhorabuena! Has adivinado la palabra.' 
      : `❌ Has agotado los intentos. La palabra era: ${currentWord}`;
  }
  showModal(resultModal);
}

// ==========================================
// INTEGRACIÓN DE ANUNCIOS RECOMPENSADOS (ADMOB)
// ==========================================

function solicitarPistaConAnuncio() {
  if (gameOver) return;

  if (hintsUsed >= MAX_HINTS) {
    alert('Ya has utilizado el máximo de pistas disponibles para esta partida.');
    return;
  }

  // Comprobar si el SDK de anuncios de Google para juegos está disponible
  if (typeof adBreak === 'function') {
    adBreak({
      type: 'reward',
      name: 'pista_descartar_letras',
      beforeReward: (showAdFn) => {
        // Muestra el anuncio en pantalla
        showAdFn();
      },
      adDismissed: () => {
        alert('Debes ver el vídeo completo para recibir la pista.');
      },
      rewardGiven: () => {
        // Se ejecuta si el jugador vio el vídeo completo
        aplicarPistaDescartarLetras();
      }
    });
  } else {
    // Si los anuncios no han cargado o no hay conexión, se concede la pista directamente
    aplicarPistaDescartarLetras();
  }
}

function aplicarPistaDescartarLetras() {
  hintsUsed++;
  
  // Buscar letras del teclado que no estén en la palabra y no estén descartadas aún
  const unusedKeys = Array.from(keyboard.querySelectorAll('.key'))
    .filter(btn => {
      const key = btn.dataset.key;
      return key && key !== 'ENTER' && key !== 'BACKSPACE' && 
             !currentWord.includes(key) && 
             !btn.classList.contains('absent');
    });

  if (unusedKeys.length > 0) {
    // Descartar hasta 2 letras incorrectas del teclado
    const letrasADescartar = unusedKeys.slice(0, 2);
    letrasADescartar.forEach(btn => {
      btn.classList.add('absent');
      btn.disabled = true;
    });
  }

  // Actualizar el texto del botón
  btnHint.textContent = `💡 Pista ${hintsUsed + 1}/${MAX_HINTS} (Descartar letras)`;
  
  if (hintsUsed >= MAX_HINTS) {
    btnHint.disabled = true;
    btnHint.textContent = '💡 Pistas agotadas';
  }
}
