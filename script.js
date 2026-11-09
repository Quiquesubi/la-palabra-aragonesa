let validWords = [];

let currentGame = {
  mode: 'daily', // 'daily', 'free', 'timeattack', 'definitions'
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

// Variables específicas para el Modo Contrarreloj (120 segundos iniciales)
let timeAttackState = {
  timeLeft: 120, 
  score: 0,     
  timerInterval: null,
  isActive: false
};

// Variables específicas para el Modo Definiciones (90 segundos fijos)
let definitionsState = {
  timeLeft: 90, 
  score: 0,     
  timerInterval: null,
  isActive: false
};

// Estadísticas separadas por modo
let stats = {
  daily: { played: 0, wins: 0, streak: 0, maxStreak: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, X: 0 } },
  free: { played: 0, wins: 0, streak: 0, maxStreak: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, X: 0 } },
  timeattack: { played: 0, wins: 0, streak: 0, maxStreak: 0, bestScore: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, X: 0 } },
  definitions: { played: 0, wins: 0, streak: 0, maxStreak: 0, bestScore: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, X: 0 } }
};

let unlockedWords = [];
let activeStatsTab = 'daily';
let countdownInterval = null;

const winMessages = {
  1: "¡Increíble! ¡Adivinada a la primera! 🎯",
  2: "¡Espectacular! ¡En solo dos intentos! ⭐",
  3: "¡Excelente! ¡A la tercera va la vencida! 👏",
  4: "¡Muy bien! ¡Palabra adivinada! 👍",
  5: "¡Bien jugado! ¡Casi al límite! 😊",
  6: "¡Uff! ¡Adivinada en el último intento! 😅"
};

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
  { id: 'b105', name: 'Espíritu del Pirineo', icon: '🏔️', desc: 'Completa 15 palabras del día en agosto' },
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
  { id: 'b135', name: 'Frío del Norte', icon: '❄️', desc: 'Juega en los meses de enero o febrero' },
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
  { id: 'b171', name: 'Doble Pareja', icon: '♊', desc: 'Resuelve una palabra con deux pares de letras iguales' },
  { id: 'b172', name: 'Trío Consonántico', icon: '🧱', desc: 'Resuelve una palabra que tenga 3 consonantes seguidas' },
  { id: 'b173', name: 'Simetría Casi Perfecta', icon: '🪞', desc: 'Adivina una palabra cuyo inicio y fin sean la misma letra' },
  { id: 'b174', name: 'Inicio Vocal', icon: '🅰️', desc: 'Adivina 10 palabras que empiecen por vocal' },
  { id: 'b175', name: 'Inicio Consonante', icon: '🅱️', desc: 'Adivina 20 palabras que empiecen por consonante' },
  { id: 'b176', name: 'Final en Vocal', icon: '🟢', desc: 'Adivina 15 palabras que terminen en vocal' },
  { id: 'b177', name: 'Final en Consonante', icon: '🔵', desc: 'Adivina 15 palabras que terminen en consonante' },
  { id: 'b178', name: "Sin Letra 'A'", icon: '🚫', desc: "Resuelve una palabra que no contenga la letra A" },
  { id: 'b179', name: "Sin Letra 'E'", icon: '🚫', desc: "Resuelve una palabra que no contenga la letra E" },
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
  { id: 'b200', name: 'Panteón Aragonés', icon: '🌌', desc: 'Desbloquea los 200 emblemas del juego' },
  { id: 'b201', name: 'Primer Reloj', icon: '⚡', desc: 'Juega tu primera partida en Modo Contrarreloj' },
  { id: 'b202', name: 'Sprint Inicial', icon: '⏱️', desc: 'Consigue al menos 1 acierto en Contrarreloj' },
  { id: 'b203', name: 'Velocidad de Crucero', icon: '🏃', desc: 'Consigue 3 aciertos en una Contrarreloj' },
  { id: 'b204', name: 'Reflejos de Acero', icon: '⚡', desc: 'Consigue 5 aciertos en una Contrarreloj' },
  { id: 'b205', name: 'Agilidad Extrema', icon: '🔥', desc: 'Consigue 7 aciertos en una Contrarreloj' },
  { id: 'b206', name: 'Furia Contrarreloj', icon: '🌪️', desc: 'Consigue 10 o más aciertos en Contrarreloj' },
  { id: 'b207', name: 'Constante en el Tiempo', icon: '🕒', desc: 'Juega 10 partidas en Modo Contrarreloj' },
  { id: 'b208', name: 'Maratonianos del Reloj', icon: '🏃‍♂️', desc: 'Juega 25 partidas en Modo Contrarreloj' },
  { id: 'b209', name: 'Adicto al Crono', icon: '⏱️', desc: 'Juega 50 partidas en Modo Contrarreloj' },
  { id: 'b210', name: 'Veterano Veloz', icon: '⚡', desc: 'Juega 100 partidas en Modo Contrarreloj' },
  { id: 'b211', name: 'Iniciador del Sprint', icon: '🌱', desc: 'Consigue un total de 10 aciertos acumulados en Contrarreloj' },
  { id: 'b212', name: 'Experto en Sprint', icon: '🌿', desc: 'Consigue un total de 50 aciertos acumulados en Contrarreloj' },
  { id: 'b213', name: 'Maestro del Sprint', icon: '🌳', desc: 'Consigue un total de 200 aciertos acumulados en Contrarreloj' },
  { id: 'b214', name: 'Récord Cronometrado', icon: '📈', desc: 'Supera tu mejor marca personal en Contrarreloj' },
  { id: 'b215', name: 'Sin Pausa', icon: '🚀', desc: 'Juega 3 partidas seguidas de Contrarreloj' },
  { id: 'b216', name: 'Rápido y Preciso', icon: '🎯', desc: 'Resuelve una palabra en Contrarreloj en su primer intento' },
  { id: 'b217', name: 'Superviviente del Tiempo', icon: '🛡️', desc: 'Agotar el crono en Contrarreloj con más de 5 aciertos' },
  { id: 'b218', name: 'Explorador del Reloj', icon: '🧭', desc: 'Abre las estadísticas y revisa tu récord de Contrarreloj' },
  { id: 'b219', name: 'Velocista Nocturno', icon: '🌙', desc: 'Juega una partida de Contrarreloj pasadas las 22:00' },
  { id: 'b220', name: 'Madrugador Rápido', icon: '🌅', desc: 'Juega Contrarreloj antes de las 08:00 AM' },
  { id: 'b221', name: 'Fin de Semana Contrarreloj', icon: '🎉', desc: 'Juega Contrarreloj un sábado o domingo' },
  { id: 'b222', name: 'Doble Velocidad', icon: '⚡', desc: 'Juega Contrarreloj y Definiciones en el mismo día' },
  { id: 'b223', name: 'Leyenda del Crono', icon: '👑', desc: 'Alcanza una puntuación de 15 palabras en Contrarreloj' },
  { id: 'b224', name: 'Titán del Reloj', icon: '💎', desc: 'Juega 150 partidas en Modo Contrarreloj' },
  { id: 'b225', name: 'Dios del Tiempo', icon: '⌛', desc: 'Acumula 500 aciertos totales en Contrarreloj' },
  { id: 'b226', name: 'Primera Definición', icon: '📜', desc: 'Juega tu primera partida en Modo Definiciones' },
  { id: 'b227', name: 'Interpretación Acertada', icon: '💡', desc: 'Consigue al menos 1 acierto en Definiciones' },
  { id: 'b228', name: 'Lector Comprensivo', icon: '📖', desc: 'Consigue 3 aciertos en Modo Definiciones' },
  { id: 'b229', name: 'Mente Culta', icon: '🧠', desc: 'Consigue 5 aciertos en Modo Definiciones' },
  { id: 'b230', name: 'Sabiduría Instantánea', icon: '🌟', desc: 'Consigue 7 aciertos en Modo Definiciones' },
  { id: 'b231', name: 'Diccionario Humano', icon: '🏛️', desc: 'Consigue 10 o más aciertos en Definiciones' },
  { id: 'b232', name: 'Curioso de Significados', icon: '📚', desc: 'Juega 10 partidas en Modo Definiciones' },
  { id: 'b233', name: 'Estudioso Constante', icon: '🎓', desc: 'Juega 25 partidas en Modo Definiciones' },
  { id: 'b234', name: 'Erudito del Tiempo', icon: '⏳', desc: 'Juega 50 partidas en Modo Definiciones' },
  { id: 'b235', name: 'Maestro de la Semántica', icon: '📜', desc: 'Juega 100 partidas en Modo Definiciones' },
  { id: 'b236', name: 'Iniciador Semántico', icon: '🌱', desc: 'Consigue un total de 10 aciertos acumulados en Definiciones' },
  { id: 'b237', name: 'Experto Semántico', icon: '🌿', desc: 'Consigue un total de 50 aciertos acumulados en Definiciones' },
  { id: 'b238', name: 'Maestro Semántico', icon: '🌳', desc: 'Consigue un total de 200 aciertos acumulados en Definiciones' },
  { id: 'b239', name: 'Récord de Definiciones', icon: '📊', desc: 'Supera tu mejor marca personal en Definiciones' },
  { id: 'b240', name: 'Reflexión Veloz', icon: '💡', desc: 'Juega 3 partidas seguidas de Definiciones' },
  { id: 'b241', name: 'Definición al Vuelo', icon: '🦅', desc: 'Resuelve una palabra en Definiciones en su primer intento' },
  { id: 'b242', name: 'Cierre de Crono', icon: '⌛', desc: 'Agotar el crono en Definiciones con más de 3 aciertos' },
  { id: 'b243', name: 'Explorador de Conceptos', icon: '🔎', desc: 'Abre las estadísticas y revisa tu récord de Definiciones' },
  { id: 'b244', name: 'Lector Nocturno', icon: '🌌', desc: 'Juega una partida de Definiciones pasadas las 22:00' },
  { id: 'b245', name: 'Madrugador Culto', icon: '🌄', desc: 'Juega Definiciones antes de las 08:00 AM' },
  { id: 'b246', name: 'Fin de Semana de Definiciones', icon: '☕', desc: 'Juega Definiciones un sábado o domingo' },
  { id: 'b247', name: 'Sabio Supremo', icon: '👑', desc: 'Alcanza una puntuación de 12 palabras en Definiciones' },
  { id: 'b248', name: 'Filósofo Aragonés', icon: '🧙‍♂️', desc: 'Juega 150 partidas en Modo Definiciones' },
  { id: 'b249', name: 'Enciclopedia Viviente', icon: '📖', desc: 'Acumula 400 aciertos totales en Definiciones' },
  { id: 'b250', name: 'Maestro Absoluto del Tesoro', icon: '🌟', desc: 'Desbloquea los 250 emblemas del juego' }
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

const modeIntroModal = document.getElementById('mode-intro-modal');
const modeIntroTitle = document.getElementById('mode-intro-title');
const modeIntroText = document.getElementById('mode-intro-text');
const dontShowModeIntro = document.getElementById('dont-show-mode-intro');
const modeIntroOkBtn = document.getElementById('mode-intro-ok-btn');

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
const btnModeTimeAttack = document.getElementById('btn-mode-timeattack');
const btnModeDefinitions = document.getElementById('btn-mode-definitions');

const freeControls = document.getElementById('free-mode-controls');
const timeAttackControls = document.getElementById('timeattack-controls');
const timeAttackTimerBadge = document.getElementById('timeattack-timer-badge');
const timeAttackScoreBadge = document.getElementById('timeattack-score-badge');

const definitionsControls = document.getElementById('definitions-controls');
const definitionsTimerBadge = document.getElementById('definitions-timer-badge');
const definitionsScoreBadge = document.getElementById('definitions-score-badge');
const definitionsBoxPanel = document.getElementById('definitions-box-panel');
const definitionsTextSpan = document.getElementById('definitions-text-span');

const wordBadge = document.getElementById('word-number-badge');
const dailyCompletedBanner = document.getElementById('daily-completed-banner');

const customAlertModal = document.getElementById('custom-alert-modal');
const customAlertMessage = document.getElementById('custom-alert-message');
const customAlertOkBtn = document.getElementById('custom-alert-ok-btn');
const customAlertCancelBtn = document.getElementById('custom-alert-cancel-btn');

document.addEventListener('DOMContentLoaded', () => {
  loadSavedStats();
  initEventListeners();
  loadWordsJSON();
  setupDailyReminderNotification();
});

function showAlert(message, isConfirm = false) {
  return new Promise((resolve) => {
    customAlertMessage.innerText = message;
    customAlertModal.classList.remove('hidden');
    if (isConfirm) customAlertCancelBtn.classList.remove('hidden');
    else customAlertCancelBtn.classList.add('hidden');

    const onOk = () => { cleanup(); resolve(true); };
    const onCancel = () => { cleanup(); resolve(false); };
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
        if (permission === 'granted') scheduleLocalNotification(registration);
      });
    } else if (Notification.permission === 'granted') {
      scheduleLocalNotification(registration);
    }
  }).catch(err => console.error('Error SW:', err));
}

function scheduleLocalNotification(registration) {
  const savedDaily = localStorage.getItem('palabra_aragonesa_daily_game');
  let playedToday = false;
  if (savedDaily) {
    try {
      const data = JSON.parse(savedDaily);
      if (data.date === getTodayString() && data.status !== 'IN_PROGRESS') playedToday = true;
    } catch (e) {}
  }
  if (playedToday) return;

  const now = new Date();
  const reminderTime = new Date();
  reminderTime.setHours(20, 0, 0, 0);
  if (now > reminderTime) reminderTime.setDate(reminderTime.getDate() + 1);

  if ('showTrigger' in Notification.prototype) {
    registration.showNotification("La Palabra Aragonesa del Día", {
      body: "¿Has resuelto ya la palabra aragonesa de hoy? 🎯 ¡Entra y acepta el reto!",
      icon: "favicon.png",
      tag: "daily-reminder",
      showTrigger: new TimestampTrigger(reminderTime.getTime())
    });
  }
}

function loadUnlockedWords() {
  const saved = localStorage.getItem('palabra_aragonesa_unlocked_words');
  unlockedWords = saved ? JSON.parse(saved) : [];

  const savedFreeIndex = localStorage.getItem('palabra_aragonesa_free_index');
  if (savedFreeIndex !== null && validWords && validWords.length > 0) {
    const currentIndex = parseInt(savedFreeIndex, 10) || 0;
    let hasNewImport = false;
    for (let i = 0; i < currentIndex; i++) {
      const wObj = validWords[i];
      if (!wObj) continue;
      const wordId = wObj.id || wObj.palabra;
      const exists = unlockedWords.some(item => item.id === wordId || item.palabra.toUpperCase().trim() === wObj.palabra.toUpperCase().trim());
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
    return displayWord.toLowerCase().includes(filterText.toLowerCase()) || item.significado.toLowerCase().includes(filterText.toLowerCase());
  });

  if (filtered.length === 0) {
    dictionaryList.innerHTML = `<div class="dict-empty-msg">${unlockedWords.length === 0 ? 'Aún no has descubierto ninguna palabra.' : 'No se encontraron palabras.'}</div>`;
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'dict-card';
    const originalObj = validWords.find(w => (w.id && w.id === item.id) || w.palabra.toUpperCase().trim() === item.palabra.toUpperCase().trim());
    const textoMostrar = (originalObj && originalObj.palabraMostrar) || item.palabraMostrar || item.palabra;
    card.innerHTML = `
      <div class="dict-card-header"><span class="dict-word">${textoMostrar}</span></div>
      <div class="dict-definition">${item.significado}</div>
    `;
    dictionaryList.appendChild(card);
  });
}

function loadSavedStats() {
  const saved = localStorage.getItem('palabra_aragonesa_stats_v2');
  if (saved) {
    try { 
      const parsed = JSON.parse(saved);
      if (parsed) {
        stats = { ...stats, ...parsed };
        if (parsed.timeattack) stats.timeattack = { ...stats.timeattack, ...parsed.timeattack };
        if (parsed.definitions) stats.definitions = { ...stats.definitions, ...parsed.definitions };
      }
    } catch (e) {}
  }
  const savedFreeIndex = localStorage.getItem('palabra_aragonesa_free_index');
  if (savedFreeIndex !== null) currentGame.freeWordIndex = parseInt(savedFreeIndex, 10) || 0;
}

function saveStats() {
  localStorage.setItem('palabra_aragonesa_stats_v2', JSON.stringify(stats));
}

function saveGameState() {
  if (currentGame.mode === 'daily') {
    localStorage.setItem('palabra_aragonesa_daily_game', JSON.stringify({
      date: getTodayString(), attempts: currentGame.attempts, status: currentGame.status, hintLevel: currentGame.hintLevel
    }));
  } else if (currentGame.mode === 'free') {
    localStorage.setItem('palabra_aragonesa_free_game', JSON.stringify({
      wordIndex: currentGame.freeWordIndex, attempts: currentGame.attempts, status: currentGame.status, hintLevel: currentGame.hintLevel
    }));
  }
}

function loadWordsJSON() {
  fetch('words.json?v=' + new Date().getTime())
    .then(res => res.json())
    .then(data => {
      validWords = data.filter(item => item.palabra && item.palabra.trim().length >= 5
