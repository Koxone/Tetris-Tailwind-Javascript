import { TETROMINOES } from "./utils/tetrominoes";
import "/style.css";

/* 🔧 Variables globales necesarias para todo el juego */
let boardState = Array.from({ length: 20 }, () =>
  Array.from({ length: 10 }, () => ({
    value: 0,
    color: null,
  })),
);
let currentPosition = { x: 3, y: 0 };
let currentPiece;
let pieceBag = [];
let pieceBlocked = false;
let userLoose = false;
let userWon = false;
let gameStarted = false;
let timerInterval = null;
let startTime = null;
let counterStarted = false;
let fallLoop = null;
let score = 0;
let highScore = Number(localStorage.getItem("highScore")) || 0;
let level = 0;
let linesCleared = 0;
let fallSpeed = 1000;

/* 🎮 Elementos del DOM */
const board = document.getElementById("board");
const modal = document.getElementById("modal");
const modalNewGame = document.getElementById("modalNewGame");
const positiveButton = document.getElementById("positive");
const negativeButton = document.getElementById("negative");
const startGameButton = document.getElementById("start");
const timer = document.getElementById("timer");
const music = document.getElementById("music");

refillBag();
currentPiece = getNextPiece();
loadHighScoreUI();
renderEmptyBoard();
renderBoard();
userMovement();
startGameHandler();

/* 🏆 Cargar el highscore inicial al UI */
function loadHighScoreUI() {
  document.getElementById("highscore").innerText = `${highScore}`;
}

/* 🧱 Renderizar tablero vacío al comenzar el juego */
function renderEmptyBoard() {
  board.innerHTML = "";
  Array.from({ length: 20 }).forEach((_, row) => {
    Array.from({ length: 10 }).forEach((_, column) => {
      const cell = document.createElement("div");
      const cellColor =
        (row + column) % 2 === 0 ? "bg-neutral-800" : "bg-neutral-900";
      cell.className = `h-full w-full ${cellColor}`;
      board.appendChild(cell);
    });
  });
}

/* 🎨 Renderizar tablero completo (bloques fijos + pieza actual) */
function renderBoard() {
  board.innerHTML = "";
  Array.from({ length: 20 }).forEach((_, row) => {
    Array.from({ length: 10 }).forEach((_, column) => {
      let paintThisCell = false;
      let color = "";

      if (boardState[row][column].value === 1) {
        paintThisCell = true;
        color = boardState[row][column].color;
      }

      currentPiece.shape.forEach((pieceRow, indexY) => {
        pieceRow.forEach((cell, indexX) => {
          if (cell === 1) {
            const pieceRowInBoard = currentPosition.y + indexY;
            const pieceColumnInBoard = currentPosition.x + indexX;
            if (row === pieceRowInBoard && column === pieceColumnInBoard) {
              paintThisCell = true;
              color = currentPiece.color;
            }
          }
        });
      });

      const div = document.createElement("div");
      const cellColor = paintThisCell
        ? color
        : (row + column) % 2 === 0
          ? "bg-neutral-800"
          : "bg-neutral-900";
      div.className = `h-full w-full ${cellColor}`;
      board.appendChild(div);
    });
  });
}

/* 🔄 Rellenar bolsa de piezas usando algoritmo Fisher-Yates */
function refillBag() {
  const allPieces = Object.keys(TETROMINOES);
  for (let i = allPieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allPieces[i], allPieces[j]] = [allPieces[j], allPieces[i]];
  }
  pieceBag = allPieces;
}

/* ➕ Obtener siguiente pieza del 7-bag */
function getNextPiece() {
  if (pieceBag.length === 0) {
    refillBag();
  }
  const nextKey = pieceBag.shift();
  return TETROMINOES[nextKey];
}

/* ⬇️ Iniciar caída automática */
function startAutoFall() {
  fallLoop = setInterval(() => {
    const newY = currentPosition.y + 1;
    const collisionWithBoard = checkCollisionWithBoard(currentPiece.shape, {
      x: currentPosition.x,
      y: newY,
    });
    const outAutoFall = calculatePieceOutOfBounds(
      currentPiece.shape,
      newY,
      20,
      "y",
    );

    if (outAutoFall || collisionWithBoard) {
      pieceBlocked = true;
      clearInterval(fallLoop);
      fixPieceOnBoard();
      clearCompleteRows();

      currentPiece = getNextPiece();
      currentPosition = { x: 3, y: 0 };

      const collisionAtSpawn = checkCollisionWithBoard(
        currentPiece.shape,
        currentPosition,
      );
      if (collisionAtSpawn) {
        userLoose = true;
        stopTimer();
        playAgain();
        modal.classList.remove("hidden");
        modal.classList.add("flex");
        if (userWon) positiveButton.textContent = "Next Round";
        return;
      }

      pieceBlocked = false;
      renderBoard();
      startAutoFall();
      return;
    }

    currentPosition.y = newY;
    renderBoard();
  }, fallSpeed);
}

/* 🎮 Manejar entradas del jugador */
function userMovement() {
  const rotateSound = new Audio("/rotate.mp3");
  const moveSound = new Audio("/move.mp3");
  const fallSound = new Audio("/fall.mp3");

  window.addEventListener("keydown", (value) => {
    if (pieceBlocked || userLoose || userWon) return;

    switch (value.key) {
      case "ArrowLeft":
        moveSound.currentTime = 0;
        moveSound.play();
        const newXLeft = currentPosition.x - 1;
        const outLeft = calculatePieceOutOfBounds(
          currentPiece.shape,
          newXLeft,
          10,
          "x",
        );
        const collisionLeft = collisionAxis(newXLeft, currentPosition.y);
        movePieceIfValid("x", newXLeft, outLeft, collisionLeft);
        break;

      case "ArrowRight":
        moveSound.currentTime = 0;
        moveSound.play();
        const newXRight = currentPosition.x + 1;
        const outRight = calculatePieceOutOfBounds(
          currentPiece.shape,
          newXRight,
          10,
          "x",
        );
        const collisionRight = collisionAxis(newXRight, currentPosition.y);
        movePieceIfValid("x", newXRight, outRight, collisionRight);
        break;

      case "ArrowDown":
        fallSound.currentTime = 0;
        fallSound.play();
        const newY = currentPosition.y + 1;
        const outDown = calculatePieceOutOfBounds(
          currentPiece.shape,
          newY,
          20,
          "y",
        );
        const collisionDown = collisionAxis(currentPosition.x, newY);
        movePieceIfValid("y", newY, outDown, collisionDown);
        break;

      case "ArrowUp":
        rotateSound.currentTime = 0;
        rotateSound.play();
        const rotatedShape = rotateMatrix(currentPiece.shape);
        const outOfBoundsX = calculatePieceOutOfBounds(
          rotatedShape,
          currentPosition.x,
          10,
          "x",
        );
        const outOfBoundsY = calculatePieceOutOfBounds(
          rotatedShape,
          currentPosition.y,
          20,
          "y",
        );
        const collision = checkCollisionWithBoard(
          rotatedShape,
          currentPosition,
        );
        if (!outOfBoundsX && !outOfBoundsY && !collision) {
          currentPiece.shape = rotatedShape;
          renderBoard();
        }
        break;
    }
  });
}

/* ✅ Mover pieza si es válido */
function movePieceIfValid(axis, newValue, isOutOfBounds, isCollision) {
  if (!isOutOfBounds && !isCollision) {
    currentPosition[axis] = newValue;
    renderBoard();
  }
}

/* 🔁 Rotar pieza en sentido horario */
function rotateMatrix(matrix) {
  const size = matrix.length;
  const rotated = Array.from({ length: size }, () => Array(size).fill(0));
  matrix.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      rotated[columnIndex][size - 1 - rowIndex] = cell;
    });
  });
  return rotated;
}

/* 🧱 Fijar pieza en el tablero */
function fixPieceOnBoard() {
  currentPiece.shape.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell === 1) {
        const y = currentPosition.y + rowIndex;
        const x = currentPosition.x + colIndex;
        if (y >= 0 && y < 20 && x >= 0 && x < 10) {
          boardState[y][x] = {
            value: 1,
            color: currentPiece.color,
          };
        }
      }
    });
  });
}

/* ✂️ Eliminar filas completas */
function clearCompleteRows() {
  const clearSound = new Audio("/clear.mp3");
  const completedRows = boardState.filter((row) =>
    row.every((cell) => cell.value !== 0),
  );

  if (completedRows.length > 0) {
    const pointsTable = { 1: 40, 2: 100, 3: 300, 4: 1200 };
    const gained = (pointsTable[completedRows.length] || 0) * (level + 1);
    score += gained;
    highestScore();
    linesCleared += completedRows.length;

    if (linesCleared >= (level + 1) * 10) {
      level++;
      fallSpeed = Math.max(100, fallSpeed - 100);
      clearInterval(fallLoop);
      startAutoFall();
      const levelUpSound = new Audio("/level-up.mp3");
      levelUpSound.play();
      alert(`Nivel ${level} alcanzado!`);
    }

    clearSound.currentTime = 0;
    clearSound.play();
  }

  boardState = boardState.filter((row) => row.some((cell) => cell.value === 0));
  while (boardState.length < 20) {
    boardState.unshift(
      Array.from({ length: 10 }, () => ({ value: 0, color: null })),
    );
  }

  document.getElementById("score").innerText = `${score}`;
  document.getElementById("level").innerText = `${level}`;
}

/* 🏅 Verificar y actualizar récord */
function highestScore() {
  if (score > highScore) {
    highScore = score;
    document.getElementById("highscore").innerText = `${highScore}`;
    localStorage.setItem("highScore", score);
  }
}

/* 🔁 Reiniciar juego completamente */
function resetGame() {
  localStorage.setItem("score", score);
  boardState = Array.from({ length: 20 }, () =>
    Array.from({ length: 10 }, () => ({ value: 0, color: null })),
  );
  currentPosition = { x: 3, y: 0 };
  currentPiece = getNextPiece();
  pieceBlocked = false;
  gameStarted = false;
  userLoose = false;
  userWon = false;
  resetTimer();
  startTimer();
  renderBoard();
  startAutoFall();
  score = 0;
  level = 0;
  linesCleared = 0;
  fallSpeed = 1000;
  document.getElementById("score").innerText = `${score}`;
  document.getElementById("level").innerText = `${level}`;
}

/* 🔍 Verificar colisión con eje */
function collisionAxis(xAxis, yAxis) {
  return checkCollisionWithBoard(currentPiece.shape, { x: xAxis, y: yAxis });
}

/* 🧱 Verificar colisión pieza-tablero */
function checkCollisionWithBoard(pieceShape, position) {
  return pieceShape.some((row, rowIndex) =>
    row.some((cell, columnIndex) => {
      if (cell !== 1) return false;
      const y = position.y + rowIndex;
      const x = position.x + columnIndex;
      return (
        y >= 0 && y < 20 && x >= 0 && x < 10 && boardState[y][x].value === 1
      );
    }),
  );
}

/* 📏 Calcular si una pieza se sale del tablero */
function calculatePieceOutOfBounds(pieceShape, newCoord, boardLimit, axis) {
  return pieceShape.some((row, rowIndex) =>
    row.some((cell, colIndex) => {
      if (cell !== 1) return false;
      const globalCoord =
        axis === "x" ? newCoord + colIndex : newCoord + rowIndex;
      return globalCoord < 0 || globalCoord >= boardLimit;
    }),
  );
}

/* 🔁 Mostrar modal de juego terminado */
function playAgain() {
  if (!userLoose && !userWon) return;

  function handleModalClick(event) {
    if (event.target.id === "positive") {
      modal.classList.remove("flex");
      modal.classList.add("hidden");
      resetGame();
      modal.removeEventListener("click", handleModalClick);
    } else if (event.target.id === "negative") {
      modal.classList.remove("flex");
      modal.classList.add("hidden");
      modal.removeEventListener("click", handleModalClick);
    }
  }

  modal.addEventListener("click", handleModalClick);
}

/* ⏱️ Iniciar temporizador */
function startTimer() {
  music.play();
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const hrs = String(Math.floor(elapsed / 3600000)).padStart(2, "0");
    const mins = String(Math.floor((elapsed % 3600000) / 60000)).padStart(
      2,
      "0",
    );
    const secs = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, "0");
    timer.textContent = `${hrs}:${mins}:${secs}`;
  }, 10);
}

/* ⛔ Detener temporizador */
function stopTimer() {
  clearInterval(timerInterval);
}

/* 🔄 Reiniciar temporizador */
function resetTimer() {
  stopTimer();
  timer.textContent = `00:00:00`;
}

/* ▶️ Manejar botón de iniciar juego */
function startGameHandler() {
  startGameButton.addEventListener("click", () => {
    modalNewGame.classList.remove("flex");
    modalNewGame.classList.add("hidden");
    startAutoFall();
    startTimer();
  });
}
