import { TETROMINOES } from "./utils/tetrominoes";
import "/style.css";

// Global Initial States
let boardState = Array.from({ length: 20 }, () =>
  Array.from({ length: 10 }, () => ({
    value: 0,
    color: null,
  }))
);
let currentPosition = { x: 3, y: 0 };
let pieceBlocked = false;
let currentPiece = randomPiece();
startAutoFall();

// Generates and renders the empty board at the start of the game
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

// Renders the entire board and the current falling piece
function renderBoard() {
  const board = document.getElementById("board");
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

// Returns a random piece from the TETROMINOES list
function randomPiece() {
  const pieces = Object.keys(TETROMINOES);
  const randomIndex = Math.floor(Math.random() * pieces.length);
  const randomKey = pieces[randomIndex];
  const piece = TETROMINOES[randomKey];
  return piece;
}

// Automatically moves the piece down every second
function startAutoFall() {
  const fallLoop = setInterval(() => {
    const newY = currentPosition.y + 1;

    const collisionWithBoard = checkCollisionWithBoard(currentPiece.shape, {
      x: currentPosition.x,
      y: newY,
    });

    const outAutoFall = calculatePieceOutOfBounds(
      currentPiece.shape,
      newY,
      20,
      "y"
    );

    if (outAutoFall || collisionWithBoard) {
      pieceBlocked = true;
      clearInterval(fallLoop);
      fixPieceOnBoard();

      currentPiece = randomPiece();
      currentPosition = { x: 3, y: 0 };
      pieceBlocked = false;
      renderBoard();
      startAutoFall();

      return;
    }

    currentPosition.y = newY;
    renderBoard();
  }, 1000);
}

// Handles player input to move the piece left, right, or down
function userMovement() {
  window.addEventListener("keydown", (value) => {
    if (pieceBlocked) return;
    switch (value.key) {
      case "ArrowLeft":
        const newXLeft = currentPosition.x - 1;

        const outLeft = calculatePieceOutOfBounds(
          currentPiece.shape,
          newXLeft,
          10,
          "x"
        );

        const collisionLeft = collisionAxis(newXLeft, currentPosition.y);

        movePieceIfValid("x", newXLeft, outLeft, collisionLeft);
        break;

      case "ArrowRight":
        const newXRight = currentPosition.x + 1;

        const outRight = calculatePieceOutOfBounds(
          currentPiece.shape,
          newXRight,
          10,
          "x"
        );

        const collisionRight = collisionAxis(newXRight, currentPosition.y);
        movePieceIfValid("x", newXRight, outRight, collisionRight);

        break;

      case "ArrowDown":
        const newY = currentPosition.y + 1;
        const outDown = calculatePieceOutOfBounds(
          currentPiece.shape,
          newY,
          20,
          "y"
        );

        const collisionDown = collisionAxis(currentPosition.x, newY);
        movePieceIfValid("y", newY, outDown, collisionDown);

        break;

      case "ArrowUp":
        const rotatedShape = rotateMatrix(currentPiece.shape);
        const outOfBoundsX = calculatePieceOutOfBounds(
          rotatedShape,
          currentPosition.x,
          10,
          "x"
        );
        const outOfBoundsY = calculatePieceOutOfBounds(
          rotatedShape,
          currentPosition.y,
          20,
          "y"
        );

        const collision = checkCollisionWithBoard(rotatedShape, {
          x: currentPosition.x,
          y: currentPosition.y,
        });

        if (!outOfBoundsX && !outOfBoundsY && !collision) {
          currentPiece.shape = rotatedShape;
          renderBoard();
        }

        break;
    }
  });
}
userMovement();

// Moves the piece if it’s within bounds and updates the board
function movePieceIfValid(axis, newValue, isOutOfBounds, isCollision) {
  if (!isOutOfBounds && !isCollision) {
    currentPosition[axis] = newValue;
    renderBoard();
  }
}

// Rotates Pieces Clockwise
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

//Fixes pieces to the board once they get to the end of the board
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

// Prevents collisions to the board axis walls
function collisionAxis(xAxis, yAxis) {
  const collision = checkCollisionWithBoard(currentPiece.shape, {
    x: xAxis,
    y: yAxis,
  });
  return collision;
}
renderBoard();

// Check collitions
function checkCollisionWithBoard(pieceShape, position) {
  let collision = false;

  pieceShape.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      if (cell === 1) {
        const y = position.y + rowIndex;
        const x = position.x + columnIndex;

        if (
          y >= 0 &&
          y < 20 &&
          x >= 0 &&
          x < 10 &&
          boardState[y][x].value === 1
        ) {
          collision = true;
        }
      }
    });
  });

  return collision;
}

// Checks if the piece goes out of bounds (horizontal or vertical)
function calculatePieceOutOfBounds(pieceShape, newCoord, boardLimit, axis) {
  let outOfBounds = false;

  pieceShape.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell === 1) {
        const globalCoord =
          axis === "x" ? newCoord + colIndex : newCoord + rowIndex;

        if (globalCoord < 0 || globalCoord >= boardLimit) {
          outOfBounds = true;
        }
      }
    });
  });

  return outOfBounds;
}
