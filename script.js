let validWords = [];

let currentGame = {
  mode: 'daily',
  wordObj: null,
  targetWord: '',
  attempts: [],
  currentInput: [], 
  selectedTileIndex: 0, 
  status: 'IN_PROGRESS',
  freeWordIndex: 0,
  animatedRows: [],
  hintLevel: 0 
};

// Variables para el Temporizador y Récord de Tiempo de la Palabra del Día
let dailyTimerState = {
  secondsElapsed: 0,
  timerInterval: null,
  isRunning: false,
  hasStarted: false
};

// Estadísticas separadas por modo
let stats = {
  daily: { played: 0, wins: 0, streak: 0, maxStreak: 0, bestTimeSeconds: null, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, X: 0 } },
  free: { played: 0, wins: 0, streak: 0, maxStreak: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, X: 0 } }
};

// Lista global de palabras descubiertas para el Diccionario
let unlockedWords = [];

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

// --- LISTA COMPLETA DE LOS 200 EMBLEMAS ---
const BADGES_LIST = [
  { id: 'b1', name: 'Primer Paso', icon: '🥉', desc: 'Completa tu primera Palabra del Día' },
  { id: 'b2', name: 'Tres Seguidos', icon: '🔥', desc: 'Mantén una racha de 3 días consecutivos' },
  { id: 'b3', name: 'Constancia Semanal', icon: '🗓️', desc: 'Mantén una racha de 7 días consecutivos' },
  { id: 'b4', name: 'Dos Semanas Imparable', icon: '⭐', desc: 'Mantén una racha de 14 días consecutivos' },
  { id: 'b5', name: 'Mes Ininterrumpido', icon: '🏆', desc: 'Mantén una racha de 30 días consecutivos' },
  { id: 'b6', name: 'Bimestre Fiel', icon: '🏅', desc: 'Mantén una racha de 60 días consecutivos' },
  { id: 'b7', name: 'Trimestre Dorado', icon: '👑', desc: 'Mantén una racha de 90 días consecutivos' },
  { id: 'b8', name: 'Medio Año Activo', icon: '🏔️', desc: 'Mantén una racha de 180 días consecutivos' },
  { id: 'b9', name: 'Año Completo', icon: '🌟', desc: 'Mantén una racha de 365 días consecutivos' },
  { id: 'b10', name: 'Segunda Oportunidad', icon: '🔄', desc: 'Recupera una racha tras perderla' },
  { id: 'b11', name: 'Iniciador', icon: '🌱', desc: 'Consigue 5 victorias en total' },
  { id: 'b12', name: 'Principiante Prometedor', icon: '🌿', desc: 'Consigue 10 victorias en total' },
  { id: 'b13', name: 'Coleccionista de Palabras', icon: '📚', desc: 'Consigue 25 victorias en total' },
  { id: 'b14', name: 'Experto en Vocabulario', icon: '🧠', desc: 'Consigue 50 victorias en total' },
  { id: 'b15', name: 'Centenario', icon: '💯', desc: 'Consigue 100 victorias en total' },
  { id: 'b16', name: 'Gran Jugador', icon: '📜', desc: 'Consigue 200 victorias en total' },
  { id: 'b17', name: 'Maestro de las Palabras', icon: '🏛️', desc: 'Consigue 350 victorias en total' },
  { id: 'b18', name: 'Enciclopedia Humana', icon: '🧙‍♂️', desc: 'Consigue 500 victorias en total' },
  { id: 'b19', name: 'Leyenda del Juego', icon: '👑', desc: 'Consigue 750 victorias en total' },
  { id: 'b20', name: 'Mítico', icon: '💎', desc: 'Consigue 1000 victorias en total' },
  { id: 'b21', name: 'Visión Certera', icon: '🎯', desc: 'Adivina una palabra en 1 intento' },
  { id: 'b22', name: 'Segunda Oportunidad', icon: '⚡', desc: 'Adivina una palabra en 2 intentos' },
  { id: 'b23', name: 'Trío Perfecto', icon: '👌', desc: 'Adivina una palabra en 3 intentos' },
  { id: 'b24', name: 'A Mitad de Camino', icon: '👍', desc: 'Adivina una palabra en 4 intentos' },
  { id: 'b25', name: 'Al Límite', icon: '😊', desc: 'Adivina una palabra en 5 intentos' },
  { id: 'b26', name: 'Salvado por los Pelos', icon: '😅', desc: 'Adivina una palabra en el 6º intento' },
  { id: 'b27', name: 'Perfeccionista', icon: '🏹', desc: 'Adivina 5 palabras en el 1º intento' },
  { id: 'b28', name: 'Francotirador', icon: '🎯', desc: 'Adivina 10 palabras en el 1º intento' },
  { id: 'b29', name: 'Dominio Rápido', icon: '⚡', desc: 'Resuelve 3 palabras en ≤3 intentos' },
  { id: 'b30', name: 'Resistencia Suprema', icon: '🧗', desc: 'Resuelve 3 palabras seguidas en el 6º intento' },
  { id: 'b31', name: 'Explorador Libre', icon: '🗺️', desc: 'Juega 10 partidas en Modo Libre' },
  { id: 'b32', name: 'Aventurero del Libre', icon: '🧭', desc: 'Juega 50 partidas en Modo Libre' },
  { id: 'b33', name: 'Navegante Incansable', icon: '⛵', desc: 'Juega 100 partidas en Modo Libre' },
  { id: 'b34', name: 'Maratón de Palabras', icon: '🏃', desc: 'Juega 250 partidas en Modo Libre' },
  { id: 'b35', name: 'Devorador de Partidas', icon: '🎮', desc: 'Juega 500 partidas en Modo Libre' },
  { id: 'b36', name: 'Racha Libre 5', icon: '⚡', desc: 'Consigue 5 victorias seguidas en Modo Libre' },
  { id: 'b37', name: 'Racha Libre 10', icon: '🔥', desc: 'Consigue 10 victorias seguidas en Modo Libre' },
  { id: 'b38', name: 'Racha Libre 25', icon: '🌟', desc: 'Consigue 25 victorias seguidas en Modo Libre' },
  { id: 'b39', name: 'Reintento Exitoso', icon: '🔄', desc: 'Resuelve una palabra tras reintentar' },
  { id: 'b40', name: 'Sin Frenos', icon: '🚀', desc: 'Resuelve 10 palabras libres en una sesión' },
  { id: 'b41', name: 'Lector Curioso', icon: '📖', desc: 'Abre el diccionario por primera vez' },
  { id: 'b42', name: 'Primeros Descubrimientos', icon: '🔖', desc: 'Desbloquea 10 palabras' },
  { id: 'b43', name: 'Pequeño Glosario', icon: '📕', desc: 'Desbloquea 25 palabras' },
  { id: 'b44', name: 'Gran Glosario', icon: '📗', desc: 'Desbloquea 50 palabras' },
  { id: 'b45', name: 'Gran Colección', icon: '📘', desc: 'Desbloquea 100 palabras' },
  { id: 'b46', name: 'Tesauro Completo', icon: '📙', desc: 'Desbloquea 200 palabras' },
  { id: 'b47', name: 'Erudito del Lenguaje', icon: '🏰', desc: 'Desbloquea 350 palabras' },
  { id: 'b48', name: 'Biblioteca Viviente', icon: '🎓', desc: 'Desbloquea el 50% del diccionario' },
  { id: 'b49', name: 'Gran Archivista', icon: '🏛️', desc: 'Desbloquea el 75% del diccionario' },
  { id: 'b50', name: 'Diccionario Completo', icon: '🌟', desc: 'Desbloquea el 100% del diccionario' },
  { id: 'b51', name: 'Palabras Cortas', icon: '🧩', desc: 'Adivina 10 palabras de 5 letras' },
  { id: 'b52', name: 'Especialista en Cortas', icon: '🔍', desc: 'Adivina 50 palabras de 5 letras' },
  { id: 'b53', name: 'Equilibrio Perfecto', icon: '⚖️', desc: 'Adivina 10 palabras de 6 letras' },
  { id: 'b54', name: 'Maestro de 6 Letras', icon: '📐', desc: 'Adivina 50 palabras de 6 letras' },
  { id: 'b55', name: 'Desafío Mediano', icon: '📏', desc: 'Adivina 10 palabras de 7 letras' },
  { id: 'b56', name: 'Gran Longitud', icon: '🧵', desc: 'Adivina 10 palabras de 8 letras' },
  { id: 'b57', name: 'El Reto Máximo', icon: '🏢', desc: 'Adivina 10 palabras de 9 letras' },
  { id: 'b58', name: 'Dominio XL', icon: '🏗️', desc: 'Adivina 30 palabras de 8 o 9 letras' },
  { id: 'b59', name: 'Todoterreno', icon: '🛠️', desc: 'Adivina palabras de 5, 6, 7, 8 y 9 letras' },
  { id: 'b60', name: 'Variedad Absoluta', icon: '🎨', desc: 'Resuelve 5 palabras seguidas de diferente tamaño' },
  { id: 'b61', name: 'Orgullo Intacto', icon: '💪', desc: 'Adivina una palabra sin pedir pistas' },
  { id: 'b62', name: 'Pura Intuición', icon: '🛡️', desc: 'Adivina 10 palabras seguidas sin pistas' },
  { id: 'b63', name: 'Primer Descarte', icon: '💡', desc: 'Usa la pista para descartar letras' },
  { id: 'b64', name: 'Buscador de Verdes', icon: '🟩', desc: 'Usa la pista para revelar letra verde' },
  { id: 'b65', name: 'Lector de Definiciones', icon: '📖', desc: 'Usa la pista de significado' },
  { id: 'b66', name: 'Apoyo Publicitario', icon: '🎬', desc: 'Usa todas las pistas en una partida' },
  { id: 'b67', name: 'Estratega de Pistas', icon: '🧠', desc: 'Descarta letras y adivina en ese intento' },
  { id: 'b68', name: 'Rescate en Extremis', icon: '🛟', desc: 'Pide significado en 5º intento y gana' },
  { id: 'b69', name: 'Independiente', icon: '🏔️', desc: 'Adivina 50 palabras en total sin pistas' },
  { id: 'b70', name: 'Cero Ayudas', icon: '💎', desc: 'Adivina una palabra de 9 letras sin pistas' },
  { id: 'b71', name: 'Madrugador', icon: '🌅', desc: 'Resuelve la palabra antes de las 08:00 AM' },
  { id: 'b72', name: 'Pausa para Comer', icon: '☀️', desc: 'Juega entre las 13:00 y las 15:00' },
  { id: 'b73', name: 'Tarde de Juego', icon: '☕', desc: 'Juega entre las 17:00 y las 19:00' },
  { id: 'b74', name: 'Noctámbulo', icon: '🌙', desc: 'Resuelve la palabra entre 22:00 y 02:00' },
  { id: 'b75', name: 'Jugador de Finde', icon: '🎡', desc: 'Juega un sábado y un domingo' },
  { id: 'b76', name: 'Sábado Triunfante', icon: '🥳', desc: 'Adivina la palabra en sábado' },
  { id: 'b77', name: 'Domingo Tranquilo', icon: '☕', desc: 'Adivina la palabra en domingo' },
  { id: 'b78', name: 'Comienzo de Semana', icon: '💼', desc: 'Resuelve el lunes por la mañana' },
  { id: 'b79', name: 'Fidelidad Mensual', icon: '🗓️', desc: 'Juega en 3 meses diferentes' },
  { id: 'b80', name: 'Nocturno Extremo', icon: '🌌', desc: 'Completa una partida pasadas las 03:00 AM' },
  { id: 'b81', name: 'Compartir es Vivir', icon: '📤', desc: 'Comparte tu resultado por primera vez' },
  { id: 'b82', name: 'Difusor del Juego', icon: '🌐', desc: 'Comparte tu resultado 5 veces' },
  { id: 'b83', name: 'Portavoz', icon: '📢', desc: 'Comparte tu resultado 20 veces' },
  { id: 'b84', name: 'Buscador', icon: '🔍', desc: 'Usa la búsqueda del diccionario 5 veces' },
  { id: 'b85', name: 'Lectura Detallada', icon: '📜', desc: 'Baja hasta el final del diccionario' },
  { id: 'b86', name: 'Estadista', icon: '📊', desc: 'Abre estadísticas 10 veces' },
  { id: 'b87', name: 'Repaso de Reglas', icon: '❓', desc: 'Consulta las instrucciones de juego' },
  { id: 'b88', name: 'Analista', icon: '📈', desc: 'Revisa tu distribución de intentos' },
  { id: 'b89', name: 'Cambiador de Modo', icon: '🔄', desc: 'Alterna entre Diario y Libre 10 veces' },
  { id: 'b90', name: 'Fiel Compartidor', icon: '📱', desc: 'Comparte una victoria a la primera' },
  { id: 'b91', name: 'Iniciando Colección', icon: '🥉', desc: 'Desbloquea 5 emblemas' },
  { id: 'b92', name: 'Primeros Logros', icon: '🥈', desc: 'Desbloquea 10 emblemas' },
  { id: 'b93', name: 'Coleccionista Bronce', icon: '🥉', desc: 'Desbloquea 20 emblemas' },
  { id: 'b94', name: 'Coleccionista Plata', icon: '🥈', desc: 'Desbloquea 35 emblemas' },
  { id: 'b95', name: 'Medio Camino', icon: '🏅', desc: 'Desbloquea 50 emblemas' },
  { id: 'b96', name: 'Coleccionista Oro', icon: '🥇', desc: 'Desbloquea 65 emblemas' },
  { id: 'b97', name: 'Casi Perfecto', icon: '💎', desc: 'Desbloquea 80 emblemas' },
  { id: 'b98', name: 'Maestro de Logros', icon: '👑', desc: 'Desbloquea 90 emblemas' },
  { id: 'b99', name: 'Leyenda Absoluta', icon: '🏆', desc: 'Desbloquea 99 emblemas' },
  { id: 'b100', name: 'Perfección Total', icon: '🌟', desc: 'Desbloquea los 100 emblemas base' },
  { id: 'b101', name: "Amante de la 'Ñ'", icon: '🦁', desc: "Adivina una palabra que contenga la letra Ñ" },
  { id: 'b102', name: "Furia de la 'X'", icon: '⚔️', desc: "Adivina una palabra que contenga la letra X" },
  { id: 'b103', name: 'Doble Vocal', icon: '👥', desc: 'Resuelve una palabra que contenga vocal repetida' },
  { id: 'b104', name: 'Sin Rara Avis', icon: '🧹', desc: 'Resuelve una palabra que solo contenga A, E, I, O, U, L, R, S' },
  { id: 'b105', name: 'Espíritu del Pirineo', icon: '🏔️️', desc: 'Completa 15 palabras del día en agosto' },
  { id: 'b106', name: 'Trío de Vocales', icon: '🎵', desc: 'Resuelve una palabra con al menos 3 vocales distintas' },
  { id: 'b107', name: 'Consonante Fuerte', icon: '🛡️', desc: 'Resuelve una palabra con 5 o más consonantes' },
  { id: 'b108', name: 'Tierra y Lengua', icon: '🌾', desc: 'Descubre 50 palabras en la colección' },
  { id: 'b109', name: "Palabra Larga de la 'Z'", icon: '⚡', desc: 'Adivina una palabra de 8 o 9 letras con Z' },
  { id: 'b110', name: 'Pura Rasmia', icon: '🔥', desc: 'Gana 5 partidas seguidas en <=3 intentos' },
  { id: 'b111', name: 'Comienzo Verde', icon: '🟢', desc: 'Consigue 3 casillas verdes en tu primer intento' },
  { id: 'b112', name: 'Mar de Amarillos', icon: '🟡', desc: 'Obtén 4 o más casillas amarillas en un intento' },
  { id: 'b113', name: 'Pleno de Grises', icon: '⚪', desc: 'Haz un intento donde todas las letras sean grises' },
  { id: 'b114', name: 'Escalera Perfecta', icon: '📈', desc: 'Aumenta el número de letras verdes en cada intento' },
  { id: 'b115', name: 'Efecto Rebote', icon: '🔄', desc: 'Pasa de 0 aciertos en el intento 1 a ganar en el intento 2' },
  { id: 'b116', name: 'Limpieza Teclado', icon: '🧹', desc: 'Descarta 12 letras del teclado en una sola partida' },
  { id: 'b117', name: 'Verde en la Sombra', icon: '🕵️', desc: 'Mantén una casilla verde desde el intento 1 hasta resolver' },
  { id: 'b118', name: 'Triángulo Dorado', icon: '🔺', desc: 'Resuelve 3 palabras seguidas con al menos un amarillo inicial' },
  { id: 'b119', name: 'Maestro de las Adivinanzas', icon: '🧙', desc: 'Completa 10 partidas consecutivas ganando' },
  { id: 'b120', name: 'Giro Inesperado', icon: '🌀', desc: 'Cambia 3 letras amarillas a verde en un solo movimiento' },
  { id: 'b121', name: 'Bicentenario', icon: '📜', desc: 'Juega 200 partidas en total' },
  { id: 'b122', name: 'Medio Millar de Retos', icon: '🏛️', desc: 'Juega 500 partidas en total' },
  { id: 'b123', name: 'Racha Centenaria', icon: '💯', desc: 'Alcanza 100 días consecutivos jugados' },
  { id: 'b124', name: 'Mitad de Año Ininterrumpido', icon: '🏔️', desc: 'Alcanza 182 días consecutivos jugados' },
  { id: 'b125', name: 'Inquebrantable', icon: '🛡️', desc: 'Mantén un % de victorias >95% tras 50 partidas' },
  { id: 'b126', name: 'Resistencia de Hierro', icon: '⛓️', desc: 'Adivina en el 6º intento 10 veces' },
  { id: 'b127', name: 'Coleccionista Absoluto', icon: '💎', desc: 'Descubre 500 palabras en el diccionario' },
  { id: 'b128', name: 'Explorador Máximo', icon: '🌍', desc: 'Descubre 750 palabras en el diccionario' },
  { id: 'b129', name: 'Maestro del Modo Libre', icon: '👑', desc: 'Acumula 300 victorias en Modo Libre' },
  { id: 'b130', name: 'Punta de Lanza', icon: '🗡️', desc: 'Resuelve la palabra del día antes de las 02:00 AM' },
  { id: 'b131', name: 'Nochevieja Aragonesa', icon: '🎆', desc: 'Juega una partida el 31 de diciembre o 1 de enero' },
  { id: 'b132', name: 'San Jorge / Día de Aragón', icon: '🛡️', desc: 'Resuelve la palabra del día el 23 de abril' },
  { id: 'b133', name: 'Fiestas del Pilar', icon: '💐', desc: 'Juega al menos una vez entre el 9 y el 16 de octubre' },
  { id: 'b134', name: 'Calor de Verano', icon: '🏖️', desc: 'Resuelve 30 palabras durante julio y agosto' },
  { id: 'b135', name: 'Frío del Norte', icon: '❄', desc: 'Juega en los meses de enero o febrero' },
  { id: 'b136', name: 'Constancia de Fin de Semana', icon: '🎡', desc: 'Juega un fin de semana completo' },
  { id: 'b137', name: 'Café Matutino', icon: '☕', desc: 'Resuelve la palabra entre las 06:00 y las 08:00 AM' },
  { id: 'b138', name: 'Sesión de Medianoche', icon: '🕛', desc: 'Resuelve la palabra entre 00:00 y 00:15 AM' },
  { id: 'b139', name: 'Cuatro Estaciones', icon: '🍂', desc: 'Completa al menos una partida en cada estación' },
  { id: 'b140', name: 'Jugador de Bucle', icon: '⏰', desc: 'Juega 3 días seguidos casi a la misma hora' },
  { id: 'b141', name: 'Trilogía Diaria', icon: '☘️', desc: 'Completa 3 palabras del día seguidas' },
  { id: 'b142', name: 'Sesión Maratón 20', icon: '🏃', desc: 'Completa 20 palabras en Modo Libre en un mismo día' },
  { id: 'b143', name: 'Sesión Maratón 50', icon: '🚴', desc: 'Completa 50 palabras en Modo Libre en un mismo día' },
  { id: 'b144', name: 'Frenesí de Palabras', icon: '⚡', desc: 'Adivina 5 palabras en Modo Libre' },
  { id: 'b145', name: 'Velocista', icon: '⏱️', desc: 'Resuelve una palabra en menos de 45 segundos' },
  { id: 'b146', name: 'Modo Imparable', icon: '🚀', desc: 'Gana 15 partidas consecutivas en Modo Libre' },
  { id: 'b147', name: 'Alternancia Diaria', icon: '🔀', desc: 'Juega Diario y Libre el mismo día' },
  { id: 'b148', name: 'Dominio Total Libre', icon: '🏆', desc: 'Completa 100 palabras en Modo Libre' },
  { id: 'b149', name: 'Retorno Victorioso', icon: '🏹', desc: 'Resuelve la palabra tras reintentar una partida' },
  { id: 'b150', name: 'Paso de Tortuga', icon: '🐢', desc: 'Gana una partida tras más de 5 minutos' },
  { id: 'b151', name: 'Maestro Purista', icon: '🧘', desc: 'Resuelve 20 palabras en total sin usar ninguna pista' },
  { id: 'b152', name: 'Titán del Lenguaje', icon: '🗿', desc: 'Resuelve 100 palabras en total sin usar ninguna pista' },
  { id: 'b153', name: 'Cero Pistas XL', icon: '🐘', desc: 'Adivina 5 palabras de 8 o 9 letras sin pedir pistas' },
  { id: 'b154', name: 'Muro Indestructible', icon: '🏰', desc: 'Completa una racha de 10 victorias sin utilizar pistas' },
  { id: 'b155', name: 'A Ciegas', icon: '🙈', desc: 'Resuelve la palabra sin tener ninguna casilla verde previa' },
  { id: 'b156', name: 'Apostador Fiel', icon: '🎲', desc: 'Repite la primera palabra durante 5 partidas seguidas' },
  { id: 'b157', name: 'Mente Fría', icon: '🧊', desc: 'Adivina la palabra en el 6º intento sin haber usado pistas' },
  { id: 'b158', name: 'Sin Miedo al Éxito', icon: '🦁', desc: 'Resuelve una palabra de 9 letras en <=3 intentos sin pistas' },
  { id: 'b159', name: 'Estratega Intrépido', icon: '♟️', desc: 'Gana 5 partidas seguidas en Modo Libre sin pistas' },
  { id: 'b160', name: 'Confianza Ciega', icon: '✨', desc: 'Gana una partida resolviéndola en menos de 2 intentos' },
  { id: 'b161', name: 'Ratón de Biblioteca', icon: '🐭', desc: 'Consulta varias definiciones en el diccionario' },
  { id: 'b162', name: 'Investigador Activo', icon: '🔬', desc: 'Filtra la búsqueda del diccionario 5 veces' },
  { id: 'b163', name: 'Coleccionista de Largas', icon: '📜', desc: 'Desbloquea 30 palabras de 8 o 9 letras' },
  { id: 'b164', name: 'Explorador de Cortas', icon: '🔍', desc: 'Desbloquea 50 palabras de 5 letras' },
  { id: 'b165', name: 'Estudioso del Pasado', icon: '🕰️', desc: 'Revisa las reglas o ayuda del juego' },
  { id: 'b166', name: 'Orgullo Social', icon: '📸', desc: 'Comparte 10 victorias' },
  { id: 'b167', name: 'Red Social', icon: '💬', desc: 'Comparte 30 resultados en total' },
  { id: 'b168', name: 'Embajador de la Lengua', icon: '📣', desc: 'Comparte tu resultado 50 veces' },
  { id: 'b169', name: 'Revisor de Récords', icon: '📊', desc: 'Revisa las estadísticas 25 veces' },
  { id: 'b170', name: 'Fiel a las Reglas', icon: '📖', desc: 'Abre el tutorial o instrucciones' },
  { id: 'b171', name: 'Doble Pareja', icon: '♊', desc: 'Resuelve una palabra con dois pares de letras iguales' },
  { id: 'b172', name: 'Trío Consonántico', icon: '🧱', desc: 'Resuelve una palabra que tenga 3 consonantes seguidas' },
  { id: 'b173', name: 'Simetría Casi Perfecta', icon: '🪞', desc: 'Adivina una palabra cuyo inicio y fin sean la misma letra' },
  { id: 'b174', name: 'Inicio Vocal', icon: '🅰️', desc: 'Adivina 10 palabras que empiecen por vocal' },
  { id: 'b175', name: 'Inicio Consonante', icon: '🅱️', desc: 'Adivina 20 palabras que empiecen por consonante' },
  { id: 'b176', name: 'Final en Vocal', icon: '🟢', desc: 'Adivina 15 palabras que terminen en vocal' },
  { id: 'b177', name: 'Final en Consonante', icon: '🔵', desc: 'Adivina 15 palabras que terminen en consonante' },
  { id: 'b178', name: "Sin Letra 'A'", icon: '🚫', desc: "Resuelve una palabra que no contenga la letra A" },
  { id: 'b179', name: "Sin Letra 'E'", icon: '🚫', desc: "Resuelve una palabra que não contenga la letra E" },
  { id: 'b180', name: 'Plurales y Colectivos', icon: '👥', desc: 'Adivina 10 palabras terminadas en S' },
  { id: 'b181', name: 'Cazador de Verdes', icon: '🔎', desc: 'Usa la pista de revelar verde 5 veces' },
  { id: 'b182', name: 'Maestro del Descarte', icon: '🧹', desc: 'Usa la pista de descartar letras 10 veces' },
  { id: 'b183', name: 'Lector de Significados', icon: '📚', desc: 'Usa la pista de significado 10 veces' },
  { id: 'b184', name: 'Salvado por el Significado', icon: '💡', desc: 'Usa la pista de significado y acierta la palabra' },
  { id: 'b185', name: 'Pista Decisiva', icon: '🎯', desc: 'Usa una pista verde y acierta inmediatamente' },
  { id: 'b186', name: 'Apoyo Continuo', icon: '🎬', desc: 'Mira o usa 20 pistas acumuladas' },
  { id: 'b187', name: 'Estratega Cauteloso', icon: '🛡️', desc: 'Usa la pista de descarte en el primer intento' },
  { id: 'b188', name: 'Jugador Eficiente', icon: '⚡', desc: 'Pide 1 pista y resuelve en <=3 intentos' },
  { id: 'b189', name: 'Rescate Triple', icon: '🛟', desc: 'Usa 3 pistas en una partida y consigue ganarla' },
  { id: 'b190', name: 'Amigo de las Pistas', icon: '💡', desc: 'Usa 30 pistas en total' },
  { id: 'b191', name: 'Coleccionista Experto', icon: '🏅', desc: 'Desbloquea 110 emblemas' },
  { id: 'b192', name: 'Superación Personal', icon: '🥈', desc: 'Desbloquea 125 emblemas' },
  { id: 'b193', name: 'Gran Maestro de Logros', icon: '🥇', desc: 'Desbloquea 140 emblemas' },
  { id: 'b194', name: 'Élite de los Emblemas', icon: '💎', desc: 'Desbloquea 155 emblemas' },
  { id: 'b195', name: 'Héroe de la Lengua', icon: '🛡️', desc: 'Desbloquea 170 emblemas' },
  { id: 'b196', name: 'Casi Mítico', icon: '🌟', desc: 'Desbloquea 180 emblemas' },
  { id: 'b197', name: 'Colección Legendaria', icon: '👑', desc: 'Desbloquea 190 emblemas' },
  { id: 'b198', name: 'Perfeccionista Supremo', icon: '🏆', desc: 'Desbloquea 195 emblemas' },
  { id: 'b199', name: 'Titán Insuperable', icon: '⚡', desc: 'Desbloquea 199 emblemas' },
  { id: 'b200', name: 'Panteón Aragonés', icon: '🌌', desc: 'Desbloquea los 200 emblemas del juego' }
];

let unlockedBadges = [];

function loadUnlockedBadges() {
  const saved = localStorage.getItem('palabra_aragonesa_badges');
  if (saved) {
    try { unlockedBadges = JSON.parse(saved); } catch (e) { unlockedBadges = []; }
  }
}

function checkAndUnlockBadge(badgeId) {
  loadUnlockedBadges();
  if (!unlockedBadges.includes(badgeId)) {
    unlockedBadges.push(badgeId);
    localStorage.setItem('palabra_aragonesa_badges', JSON.stringify(unlockedBadges));
    const badgeObj = BADGES_LIST.find(b => b.id === badgeId);
    if (badgeObj) {
      setTimeout(() => {
        showAlert(`🏅 ¡Nuevo Emblema Desbloqueado!\n\n${badgeObj.icon} ${badgeObj.name}\n${badgeObj.desc}`);
      }, 600);
    }
  }
}

function evaluateBadgesOnGameEnd(isWin, attemptsCount, wordLength, hintsUsedCount) {
  const totalWins = (stats.daily?.wins || 0) + (stats.free?.wins || 0);
  const totalPlayed = (stats.daily?.played || 0) + (stats.free?.played || 0);
  const dailyStreak = stats.daily?.streak || 0;

  if (totalPlayed >= 1) checkAndUnlockBadge('b1');
  if (dailyStreak >= 3) checkAndUnlockBadge('b2');
  if (dailyStreak >= 7) checkAndUnlockBadge('b3');
  if (dailyStreak >= 14) checkAndUnlockBadge('b4');
  if (dailyStreak >= 30) checkAndUnlockBadge('b5');
  if (dailyStreak >= 60) checkAndUnlockBadge('b6');
  if (dailyStreak >= 90) checkAndUnlockBadge('b7');
  if (dailyStreak >= 180) checkAndUnlockBadge('b8');
  if (dailyStreak >= 365) checkAndUnlockBadge('b9');

  if (totalWins >= 5) checkAndUnlockBadge('b11');
  if (totalWins >= 10) checkAndUnlockBadge('b12');
  if (totalWins >= 25) checkAndUnlockBadge('b13');
  if (totalWins >= 50) checkAndUnlockBadge('b14');
  if (totalWins >= 100) checkAndUnlockBadge('b15');
  if (totalWins >= 200) checkAndUnlockBadge('b16');
  if (totalWins >= 350) checkAndUnlockBadge('b17');
  if (totalWins >= 500) checkAndUnlockBadge('b18');
  if (totalWins >= 750) checkAndUnlockBadge('b19');
  if (totalWins >= 1000) checkAndUnlockBadge('b20');

  if (isWin) {
    if (attemptsCount === 1) checkAndUnlockBadge('b21');
    if (attemptsCount === 2) checkAndUnlockBadge('b22');
    if (attemptsCount === 3) checkAndUnlockBadge('b23');
    if (attemptsCount === 4) checkAndUnlockBadge('b24');
    if (attemptsCount === 5) checkAndUnlockBadge('b25');
    if (attemptsCount === 6) checkAndUnlockBadge('b26');

    if (wordLength === 5) checkAndUnlockBadge('b51');
    if (wordLength === 6) checkAndUnlockBadge('b53');
    if (wordLength === 7) checkAndUnlockBadge('b55');
    if (wordLength === 8) checkAndUnlockBadge('b56');
    if (wordLength === 9) checkAndUnlockBadge('b57');

    if (hintsUsedCount === 0) checkAndUnlockBadge('b61');

    if (unlockedWords.length >= 10) checkAndUnlockBadge('b42');
    if (unlockedWords.length >= 25) checkAndUnlockBadge('b43');
    if (unlockedWords.length >= 50) checkAndUnlockBadge('b44');
    if (unlockedWords.length >= 100) checkAndUnlockBadge('b45');
    if (unlockedWords.length >= 200) checkAndUnlockBadge('b46');
    if (unlockedWords.length >= 350) checkAndUnlockBadge('b47');
  }

  const currentHour = new Date().getHours();
  if (currentHour < 8) checkAndUnlockBadge('b71');
  if (currentHour >= 13 && currentHour <= 15) checkAndUnlockBadge('b72');
  if (currentHour >= 17 && currentHour <= 19) checkAndUnlockBadge('b73');
  if (currentHour >= 22 || currentHour <= 2) checkAndUnlockBadge('b74');
  if (currentHour >= 3 && currentHour < 6) checkAndUnlockBadge('b80');

  const unlockedCount = unlockedBadges.length;
  if (unlockedCount >= 5) checkAndUnlockBadge('b91');
  if (unlockedCount >= 10) checkAndUnlockBadge('b92');
  if (unlockedCount >= 20) checkAndUnlockBadge('b93');
  if (unlockedCount >= 35) checkAndUnlockBadge('b94');
  if (unlockedCount >= 50) checkAndUnlockBadge('b95');
  if (unlockedCount >= 65) checkAndUnlockBadge('b96');
  if (unlockedCount >= 80) checkAndUnlockBadge('b97');
  if (unlockedCount >= 90) checkAndUnlockBadge('b98');
  if (unlockedCount >= 99) checkAndUnlockBadge('b99');
  if (unlockedCount >= 100) checkAndUnlockBadge('b100');

  if (unlockedCount >= 110) checkAndUnlockBadge('b191');
  if (unlockedCount >= 125) checkAndUnlockBadge('b192');
  if (unlockedCount >= 140) checkAndUnlockBadge('b193');
  if (unlockedCount >= 155) checkAndUnlockBadge('b194');
  if (unlockedCount >= 170) checkAndUnlockBadge('b195');
  if (unlockedCount >= 180) checkAndUnlockBadge('b196');
  if (unlockedCount >= 190) checkAndUnlockBadge('b197');
  if (unlockedCount >= 195) checkAndUnlockBadge('b198');
  if (unlockedCount >= 199) checkAndUnlockBadge('b199');
  if (unlockedCount >= 200) checkAndUnlockBadge('b200');
}

function renderBadgesGrid() {
  loadUnlockedBadges();
  const container = document.getElementById('badges-grid');
  const counter = document.getElementById('badges-counter');
  if (!container) return;

  container.innerHTML = '';
  if (counter) counter.textContent = `Desbloqueados: ${unlockedBadges.length} / ${BADGES_LIST.length}`;

  BADGES_LIST.forEach(b => {
    const isUnlocked = unlockedBadges.includes(b.id);
    const card = document.createElement('div');
    card.className = `badge-card ${isUnlocked ? 'unlocked' : 'locked'}`;

    card.innerHTML = `
      <div class="badge-icon">${b.icon}</div>
      <div class="badge-title">${b.name}</div>
      <div class="badge-desc">${b.desc}</div>
      <div class="badge-status">${isUnlocked ? 'Conseguido' : 'Bloqueado'}</div>
    `;
    container.appendChild(card);
  });
}

// Elementos DOM
const boardEl = document.getElementById('game-board');
const keyboardEl = document.getElementById('keyboard');
const btnHelp = document.getElementById('btn-help');
const btnStats = document.getElementById('btn-stats');
const btnHint = document.getElementById('btn-hint');

const btnBadges = document.getElementById('btn-badges');
const badgesModal = document.getElementById('badges-modal');
const closeBadges = document.getElementById('close-badges');
const btnModalCloseBadges = document.getElementById('btn-modal-close-badges');

const btnDictionary = document.getElementById('btn-dictionary');
const dictionaryModal = document.getElementById('dictionary-modal');
const closeDictionary = document.getElementById('close-dictionary');
const btnModalCloseDict = document.getElementById('btn-modal-close-dict');
const dictionaryList = document.getElementById('dictionary-list');
const dictCounter = document.getElementById('dict-counter');
const dictSearchInput = document.getElementById('dict-search-input');

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

const dailyGameInfo = document.getElementById('daily-game-info');
const timerCounterEl = document.getElementById('timer-counter');

const customAlertModal = document.getElementById('custom-alert-modal');
const customAlertMessage = document.getElementById('custom-alert-message');
const customAlertOkBtn = document.getElementById('custom-alert-ok-btn');
const customAlertCancelBtn = document.getElementById('custom-alert-cancel-btn');

document.addEventListener('DOMContentLoaded', () => {
  loadSavedStats();
  initEventListeners();
  loadWordsJSON();
  initAdMobPlugin();
  setupDailyReminderNotification();
});

function showAlert(message, isConfirm = false) {
  return new Promise((resolve) => {
    customAlertMessage.innerText = message;
    customAlertModal.classList.remove('hidden');

    if (isConfirm) {
      customAlertCancelBtn.classList.remove('hidden');
    } else {
      customAlertCancelBtn.classList.add('hidden');
    }

    const onOk = () => {
      cleanup();
      resolve(true);
    };

    const onCancel = () => {
      cleanup();
      resolve(false);
    };

    const cleanup = () => {
      customAlertModal.classList.add('hidden');
      customAlertOkBtn.removeEventListener('click', onOk);
      customAlertCancelBtn.removeEventListener('click', onCancel);
    };

    customAlertOkBtn.addEventListener('click', onOk);
    customAlertCancelBtn.addEventListener('click', onCancel);
  });
}

function setupDailyReminderNotification() {
  if (!('serviceWorker' in navigator) || !('Notification' in window)) return;

  navigator.serviceWorker.register('sw.js').then(registration => {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          scheduleLocalNotification(registration);
        }
      });
    } else if (Notification.permission === 'granted') {
      scheduleLocalNotification(registration);
    }
  }).catch(err => console.error('Error al registrar Service Worker:', err));
}

function scheduleLocalNotification(registration) {
  const savedDaily = localStorage.getItem('palabra_aragonesa_daily_game');
  let playedToday = false;

  if (savedDaily) {
    try {
      const data = JSON.parse(savedDaily);
      if (data.date === getTodayString() && data.status !== 'IN_PROGRESS') {
        playedToday = true;
      }
    } catch (e) {}
  }

  if (playedToday) return;

  const now = new Date();
  const reminderTime = new Date();
  reminderTime.setHours(20, 0, 0, 0);

  if (now > reminderTime) {
    reminderTime.setDate(reminderTime.getDate() + 1);
  }

  if ('showTrigger' in Notification.prototype) {
    registration.showNotification("La Palabra Aragonesa del Día", {
      body: "¿Has resuelto ya la palabra aragonesa de hoy? 🎯 ¡Entra y acepta el reto!",
      icon: "favicon.png",
      tag: "daily-reminder",
      showTrigger: new TimestampTrigger(reminderTime.getTime())
    });
  } else {
    const delay = reminderTime.getTime() - now.getTime();
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        action: 'schedule_notification',
        delay: delay
      });
    }
  }
}

function loadUnlockedWords() {
  const saved = localStorage.getItem('palabra_aragonesa_unlocked_words');
  if (saved) {
    try { 
      unlockedWords = JSON.parse(saved); 
    } catch (e) {
      unlockedWords = [];
    }
  } else {
    unlockedWords = [];
  }

  const savedFreeIndex = localStorage.getItem('palabra_aragonesa_free_index');
  if (savedFreeIndex !== null && validWords && validWords.length > 0) {
    const currentIndex = parseInt(savedFreeIndex, 10) || 0;
    
    let hasNewImport = false;
    for (let i = 0; i < currentIndex; i++) {
      const wObj = validWords[i];
      if (!wObj) continue;

      const wordId = wObj.id || wObj.palabra;
      const exists = unlockedWords.some(item => 
        item.id === wordId || 
        item.palabra.toUpperCase().trim() === wObj.palabra.toUpperCase().trim()
      );

      if (!exists) {
        unlockedWords.push({
          id: wordId,
          palabra: wObj.palabra.toUpperCase().trim(),
          palabraMostrar: wObj.palabraMostrar || wObj.palabra,
          significado: wObj.significado
        });
        hasNewImport = true;
      }
    }

    if (hasNewImport) {
      localStorage.setItem('palabra_aragonesa_unlocked_words', JSON.stringify(unlockedWords));
    }
  }
}

function unlockCurrentWord() {
  if (!currentGame.wordObj) return;

  loadUnlockedWords();

  const wordId = currentGame.wordObj.id || currentGame.wordObj.palabra;
  const existsIndex = unlockedWords.findIndex(item => item.id === wordId || item.palabra.toUpperCase().trim() === currentGame.wordObj.palabra.toUpperCase().trim());

  if (existsIndex === -1) {
    unlockedWords.push({
      id: wordId,
      palabra: currentGame.wordObj.palabra.toUpperCase().trim(),
      palabraMostrar: currentGame.wordObj.palabraMostrar || currentGame.wordObj.palabra,
      significado: currentGame.wordObj.significado
    });
  } else {
    unlockedWords[existsIndex].palabraMostrar = currentGame.wordObj.palabraMostrar || currentGame.wordObj.palabra;
  }
  
  localStorage.setItem('palabra_aragonesa_unlocked_words', JSON.stringify(unlockedWords));
}

function renderDictionaryList(filterText = '') {
  loadUnlockedWords();

  dictionaryList.innerHTML = '';
  dictCounter.textContent = `Descubiertas: ${unlockedWords.length} / ${validWords.length}`;

  const filtered = unlockedWords.filter(item => {
    const originalObj = validWords.find(w => (w.id && w.id === item.id) || w.palabra.toUpperCase().trim() === item.palabra.toUpperCase().trim());
    const displayWord = (originalObj && originalObj.palabraMostrar) || item.palabraMostrar || item.palabra;
    
    return displayWord.toLowerCase().includes(filterText.toLowerCase()) ||
           item.significado.toLowerCase().includes(filterText.toLowerCase());
  });

  if (filtered.length === 0) {
    dictionaryList.innerHTML = `<div class="dict-empty-msg">${
      unlockedWords.length === 0 
        ? 'Aún no has descubierto ninguna palabra. ¡Gana una partida para añadir tu primera palabra!' 
        : 'No se encontraron palabras con ese filtro.'
    }</div>`;
    return;
  }

  filtered.sort((a, b) => {
    const origA = validWords.find(w => (w.id && w.id === a.id) || w.palabra.toUpperCase().trim() === a.palabra.toUpperCase().trim());
    const origB = validWords.find(w => (w.id && w.id === b.id) || w.palabra.toUpperCase().trim() === b.palabra.toUpperCase().trim());

    const wordA = (origA && origA.palabraMostrar) || a.palabraMostrar || a.palabra;
    const wordB = (origB && origB.palabraMostrar) || b.palabraMostrar || b.palabra;
    return wordA.localeCompare(wordB);
  }).forEach(item => {
    const card = document.createElement('div');
    card.className = 'dict-card';
    
    const originalObj = validWords.find(w => (w.id && w.id === item.id) || w.palabra.toUpperCase().trim() === item.palabra.toUpperCase().trim());
    const textoMostrar = (originalObj && originalObj.palabraMostrar) || item.palabraMostrar || item.palabra;

    card.innerHTML = `
      <div class="dict-card-header">
        <span class="dict-word">${textoMostrar}</span>
      </div>
      <div class="dict-definition">${item.significado}</div>
    `;
    dictionaryList.appendChild(card);
  });
}

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
      hintLevel: currentGame.hintLevel,
      elapsedSeconds: dailyTimerState.secondsElapsed
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
  fetch('words.json?v=' + new Date().getTime())
    .then(res => res.json())
    .then(data => {
      validWords = data.filter(item => item.palabra && item.palabra.trim().length >= 5 && item.palabra.trim().length <= 9);

      if (validWords.length === 0) {
        showAlert('No se encontraron palabras válidas en words.json.');
        return;
      }

      loadUnlockedWords();
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

  if (btnBadges) {
    btnBadges.addEventListener('click', () => {
      renderBadgesGrid();
      badgesModal.classList.remove('hidden');
    });
  }

  if (closeBadges) closeBadges.addEventListener('click', () => badgesModal.classList.add('hidden'));
  if (btnModalCloseBadges) btnModalCloseBadges.addEventListener('click', () => badgesModal.classList.add('hidden'));

  if (btnDictionary) {
    btnDictionary.addEventListener('click', () => {
      checkAndUnlockBadge('b41');
      if (dictSearchInput) dictSearchInput.value = '';
      renderDictionaryList();
      dictionaryModal.classList.remove('hidden');
    });
  }

  if (closeDictionary) closeDictionary.addEventListener('click', () => dictionaryModal.classList.add('hidden'));
  if (btnModalCloseDict) btnModalCloseDict.addEventListener('click', () => dictionaryModal.classList.add('hidden'));

  if (dictSearchInput) {
    dictSearchInput.addEventListener('input', (e) => {
      renderDictionaryList(e.target.value);
    });
  }

  if (btnHint) {
    btnHint.addEventListener('click', handleHintClick);
  }

  btnCloseResultModal.addEventListener('click', () => {
    resultModal.classList.add('hidden');
    updateMainActionButtons();
  });

  btnStats.addEventListener('click', () => {
    checkAndUnlockBadge('b86');
    openStatsModal();
  });
  closeStats.addEventListener('click', () => statsModal.classList.add('hidden'));
  btnModalCloseStats.addEventListener('click', () => statsModal.classList.add('hidden'));

  document.querySelectorAll('.stats-tab-menu .stats-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.stats-tab-menu .stats-tab-btn').forEach(b => b.classList.remove('active'));
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
        !resultModal.classList.contains('hidden') ||
        !dictionaryModal.classList.contains('hidden') ||
        !badgesModal.classList.contains('hidden') ||
        !customAlertModal.classList.contains('hidden')) return;

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
  
  if (dailyGameInfo) {
    dailyGameInfo.classList.toggle('hidden', mode === 'free');
  }

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
  currentGame.status = 'IN_PROGRESS';
  currentGame.animatedRows = [];
  currentGame.hintLevel = 0;
  if (dailyCompletedBanner) dailyCompletedBanner.classList.add('hidden');
  hideMainActionButtons();

  if (dailyGameInfo) {
    dailyGameInfo.classList.toggle('hidden', mode === 'free');
  }
  stopDailyTimer();
  dailyTimerState.secondsElapsed = 0;
  dailyTimerState.hasStarted = false;
  updateTimerDisplay();

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
          dailyTimerState.secondsElapsed = dailyData.elapsedSeconds || 0;
          updateTimerDisplay();

          if (currentGame.status === 'WON') {
            unlockCurrentWord();
          }

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

          if (currentGame.status === 'WON') {
            unlockCurrentWord();
            updateMainActionButtons();
          } else if (currentGame.status === 'LOST') {
            updateMainActionButtons();
          }
        }
      } catch (e) {}
    }
  }

  resetInputArray();
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

// Funciones de control del cronómetro diario
function startDailyTimer() {
  if (currentGame.mode !== 'daily' || dailyTimerState.isRunning || currentGame.status !== 'IN_PROGRESS') return;
  dailyTimerState.isRunning = true;
  dailyTimerState.hasStarted = true;

  dailyTimerState.timerInterval = setInterval(() => {
    dailyTimerState.secondsElapsed++;
    updateTimerDisplay();
  }, 1000);
}

function stopDailyTimer() {
  if (dailyTimerState.timerInterval) {
    clearInterval(dailyTimerState.timerInterval);
    dailyTimerState.timerInterval = null;
  }
  dailyTimerState.isRunning = false;
}

function updateTimerDisplay() {
  if (!timerCounterEl) return;
  const minutes = Math.floor(dailyTimerState.secondsElapsed / 60);
  const seconds = dailyTimerState.secondsElapsed % 60;
  timerCounterEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatSecondsToTime(totalSeconds) {
  if (totalSeconds === null || totalSeconds === undefined || isNaN(totalSeconds)) return '--:--';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// --- ACTUALIZACIÓN DE ESTADÍSTICAS Y RÉCORD DE TIEMPO ---
function recordGameResult(isWin) {
  const modeKey = currentGame.mode;
  const currentModeStats = stats[modeKey];

  currentModeStats.played++;
  if (isWin) {
    currentModeStats.wins++;
    currentModeStats.streak++;
    if (currentModeStats.streak > currentModeStats.maxStreak) {
      currentModeStats.maxStreak = currentModeStats.streak;
    }
    const attemptsCount = currentGame.attempts.length;
    if (currentModeStats.distribution[attemptsCount] !== undefined) {
      currentModeStats.distribution[attemptsCount]++;
    }

    // SI ES MODO DIARIO Y GANÓ: Actualizamos el récord de tiempo (si es menor o no existe)
    if (modeKey === 'daily') {
      const timeSpent = dailyTimerState.secondsElapsed;
      if (currentModeStats.bestTimeSeconds === null || timeSpent < currentModeStats.bestTimeSeconds) {
        currentModeStats.bestTimeSeconds = timeSpent;
      }
    }
  } else {
    currentModeStats.streak = 0;
    currentModeStats.distribution.X++;
  }

  saveStats();
}

function renderBoard() {
  if (!boardEl || !currentGame.wordObj) return;
  boardEl.innerHTML = '';
  const wordLength = currentGame.targetWord.length;
  const maxAttempts = 6;

  for (let r = 0; r < maxAttempts; r++) {
    const rowEl = document.createElement('div');
    rowEl.className = 'board-row';

    const attemptWord = currentGame.attempts[r] || '';
    const isCurrentRow = (r === currentGame.attempts.length && currentGame.status === 'IN_PROGRESS');
    const isSubmittedRow = r < currentGame.attempts.length;

    for (let c = 0; c < wordLength; c++) {
      const tileEl = document.createElement('div');
      tileEl.className = 'tile';
      tileEl.setAttribute('data-row', r);
      tileEl.setAttribute('data-col', c);

      if (isSubmittedRow) {
        const letter = attemptWord[c] || '';
        tileEl.textContent = letter;
        const colorClass = getTileColorClass(attemptWord, c, currentGame.targetWord);
        tileEl.classList.add(colorClass);

        if (!currentGame.animatedRows.includes(r)) {
          tileEl.style.animationDelay = `${c * 0.1}s`;
          tileEl.classList.add('animate-flip');
        }
      } else if (isCurrentRow) {
        if (c < currentGame.currentInput.length) {
          tileEl.textContent = currentGame.currentInput[c];
          tileEl.classList.add('filled');
        }
        if (c === currentGame.selectedTileIndex) {
          tileEl.classList.add('selected');
        }
      }

      if (isCurrentRow) {
        tileEl.addEventListener('click', () => {
          currentGame.selectedTileIndex = c;
          renderBoard();
        });
      }

      rowEl.appendChild(tileEl);
    }

    if (isSubmittedRow && !currentGame.animatedRows.includes(r)) {
      currentGame.animatedRows.push(r);
    }

    boardEl.appendChild(rowEl);
  }
}

function getTileColorClass(attemptWord, index, targetWord) {
  const letter = attemptWord[index];
  const targetLetter = targetWord[index];

  if (letter === targetLetter) {
    return 'correct';
  }

  let targetLetterCount = 0;
  let correctMatchesCount = 0;
  for (let i = 0; i < targetWord.length; i++) {
    if (targetWord[i] === letter) targetLetterCount++;
    if (attemptWord[i] === letter && targetWord[i] === letter) correctMatchesCount++;
  }

  let currentLetterAppearancesBefore = 0;
  let currentLetterCorrectBefore = 0;
  for (let i = 0; i < index; i++) {
    if (attemptWord[i] === letter) {
      currentLetterAppearancesBefore++;
      if (targetWord[i] === letter) currentLetterCorrectBefore++;
    }
  }

  const allowedYellows = targetLetterCount - correctMatchesCount;
  const assignedYellowsBefore = currentLetterAppearancesBefore - currentLetterCorrectBefore;

  if (targetWord.includes(letter) && letter !== targetLetter) {
    if (assignedYellowsBefore < allowedYellows) {
      return 'present';
    }
  }

  return 'absent';
}

function handleKeyPress(key) {
  if (currentGame.status !== 'IN_PROGRESS') return;

  // Iniciar temporizador diario en la primera interacción si es modo diario
  if (currentGame.mode === 'daily' && !dailyTimerState.isRunning) {
    startDailyTimer();
  }

  const wordLength = currentGame.targetWord.length;

  if (key === 'ENTER') {
    submitCurrentAttempt();
  } else if (key === 'BACKSPACE') {
    if (currentGame.currentInput.length > 0) {
      if (currentGame.selectedTileIndex < currentGame.currentInput.length) {
        currentGame.currentInput.splice(currentGame.selectedTileIndex, 1);
        if (currentGame.selectedTileIndex > 0) {
          currentGame.selectedTileIndex--;
        }
      } else {
        currentGame.currentInput.pop();
        currentGame.selectedTileIndex = currentGame.currentInput.length - 1;
        if (currentGame.selectedTileIndex < 0) currentGame.selectedTileIndex = 0;
      }
      renderBoard();
    }
  } else {
    if (/^[A-ZÑ]$/.test(key)) {
      if (currentGame.currentInput.length < wordLength) {
        if (currentGame.selectedTileIndex < currentGame.currentInput.length) {
          currentGame.currentInput.splice(currentGame.selectedTileIndex, 0, key);
        } else {
          currentGame.currentInput.push(key);
        }
        
        if (currentGame.currentInput.length > wordLength) {
          currentGame.currentInput.pop();
        }

        if (currentGame.selectedTileIndex < wordLength - 1) {
          currentGame.selectedTileIndex++;
        }
        renderBoard();
      }
    }
  }
}

function submitCurrentAttempt() {
  const wordLength = currentGame.targetWord.length;
  if (currentGame.currentInput.length < wordLength) {
    showBoardErrorAnimation();
    return;
  }

  const attemptWord = currentGame.currentInput.join('');

  if (!isValidDictionaryWord(attemptWord)) {
    showBoardErrorAnimation();
    return;
  }

  currentGame.attempts.push(attemptWord);
  updateKeyboardColors(attemptWord);

  const isWin = (attemptWord === currentGame.targetWord);
  const isLoss = (!isWin && currentGame.attempts.length >= 6);

  if (isWin || isLoss) {
    currentGame.status = isWin ? 'WON' : 'LOST';
    if (currentGame.mode === 'daily') {
      stopDailyTimer();
      if (dailyCompletedBanner) dailyCompletedBanner.classList.remove('hidden');
    }
    
    recordGameResult(isWin);
    if (isWin) {
      unlockCurrentWord();
    }
    saveGameState();

    evaluateBadgesOnGameEnd(isWin, currentGame.attempts.length, wordLength, currentGame.hintLevel);
    setTimeout(() => {
      openResultModal(isWin);
    }, 600);
  } else {
    saveGameState();
  }

  resetInputArray();
  renderBoard();
}

function isValidDictionaryWord(word) {
  return validWords.some(w => w.palabra.toUpperCase().trim() === word);
}

function resetInputArray() {
  currentGame.currentInput = [];
  currentGame.selectedTileIndex = 0;
}

function showBoardErrorAnimation() {
  const currentRowIndex = currentGame.attempts.length;
  const rowElements = boardEl.querySelectorAll('.board-row');
  if (rowElements[currentRowIndex]) {
    const row = rowElements[currentRowIndex];
    row.classList.add('shake');
    setTimeout(() => row.classList.remove('shake'), 500);
  }
}

function updateKeyboardColors(attemptWord) {
  const targetWord = currentGame.targetWord;
  for (let i = 0; i < attemptWord.length; i++) {
    const letter = attemptWord[i];
    const colorClass = getTileColorClass(attemptWord, i, targetWord);
    const keyEl = keyboardEl.querySelector(`.key[data-key="${letter}"]`);
    if (!keyEl) continue;

    if (colorClass === 'correct') {
      keyEl.classList.remove('present', 'absent');
      keyEl.classList.add('correct');
    } else if (colorClass === 'present' && !keyEl.classList.contains('correct')) {
      keyEl.classList.remove('absent');
      keyEl.classList.add('present');
    } else if (colorClass === 'absent' && !keyEl.classList.contains('correct') && !keyEl.classList.contains('present')) {
      keyEl.classList.add('absent');
    }
  }
}

function resetKeyboardColors() {
  const keys = keyboardEl.querySelectorAll('.key');
  keys.forEach(k => k.classList.remove('correct', 'present', 'absent'));
}

function discardKeyboardLetters(count) {
  const targetWord = currentGame.targetWord;
  const alphabet = ['Q','W','E','R','T','Y','U','I','O','P','A','S','D','F','G','H','J','K','L','Ñ','Z','X','C','V','B','N','M'];
  const candidates = alphabet.filter(l => !targetWord.includes(l));

  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  const toDiscard = candidates.slice(0, count);
  toDiscard.forEach(letter => {
    const keyEl = keyboardEl.querySelector(`.key[data-key="${letter}"]`);
    if (keyEl && !keyEl.classList.contains('correct') && !keyEl.classList.contains('present')) {
      keyEl.classList.add('absent');
    }
  });
}

function handleHintClick() {
  if (currentGame.status !== 'IN_PROGRESS') return;

  if (currentGame.hintLevel === 0) {
    currentGame.hintLevel = 1;
    discardKeyboardLetters(3);
    updateHintButtonUI();
    saveGameState();
    checkAndUnlockBadge('b63');
  } else if (currentGame.hintLevel === 1) {
    currentGame.hintLevel = 2;
    revealGreenTile();
    updateHintButtonUI();
    saveGameState();
    checkAndUnlockBadge('b64');
  } else if (currentGame.hintLevel === 2) {
    currentGame.hintLevel = 3;
    revealWordDefinition();
    updateHintButtonUI();
    saveGameState();
    checkAndUnlockBadge('b65');
  } else {
    showAlert('Ya has utilizado todas las pistas disponibles para esta palabra.');
  }
}

function revealGreenTile() {
  const targetWord = currentGame.targetWord;
  const alphabet = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','Ñ','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
  const unrevealedLetters = alphabet.filter(l => targetWord.includes(l));

  if (unrevealedLetters.length > 0) {
    const randomLetter = unrevealedLetters[Math.floor(Math.random() * unrevealedLetters.length)];
    showAlert(`💡 Pista (Letra Verde):\nLa letra "${randomLetter}" forma parte de la palabra.`);
  }
}

function revealWordDefinition() {
  const def = currentGame.wordObj.significado || 'Sin definición disponible.';
  showAlert(`💡 Pista (Significado):\n${def}`);
}

function updateHintButtonUI() {
  if (!btnHint) return;
  if (currentGame.hintLevel === 0) {
    btnHint.textContent = '💡 Pista 1/3 (Descartar letras)';
    btnHint.disabled = false;
  } else if (currentGame.hintLevel === 1) {
    btnHint.textContent = '💡 Pista 2/3 (Revelar letra)';
    btnHint.disabled = false;
  } else if (currentGame.hintLevel === 2) {
    btnHint.textContent = '💡 Pista 3/3 (Ver significado)';
    btnHint.disabled = false;
  } else {
    btnHint.textContent = '💡 Pistas agotadas';
    btnHint.disabled = true;
  }
}

function openResultModal(isWin) {
  if (isWin) {
    const attemptsCount = currentGame.attempts.length;
    resultBanner.className = 'feedback-banner win';
    resultBanner.textContent = winMessages[attemptsCount] || "¡Enhorabuena, has ganado!";
  } else {
    resultBanner.className = 'feedback-banner loss';
    resultBanner.textContent = `¡Oh! La palabra era: ${currentGame.targetWord}`;
  }

  if (currentGame.wordObj && currentGame.wordObj.significado) {
    resultWordDefinition.classList.remove('hidden');
    resultWordDefinition.innerHTML = `<strong>Significado:</strong> ${currentGame.wordObj.significado}`;
  } else {
    resultWordDefinition.classList.add('hidden');
  }

  if (currentGame.mode === 'daily') {
    resultCountdownBox.classList.remove('hidden');
    startMidnightCountdown();
  } else {
    resultCountdownBox.classList.add('hidden');
  }

  btnShare.classList.remove('hidden');
  resultModal.classList.remove('hidden');
}

function openDailyAlreadyPlayedModal() {
  resultBanner.className = 'feedback-banner win';
  resultBanner.textContent = "¡Ya has completado la palabra de hoy!";
  
  if (currentGame.wordObj && currentGame.wordObj.significado) {
    resultWordDefinition.classList.remove('hidden');
    resultWordDefinition.innerHTML = `<strong>Significado:</strong> ${currentGame.wordObj.significado}`;
  } else {
    resultWordDefinition.classList.add('hidden');
  }

  resultCountdownBox.classList.remove('hidden');
  startMidnightCountdown();

  btnShare.classList.remove('hidden');
  btnNextWord.classList.add('hidden');
  btnRetryWord.classList.add('hidden');
  resultModal.classList.remove('hidden');
}

function startMidnightCountdown() {
  if (countdownInterval) clearInterval(countdownInterval);

  const updateClock = () => {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const diff = tomorrow - now;

    if (diff <= 0) {
      dailyTimer.textContent = "00:00:00";
      return;
    }

    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    dailyTimer.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  updateClock();
  countdownInterval = setInterval(updateClock, 1000);
}

function updateMainActionButtons() {
  if (currentGame.mode === 'free' && currentGame.status !== 'IN_PROGRESS') {
    btnMainNext.classList.remove('hidden');
    btnMainRetry.classList.remove('hidden');
  } else {
    hideMainActionButtons();
  }
}

function hideMainActionButtons() {
  btnMainNext.classList.add('hidden');
  btnMainRetry.classList.add('hidden');
}

function nextFreeWord() {
  currentGame.freeWordIndex++;
  localStorage.setItem('palabra_aragonesa_free_index', currentGame.freeWordIndex);
  localStorage.removeItem('palabra_aragonesa_free_game');
  resultModal.classList.add('hidden');
  initGame('free');
}

function retryFreeWord() {
  localStorage.removeItem('palabra_aragonesa_free_game');
  resultModal.classList.add('hidden');
  initGame('free');
}

function shareResults() {
  const modeText = currentGame.mode === 'daily' ? 'Palabra del Día' : 'Modo Libre';
  const score = currentGame.status === 'WON' ? currentGame.attempts.length : 'X';
  const text = `La Palabra Aragonesa del Día (${modeText}) 🎯\nResultado: ${score}/6 intentos.\n¡Juega y practica el aragones!\nhttps://tudominio.com/la-palabra-aragonesa/`;

  if (navigator.share) {
    navigator.share({
      title: 'La Palabra Aragonesa del Día',
      text: text
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => {
      showAlert('¡Resultado copiado al portapapeles!');
    });
  }
  checkAndUnlockBadge('b81');
}

function openStatsModal() {
  renderStatsData();
  statsModal.classList.remove('hidden');
}

function renderStatsData() {
  const currentStats = activeStatsTab === 'total' 
    ? {
        played: stats.daily.played + stats.free.played,
        wins: stats.daily.wins + stats.free.wins,
        streak: stats.daily.streak,
        maxStreak: Math.max(stats.daily.maxStreak, stats.free.maxStreak),
        bestTimeSeconds: stats.daily.bestTimeSeconds,
        distribution: {
          1: stats.daily.distribution[1] + stats.free.distribution[1],
          2: stats.daily.distribution[2] + stats.free.distribution[2],
          3: stats.daily.distribution[3] + stats.free.distribution[3],
          4: stats.daily.distribution[4] + stats.free.distribution[4],
          5: stats.daily.distribution[5] + stats.free.distribution[5],
          6: stats.daily.distribution[6] + stats.free.distribution[6],
          X: stats.daily.distribution.X + stats.free.distribution.X
        }
      }
    : stats[activeStatsTab];

  document.getElementById('stat-played').textContent = currentStats.played;
  const winRate = currentStats.played > 0 ? Math.round((currentStats.wins / currentStats.played) * 100) : 0;
  document.getElementById('stat-winrate').textContent = `${winRate}%`;
  document.getElementById('stat-streak').textContent = currentStats.streak;
  document.getElementById('stat-maxstreak').textContent = currentStats.maxStreak;

  // Mostrar u ocultar contenedor de récord de tiempo según la pestaña activa
  const timeRecordContainer = document.getElementById('stat-time-record-container');
  const bestTimeValueEl = document.getElementById('stat-best-time');
  
  if (activeStatsTab === 'daily' || activeStatsTab === 'total') {
    if (timeRecordContainer) timeRecordContainer.style.display = 'flex';
    if (bestTimeValueEl) {
      bestTimeValueEl.textContent = formatSecondsToTime(stats.daily.bestTimeSeconds);
    }
  } else {
    if (timeRecordContainer) timeRecordContainer.style.display = 'none';
  }

  const distributionContainer = document.getElementById('guess-distribution');
  distributionContainer.innerHTML = '';

  const maxDistValue = Math.max(...Object.values(currentStats.distribution), 1);

  for (let i = 1; i <= 6; i++) {
    const count = currentStats.distribution[i] || 0;
    const percentage = Math.max(Math.round((count / maxDistValue) * 100), 7);

    const row = document.createElement('div');
    row.className = 'dist-row';
    row.innerHTML = `
      <span class="dist-label">${i}</span>
      <div class="dist-bar-container">
        <div class="dist-bar" style="width: ${percentage}%">${count}</div>
      </div>
    `;
    distributionContainer.appendChild(canvasesOrDiv(row));
  }
}

function canvasesOrDiv(el) {
  return el;
}

function initAdMobPlugin() {
  console.log('AdMob SDK initialized.');
}
