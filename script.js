let allWords = [];
let targetWordObj = {};
let targetWord = "";
let wordLength = 5;
const maxAttempts = 6;
let currentAttempt = 0;
let currentTile = 0;
let isPracticeMode = false;
let gameOver = false;
let practiceIndex = 0;
let gameHistory = [];

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
      startNewGame();
    });

    document.getElementById('btn-stats').addEventListener('click', showStatsModal);
    document.getElementById('close-stats').addEventListener('click', () => {
      document.getElementById('stats-modal').classList.add('hidden');
    });

    startNewGame();
  } catch (error) {
    console.error("Error al cargar las palabras:", error);
  }
}

function switchMode(practice) {
  isPracticeMode = practice;
  document.getElementById('btn-daily').classList.toggle('active', !practice);
  document.getElementById('btn-practice').classList.toggle('active', practice);
  startNewGame();
}

function startNewGame() {
  currentAttempt = 0;
  currentTile = 0;
  gameOver = false;
  gameHistory = [];

  const counterEl = document.getElementById('word-counter');

  if (isPracticeMode) {
    targetWordObj = allWords[practiceIndex];
    const wordNum = targetWordObj.id || (practiceIndex + 1);
    counterEl.textContent = `Palabra #${wordNum} de ${allWords.length}`;
  } else {
    const startDate = new Date("2026-01-01");
    const today = new Date();
    const diffDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    const wordIndex = Math.abs(diffDays) % allWords.length;
    targetWordObj = allWords[wordIndex];
    counterEl.textContent = '';
  }

  targetWord = targetWordObj.palabra.toUpperCase();
  wordLength = targetWord.length;

  buildBoard();
  buildKeyboard();
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
  if (gameOver) return;

  if (e.key === 'Enter') {
    handleKeyPress('ENTER');
  } else if (e.key === 'Backspace') {
    handleKeyPress('DEL');
  } else {
    const key = e.key.toUpperCase();
    if (key.length === 1 && ((key >= 'A' && key <= 'Z') || key === 'Ñ')) {
      handleKeyPress(key);
    }
  }
}

function handleKeyPress(key) {
  if (gameOver) return;

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
    tile.classList.add('pop');
    currentTile++;
  }
}

function checkGuess() {
  let guess = '';
  for (let i = 0; i < wordLength; i++) {
    guess += document.getElementById(`tile-${currentAttempt}-${i}`).textContent;
  }

  const targetArr = targetWord.split('');
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

  // Animación en cascada para revelar colores
  for (let i = 0; i < wordLength; i++) {
    const tile = document.getElementById(`tile-${currentAttempt}-${i}`);
    
    setTimeout(() => {
      tile.classList.add('flip');
      
      // Aplicar color a mitad de la animación de giro
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

    }, i * 200); // 200ms de diferencia entre cada casilla
  }

  const totalAnimationTime = wordLength * 200 + 300;

  setTimeout(() => {
    if (guess === targetWord) {
      gameOver = true;
      if (!isPracticeMode) updateStats(true);
      const victoryTitle = winMessages[currentAttempt] || "¡Omenache!";
      showModal(victoryTitle, `Has acertado: ${targetWordObj.palabra}`, targetWordObj.significado);
    } else if (currentAttempt === maxAttempts - 1) {
      gameOver = true;
      if (!isPracticeMode) updateStats(false);
      showModal('¡Ánimo!', `La palabra era: ${targetWordObj.palabra}`, targetWordObj.significado);
    } else {
      currentAttempt++;
      currentTile = 0;
    }
  }, totalAnimationTime);
}

// Lógica de almacenamiento de estadísticas (localStorage)
function getStats() {
  const stats = localStorage.getItem('wordle_aragones_stats');
  return stats ? JSON.parse(stats) : { played: 0, wins: 0, currentStreak: 0, maxStreak: 0 };
}

function updateStats(isWin) {
  const stats = getStats();
  stats.played++;
  if (isWin) {
    stats.wins++;
    stats.currentStreak++;
    if (stats.currentStreak > stats.maxStreak) {
      stats.maxStreak = stats.currentStreak;
    }
  } else {
    stats.currentStreak = 0;
  }
  localStorage.setItem('wordle_aragones_stats', JSON.stringify(stats));
}

function showStatsModal() {
  const stats = getStats();
  const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;

  document.getElementById('stat-played').textContent = stats.played;
  document.getElementById('stat-winrate').textContent = `${winRate}%`;
  document.getElementById('stat-streak').textContent = stats.currentStreak;
  document.getElementById('stat-max-streak').textContent = stats.maxStreak;

  document.getElementById('stats-modal').classList.remove('hidden');
}

function shareResult() {
  const attemptsText = gameOver && gameHistory[gameHistory.length - 1].every(s => s === 'correct') 
    ? `${gameHistory.length}/${maxAttempts}` 
    : `X/${maxAttempts}`;

  const modeText = isPracticeMode ? `(Práctica #${targetWordObj.id || practiceIndex + 1})` : '(Diario)';
  
  let gridText = gameHistory.map(row => {
    return row.map(status => {
      if (status === 'correct') return '🟩';
      if (status === 'present') return '🟨';
      return '⬛';
    }).join('');
  }).join('\n');

  const textToShare = `#LaPalabraAragonesaDelDía ${modeText} ${attemptsText}\n\n${gridText}`;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(textToShare).then(() => {
      const shareBtn = document.getElementById('share-btn');
      shareBtn.textContent = '¡Copiado al portapapeles! 📋';
      setTimeout(() => {
        shareBtn.textContent = '📋 Compartir resultado';
      }, 2500);
    });
  }
}

function showModal(title, word, def) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-word').textContent = word;
  document.getElementById('modal-definition').textContent = def;
  
  const nextBtn = document.getElementById('next-word-btn');
  if (isPracticeMode) {
    nextBtn.classList.remove('hidden');
  } else {
    nextBtn.classList.add('hidden');
  }

  document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}
