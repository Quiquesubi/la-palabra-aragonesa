let allWords = [];
let targetWordObj = {};
let targetWord = "";
let wordLength = 5;
const maxAttempts = 6;
let currentAttempt = 0;
let currentTile = 0;
let isPracticeMode = false;
let gameOver = false;

document.addEventListener('DOMContentLoaded', () => {
  loadGame();
});

async function loadGame() {
  try {
    const response = await fetch('words.json');
    allWords = await response.json();
    
    document.getElementById('btn-daily').addEventListener('click', () => switchMode(false));
    document.getElementById('btn-practice').addEventListener('click', () => switchMode(true));
    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('next-word-btn').addEventListener('click', () => {
      closeModal();
      startNewGame();
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

  if (isPracticeMode) {
    const randomIndex = Math.floor(Math.random() * allWords.length);
    targetWordObj = allWords[randomIndex];
  } else {
    const startDate = new Date("2026-01-01");
    const today = new Date();
    const diffDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    const wordIndex = Math.abs(diffDays) % allWords.length;
    targetWordObj = allWords[wordIndex];
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

function handleKeyPress(key) {
  if (gameOver) return;

  if (key === 'DEL') {
    if (currentTile > 0) {
      currentTile--;
      const tile = document.getElementById(`tile-${currentAttempt}-${currentTile}`);
      tile.textContent = '';
    }
  } else if (key === 'ENTER') {
    if (currentTile === wordLength) {
      checkGuess();
    }
  } else if (currentTile < wordLength && key.length === 1) {
    const tile = document.getElementById(`tile-${currentAttempt}-${currentTile}`);
    tile.textContent = key;
    currentTile++;
  }
}

function checkGuess() {
  let guess = '';
  for (let i = 0; i < wordLength; i++) {
    guess += document.getElementById(`tile-${currentAttempt}-${i}`).textContent;
  }

  for (let i = 0; i < wordLength; i++) {
    const tile = document.getElementById(`tile-${currentAttempt}-${i}`);
    const letter = guess[i];
    
    if (letter === targetWord[i]) {
      tile.classList.add('correct');
    } else if (targetWord.includes(letter)) {
      tile.classList.add('present');
    } else {
      tile.classList.add('absent');
    }
  }

  if (guess === targetWord) {
    gameOver = true;
    showModal('¡Omenache!', `Has acertado: ${targetWordObj.palabra}`, targetWordObj.significado);
  } else if (currentAttempt === maxAttempts - 1) {
    gameOver = true;
    showModal('¡Ánimo!', `La palabra era: ${targetWordObj.palabra}`, targetWordObj.significado);
  } else {
    currentAttempt++;
    currentTile = 0;
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
