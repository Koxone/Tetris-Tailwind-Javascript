import { TETROMINOES } from "./utils/tetrominoes";

let pieceBlocked = false;

function calculatePieceOutOfBoundsX(pieceShape, newX, boardWidth) {
  let outOfBounds = false;

  pieceShape.forEach((row, rowIndex) => {
    row.forEach((cell, index) => {
      if (cell === 1) {
        const xGlobal = newX + index;
        if (xGlobal < 0 || xGlobal >= boardWidth) {
          outOfBounds = true;
        }
      }
    });
  });

  return outOfBounds;
}

function calculatePieceOutOfBoundsY(pieceShape, newY, boardHeight) {
  let outOfBounds = false;

  pieceShape.forEach((row, rowIndex) => {
    row.forEach((cell) => {
      if (cell === 1) {
        const yGlobal = newY + rowIndex;
        if (yGlobal >= boardHeight) {
          outOfBounds = true;
        }
      }
    });
  });

  return outOfBounds;
}

function movePieceIfValid(axis, newValue, isOutOfBounds) {
  if (!isOutOfBounds) {
    currentPosition[axis] = newValue;
    renderBoard();
  }
}

// 1-> Create Board inner cells
function renderEmptyBoard() {
  const board = document.getElementById("board");
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
renderEmptyBoard();

// 2-> Create a random Piece
function randomPiece() {
  const pieces = Object.keys(TETROMINOES);
  const randomIndex = Math.floor(Math.random() * pieces.length);
  const randomKey = pieces[randomIndex];
  const piece = TETROMINOES[randomKey];
  return piece;
}
randomPiece();

let boardState = Array.from({ length: 20 }, () =>
  Array.from({ length: 10 }, () => ({
    value: 0,
    color: null,
  }))
);

let currentPosition = { x: 3, y: 0 };
let currentPiece = randomPiece();
startAutoFall();

function renderBoard() {
  const board = document.getElementById("board");
  board.innerHTML = "";

  Array.from({ length: 20 }).forEach((_, row) => {
    Array.from({ length: 10 }).forEach((_, column) => {
      let paintThisCell = false;
      let color = "";

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
renderBoard();

// AutoFall Function
function startAutoFall() {
  const fallLoop = setInterval(() => {
    const newY = currentPosition.y + 1;
    const outOfBoard = calculatePieceOutOfBoundsY(currentPiece.shape, newY, 20);

    if (outOfBoard) {
      pieceBlocked = true;
      clearInterval(fallLoop);
      return;
    }

    currentPosition.y = newY;
    renderBoard();
  }, 1000);
}

// User Movement
function userMovement() {
  window.addEventListener("keydown", (value) => {
    if (pieceBlocked) return;
    switch (value.key) {
      case "ArrowLeft":
        const newXLeft = currentPosition.x - 1;

        const outOfBoardLeft = calculatePieceOutOfBoundsX(
          currentPiece.shape,
          newXLeft,
          10
        );

        movePieceIfValid("x", newXLeft, outOfBoardLeft);
        break;

      case "ArrowRight":
        const newXRight = currentPosition.x + 1;
        const outOfBoardRight = calculatePieceOutOfBoundsX(
          currentPiece.shape,
          newXRight,
          10
        );

        movePieceIfValid("x", newXRight, outOfBoardRight);
        break;

      case "ArrowDown":
        const newY = currentPosition.y + 1;
        const outOfBoardDown = calculatePieceOutOfBoundsY(
          currentPiece.shape,
          newY,
          20
        );

        movePieceIfValid("y", newY, outOfBoardDown);
        break;
    }
  });
}
userMovement();
