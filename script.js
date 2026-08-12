// App.jsx
import React, { useState, useEffect } from 'react';
import './App.css';

// Palabras de muestra para la demo
const WORD_LIST = ['LIBRO', 'JUEGO', 'VERDE', 'LETRA', 'EXITO', 'PISTA'];

export default function App() {
  // Estado general
  const [gameMode, setGameMode] = useState('libre'); // 'diario' | 'libre'
  const [targetWord, setTargetWord] = useState('VERDE');
  const [attempts, setAttempts] = useState([]); // Historial de palabras probadas
  const [currentInput, setCurrentInput] = useState('');
  const [gameStatus, setGameStatus] = useState('IN_PROGRESS'); // 'IN_PROGRESS' | 'WON' | 'LOST'
  
  // Modales
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showRetryModal, setShowRetryModal] = useState(false);
  const [showDefinition, setShowDefinition] = useState(false);
  const [message, setMessage] = useState({ title: '', subtitle: '' });

  // Registro de estadísticas por modo
  const [stats, setStats] = useState({
    diario: { played: 0, wins: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 } },
    libre: { played: 0, wins: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 } },
  });

  // Cargar una palabra al cambiar de modo o iniciar
  useEffect(() => {
    startNewGame();
  }, [gameMode]);

  const startNewGame = () => {
    const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    setTargetWord(randomWord);
    setAttempts([]);
    setCurrentInput('');
    setGameStatus('IN_PROGRESS');
    setShowRetryModal(false);
    setShowDefinition(false);
  };

  // Enviar intento
  const handleSubmitAttempt = () => {
    if (currentInput.length !== 5 || gameStatus !== 'IN_PROGRESS') return;

    const newAttempts = [...attempts, currentInput.toUpperCase()];
    setAttempts(newAttempts);
    setCurrentInput('');

    // Comprobar Victoria
    if (currentInput.toUpperCase() === targetWord) {
      setGameStatus('WON');
      setShowDefinition(true); // Mostrar definición en victoria
      recordStats(newAttempts.length, true);
      // NO abre modal de estadísticas automáticamente
      return;
    }

    // Comprobar Derrota (6 intentos gastados)
    if (newAttempts.length === 6) {
      setGameStatus('LOST');
      recordStats(6, false);

      if (gameMode === 'libre') {
        // En modo libre NO se muestra la definición al perder
        setShowDefinition(false);
        setMessage({
          title: '¡Ánimo!',
          subtitle: 'Seguro que si lo reintentas la adivinas.',
        });
        setShowRetryModal(true);
      } else {
        // En modo diario se puede revelar definición al agotar intentos
        setShowDefinition(true);
      }
    }
  };

  // Reintentar la MISMA palabra en Modo Libre
  const handleRetryWord = () => {
    setAttempts([]);
    setCurrentInput('');
    setGameStatus('IN_PROGRESS');
    setShowRetryModal(false);
    setShowDefinition(false);
    // targetWord no cambia
  };

  // Registrar estadísticas
  const recordStats = (attemptCount, isWin) => {
    setStats((prev) => {
      const modeKey = gameMode;
      const currentModeStats = prev[modeKey];
      const newDistribution = { ...currentModeStats.distribution };
      
      if (isWin) {
        newDistribution[attemptCount] = (newDistribution[attemptCount] || 0) + 1;
      }

      return {
        ...prev,
        [modeKey]: {
          played: currentModeStats.played + 1,
          wins: currentModeStats.wins + (isWin ? 1 : 0),
          distribution: newDistribution,
        },
      };
    });
  };

  // Calcular feedback de letras (Verde = Correcta, Amarillo = Presente, Gris = Ausente)
  const getLetterStatus = (letter, index, attemptWord) => {
    if (targetWord[index] === letter) return 'correct'; // Verde
    if (targetWord.includes(letter)) return 'present';  // Amarillo
    return 'absent';                                    // Gris
  };

  // Acumular todas las letras que ya hayan quedado VERDES en intentos anteriores
  const getGreenLettersMap = () => {
    const greenIndices = {};
    attempts.forEach((word) => {
      word.split('').forEach((char, idx) => {
        if (targetWord[idx] === char) {
          greenIndices[idx] = char;
        }
      });
    });
    return greenIndices;
  };

  const greenLettersMap = getGreenLettersMap();

  return (
    <div className="game-container">
      {/* Encabezado */}
      <header className="header">
        <h1>Wordle Clone</h1>
        <div className="header-buttons">
          <div className="mode-selector">
            <button
              className={gameMode === 'diario' ? 'active' : ''}
              onClick={() => setGameMode('diario')}
            >
              Palabra del Día
            </button>
            <button
              className={gameMode === 'libre' ? 'active' : ''}
              onClick={() => setGameMode('libre')}
            >
              Modo Libre
            </button>
          </div>
          <button className="stats-btn" onClick={() => setShowStatsModal(true)}>
            📊
          </button>
        </div>
      </header>

      {/* Tablero de 6 filas */}
      <div className="board">
        {Array.from({ length: 6 }).map((_, rowIndex) => {
          const attempt = attempts[rowIndex];
          const isCurrentRow = rowIndex === attempts.length && gameStatus === 'IN_PROGRESS';

          return (
            <div key={rowIndex} className="board-row">
              {Array.from({ length: 5 }).map((_, colIndex) => {
                let char = '';
                let statusClass = '';

                if (attempt) {
                  char = attempt[colIndex];
                  statusClass = getLetterStatus(char, colIndex, attempt);
                } else if (isCurrentRow) {
                  char = currentInput[colIndex] || '';
                } else if (greenLettersMap[colIndex]) {
                  // Mantiene en verde visual las posiciones ya acertadas previamente
                  char = greenLettersMap[colIndex];
                  statusClass = 'correct-hint';
                }

                return (
                  <div key={colIndex} className={`cell ${statusClass}`}>
                    {char}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Entrada de usuario */}
      {gameStatus === 'IN_PROGRESS' && (
        <div className="input-controls">
          <input
            type="text"
            maxLength={5}
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmitAttempt()}
            placeholder="Escribe 5 letras"
          />
          <button onClick={handleSubmitAttempt}>Enviar</button>
        </div>
      )}

      {/* Botón Siguiente Palabra (Solo cuando gana en modo libre) */}
      {gameStatus === 'WON' && gameMode === 'libre' && (
        <button className="next-word-btn" onClick={startNewGame}>
          Siguiente Palabra ➔
        </button>
      )}

      {/* Definición de la palabra (Únicamente si la adivina o en modo diario) */}
      {showDefinition && (
        <div className="definition-box">
          <h3>Significado de {targetWord}:</h3>
          <p>Objeto o conjunto de hojas de papel o material semejante que, encuadernadas, forman un libro.</p>
        </div>
      )}

      {/* MODAL DE REINTENTO (Modo Libre al perder) */}
      {showRetryModal && (
        <div className="modal-overlay">
          <div className="modal-content retry-modal">
            <h2 className="title-encouragement">{message.title}</h2>
            <p className="subtitle-encouragement">{message.subtitle}</p>
            <p className="info-text">
              Las letras acertadas se mantienen en verde para tu siguiente intento.
            </p>
            <button className="retry-btn" onClick={handleRetryWord}>
              Reintentar palabra
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE ESTADÍSTICAS */}
      {showStatsModal && (
        <StatsModal
          stats={stats}
          onClose={() => setShowStatsModal(false)}
        />
      )}
    </div>
  );
}

// Componente para el Modal de Estadísticas
function StatsModal({ stats, onClose }) {
  const [selectedView, setSelectedView] = useState('libre'); // 'diario' | 'libre' | 'total'

  // Formatear/Calcular estadísticas según la pestaña seleccionada
  const getDisplayStats = () => {
    if (selectedView === 'diario') return stats.diario;
    if (selectedView === 'libre') return stats.libre;

    // Calculo del TOTAL
    const totalPlayed = stats.diario.played + stats.libre.played;
    const totalWins = stats.diario.wins + stats.libre.wins;
    const combinedDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

    [1, 2, 3, 4, 5, 6].forEach((attempt) => {
      combinedDistribution[attempt] =
        (stats.diario.distribution[attempt] || 0) +
        (stats.libre.distribution[attempt] || 0);
    });

    return { played: totalPlayed, wins: totalWins, distribution: combinedDistribution };
  };

  const currentStats = getDisplayStats();
  const maxDistributionCount = Math.max(...Object.values(currentStats.distribution), 1);

  return (
    <div className="modal-overlay">
      <div className="modal-content stats-modal">
        <div className="stats-header">
          <h2>Estadísticas</h2>
          <button className="close-btn" onClick={onClose}>✖</button>
        </div>

        {/* Pestañas de Selección */}
        <div className="stats-tabs">
          <button
            className={selectedView === 'diario' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setSelectedView('diario')}
          >
            Palabra del día
          </button>
          <button
            className={selectedView === 'libre' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setSelectedView('libre')}
          >
            Modo libre
          </button>
          <button
            className={selectedView === 'total' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setSelectedView('total')}
          >
            Total
          </button>
        </div>

        {/* Métricas Generales */}
        <div className="stats-summary">
          <div className="summary-item">
            <span className="number">{currentStats.played}</span>
            <span className="label">Jugadas</span>
          </div>
          <div className="summary-item">
            <span className="number">
              {currentStats.played > 0
                ? Math.round((currentStats.wins / currentStats.played) * 100)
                : 0}
              %
            </span>
            <span className="label">Victorias</span>
          </div>
        </div>

        {/* Distribución de Intentos (Barras Verdes) */}
        <h3>Distribución de Intentos</h3>
        <div className="guess-distribution">
          {[1, 2, 3, 4, 5, 6].map((attempt) => {
            const count = currentStats.distribution[attempt] || 0;
            const widthPercentage = Math.max((count / maxDistributionCount) * 100, 7);

            return (
              <div key={attempt} className="bar-row">
                <span className="attempt-label">{attempt}</span>
                <div className="bar-container">
                  <div
                    className="stat-bar"
                    style={{ width: `${widthPercentage}%` }}
                  >
                    {count}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
