function calculatePieceOutOfBounds(pieceShape, newX, boardWidth) {
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

function movePieceIfValid(axis, newValue, isOutOfBounds) {
  if (!isOutOfBounds) {
    currentPosition[axis] = newValue;
    renderBoard();
  }
}
