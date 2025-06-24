import { TETROMINOES } from "./utils/tetrominoes";

let pieceBlocked = false;

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
    let outOfBoard = false;

    currentPiece.shape.forEach((row, rowIndex) => {
      row.forEach((cell) => {
        if (cell === 1) {
          const yGlobal = currentPosition.y + rowIndex + 1;
          if (yGlobal >= 20) {
            outOfBoard = true;
          }
        }
      });
    });

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
        let outOfBoardLeft = false;

        currentPiece.shape.forEach((row, rowIndex) => {
          row.forEach((cell, columnIndex) => {
            if (cell === 1) {
              const xGlobal = newXLeft + columnIndex;
              if (xGlobal < 0) {
                outOfBoardLeft = true;
              }
            }
          });
        });

        if (!outOfBoardLeft) {
          currentPosition.x = newXLeft;
          renderBoard();
        }
        break;

      case "ArrowRight":
        const newXRight = currentPosition.x + 1;
        let outOfBoardRight = false;

        currentPiece.shape.forEach((row, rowIndex) => {
          row.forEach((cell, columnIndex) => {
            if (cell === 1) {
              const xGlobal = newXRight + columnIndex;
              if (xGlobal >= 10) {
                outOfBoardRight = true;
              }
            }
          });
        });

        if (!outOfBoardRight) {
          currentPosition.x = newXRight;
          renderBoard();
        }
        break;

      case "ArrowDown":
        const newY = currentPosition.y + 1;
        let outOfBoardDown = false;

        currentPiece.shape.forEach((row, rowIndex) => {
          row.forEach((cell) => {
            if (cell === 1) {
              const xGlobal = newY + rowIndex + 1;
              if (xGlobal >= 20) {
                outOfBoardDown = true;
              }
            }
          });
        });

        if (!outOfBoardDown) {
          currentPosition.y = newY;
          renderBoard();
        }
        break;
    }
  });
}
userMovement();
