export type PieceType = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";
export type Pos = { x: number; y: number };

export function inBounds(x: number, y: number, size: number) {
  return x >= 0 && x < size && y >= 0 && y < size;
}

export function posKey(p: Pos) {
  return `${p.x},${p.y}`;
}

/** All squares this piece can move to (ignoring other pieces except blockers array) */
export function getValidMoves(
  piece: PieceType,
  pos: Pos,
  boardSize: number,
  blockers: Pos[] = [],
  opponentSquares: Pos[] = [],
): Pos[] {
  const moves: Pos[] = [];
  const blockerSet = new Set(blockers.map(posKey));
  const opponentSet = new Set(opponentSquares.map(posKey));

  const slide = (dx: number, dy: number) => {
    for (let d = 1; d < boardSize; d++) {
      const nx = pos.x + dx * d, ny = pos.y + dy * d;
      if (!inBounds(nx, ny, boardSize)) break;
      if (blockerSet.has(posKey({ x: nx, y: ny }))) break;
      moves.push({ x: nx, y: ny });
      if (opponentSet.has(posKey({ x: nx, y: ny }))) break;
    }
  };

  switch (piece) {
    case "pawn":
      // Move forward
      if (inBounds(pos.x, pos.y - 1, boardSize) && !blockerSet.has(posKey({ x: pos.x, y: pos.y - 1 })) && !opponentSet.has(posKey({ x: pos.x, y: pos.y - 1 })))
        moves.push({ x: pos.x, y: pos.y - 1 });
      // First move: 2 squares
      if (pos.y === boardSize - 2 && !blockerSet.has(posKey({ x: pos.x, y: pos.y - 1 })) && !opponentSet.has(posKey({ x: pos.x, y: pos.y - 1 })) && !blockerSet.has(posKey({ x: pos.x, y: pos.y - 2 })))
        moves.push({ x: pos.x, y: pos.y - 2 });
      // Captures diagonally
      for (const dx of [-1, 1]) {
        const nx = pos.x + dx, ny = pos.y - 1;
        if (inBounds(nx, ny, boardSize) && opponentSet.has(posKey({ x: nx, y: ny })))
          moves.push({ x: nx, y: ny });
      }
      break;
    case "rook":
      slide(1, 0); slide(-1, 0); slide(0, 1); slide(0, -1);
      break;
    case "knight":
      for (const [dx, dy] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
        const nx = pos.x + dx!, ny = pos.y + dy!;
        if (inBounds(nx, ny, boardSize) && !blockerSet.has(posKey({ x: nx, y: ny })))
          moves.push({ x: nx, y: ny });
      }
      break;
    case "bishop":
      slide(1, 1); slide(1, -1); slide(-1, 1); slide(-1, -1);
      break;
    case "queen":
      slide(1, 0); slide(-1, 0); slide(0, 1); slide(0, -1);
      slide(1, 1); slide(1, -1); slide(-1, 1); slide(-1, -1);
      break;
    case "king":
      for (const [dx, dy] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
        const nx = pos.x + dx!, ny = pos.y + dy!;
        if (inBounds(nx, ny, boardSize) && !blockerSet.has(posKey({ x: nx, y: ny })))
          moves.push({ x: nx, y: ny });
      }
      break;
  }
  return moves;
}

/** Squares this piece attacks (for check detection) */
export function getAttackedSquares(piece: PieceType, pos: Pos, boardSize: number): Pos[] {
  if (piece === "pawn") {
    return ([-1, 1] as number[])
      .map((dx) => ({ x: pos.x + dx, y: pos.y - 1 }))
      .filter((p) => inBounds(p.x, p.y, boardSize));
  }
  return getValidMoves(piece, pos, boardSize);
}
