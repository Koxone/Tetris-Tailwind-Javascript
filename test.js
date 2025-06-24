case "ArrowLeft":
        const newXLeft = currentPosition.x - 1;

        const outLeft = calculatePieceOutOfBounds(
          currentPiece.shape,
          newXLeft,
          10,
          "x"
        );

        const collisionLeft = checkCollisionWithBoard(currentPiece.shape, {
          x: newXLeft,
          y: currentPosition.y,
        });

        if (!outLeft && !collisionLeft) {
          currentPosition.x = newXLeft;
          renderBoard();
        }
        break;


function collisionAxis(xAxis, yAxis) {
  const collision = checkCollisionWithBoard(currentPiece.shape, {
    x: xAxis,
    y: yAxis,
  });
  retu
}

function movePieceIfValid(axis, newValue, isOutOfBounds) {
  if (!isOutOfBounds && !collisionAxis) {
    currentPosition[axis] = newValue;
    renderBoard();
  }
}
