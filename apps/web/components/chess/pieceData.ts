export type PieceName = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";

export interface PieceInfo {
  name: string;
  nickname: string;
  symbol: string;
  emoji: string;
  color: string;
  gradient: string;
  description: string;
  facts: string[];
  funFact: string;
  /** Starting squares on the board (white side, 0-indexed, y=0 top) */
  startSquares: Array<{ x: number; y: number }>;
}

export const PIECE_DATA: Record<PieceName, PieceInfo> = {
  pawn: {
    name: "Pawn",
    nickname: "The Foot Soldier",
    symbol: "♟",
    emoji: "⚔️",
    color: "#64748b",
    gradient: "linear-gradient(135deg, #94a3b8, #64748b)",
    description: "Pawns are the smallest pieces, but together they form a powerful army! Every player starts with 8 pawns.",
    facts: [
      "You start with 8 pawns — more than any other piece!",
      "Pawns protect the powerful pieces behind them",
      "If a pawn reaches the other end, it becomes a Queen! 👑",
    ],
    funFact: "🌟 A pawn that reaches the far end can transform into any piece!",
    startSquares: [
      { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 },
      { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 }, { x: 7, y: 6 },
    ],
  },
  rook: {
    name: "Rook",
    nickname: "The Castle Tower",
    symbol: "♜",
    emoji: "🏰",
    color: "#0369a1",
    gradient: "linear-gradient(135deg, #38bdf8, #0369a1)",
    description: "The rook looks like a castle tower and moves in straight lines — forwards, backwards, and sideways!",
    facts: [
      "Rooks move any number of squares in a straight line",
      "You start with 2 rooks — one on each corner",
      "Two rooks working together are very powerful!",
    ],
    funFact: "🏰 Rooks can do a special move called 'castling' with the King!",
    startSquares: [{ x: 0, y: 7 }, { x: 7, y: 7 }],
  },
  knight: {
    name: "Knight",
    nickname: "The Horse",
    symbol: "♞",
    emoji: "🐴",
    color: "#15803d",
    gradient: "linear-gradient(135deg, #4ade80, #15803d)",
    description: "The knight is the only piece that can JUMP over other pieces! It moves in an L-shape.",
    facts: [
      "Knights jump in an L-shape: 2 squares + 1 to the side",
      "Knights can jump over any piece in the way",
      "You start with 2 knights — one on each side",
    ],
    funFact: "🐴 The Knight is the trickiest piece — it jumps over everything!",
    startSquares: [{ x: 1, y: 7 }, { x: 6, y: 7 }],
  },
  bishop: {
    name: "Bishop",
    nickname: "The Diagonal Mover",
    symbol: "♝",
    emoji: "⛪",
    color: "#b45309",
    gradient: "linear-gradient(135deg, #fbbf24, #b45309)",
    description: "The bishop always moves diagonally — and it stays on its color for the whole game!",
    facts: [
      "Bishops move diagonally any number of squares",
      "One bishop stays on light squares, one on dark squares",
      "You start with 2 bishops — one for each color",
    ],
    funFact: "🌈 Each bishop stays on its own color FOREVER during the game!",
    startSquares: [{ x: 2, y: 7 }, { x: 5, y: 7 }],
  },
  queen: {
    name: "Queen",
    nickname: "The Most Powerful",
    symbol: "♛",
    emoji: "👑",
    color: "#7c3aed",
    gradient: "linear-gradient(135deg, #c084fc, #7c3aed)",
    description: "The Queen is the most powerful piece on the board! She can move in ANY direction.",
    facts: [
      "The Queen can move any number of squares in any direction",
      "She combines the moves of a Rook AND a Bishop",
      "Losing your Queen is very dangerous — protect her!",
    ],
    funFact: "👑 The Queen is so powerful, losing her can lose you the whole game!",
    startSquares: [{ x: 3, y: 7 }],
  },
  king: {
    name: "King",
    nickname: "The Most Important",
    symbol: "♚",
    emoji: "🤴",
    color: "#be185d",
    gradient: "linear-gradient(135deg, #f472b6, #be185d)",
    description: "The King is the most important piece! If the King is captured, the game is over.",
    facts: [
      "The King can move one square in any direction",
      "You must protect your King at all costs!",
      "When the King is in danger it's called 'Check' ♟",
    ],
    funFact: "🤴 The goal of chess is to trap the enemy King — that's 'Checkmate'!",
    startSquares: [{ x: 4, y: 7 }],
  },
};

// ── Move data for Level 2 ──────────────────────────────────────────────────────

export interface MoveStep {
  from: { x: number; y: number };
  to: { x: number; y: number };
  label: string;
}

export interface MoveInfo {
  piece: PieceName;
  boardSize: number;
  startPos: { x: number; y: number };
  validSquares: Array<{ x: number; y: number }>;
  steps: MoveStep[];
  ruleTitle: string;
  rules: string[];
  specialNote?: string;
}

export const MOVE_DATA: Record<PieceName, MoveInfo> = {
  pawn: {
    piece: "pawn",
    boardSize: 6,
    startPos: { x: 2, y: 4 },
    validSquares: [{ x: 2, y: 3 }, { x: 2, y: 2 }],
    steps: [
      { from: { x: 2, y: 4 }, to: { x: 2, y: 3 }, label: "Move forward 1 square" },
      { from: { x: 2, y: 4 }, to: { x: 2, y: 2 }, label: "First move: can go 2 squares!" },
    ],
    ruleTitle: "Pawn moves FORWARD only",
    rules: ["Move 1 square forward", "On first move: can go 2 squares!", "Captures diagonally"],
    specialNote: "⭐ Reach the other end to become a Queen!",
  },
  rook: {
    piece: "rook",
    boardSize: 6,
    startPos: { x: 2, y: 2 },
    validSquares: [
      { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 },
      { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 3 }, { x: 2, y: 4 }, { x: 2, y: 5 },
    ],
    steps: [
      { from: { x: 2, y: 2 }, to: { x: 5, y: 2 }, label: "Slide right" },
      { from: { x: 5, y: 2 }, to: { x: 5, y: 0 }, label: "Slide up" },
      { from: { x: 5, y: 0 }, to: { x: 2, y: 0 }, label: "Slide left" },
      { from: { x: 2, y: 0 }, to: { x: 2, y: 2 }, label: "Slide down back" },
    ],
    ruleTitle: "Rook moves in straight lines",
    rules: ["Move any number of squares", "Only forward, backward, or sideways", "Cannot jump over pieces"],
    specialNote: "🏰 Two rooks together control entire rows and columns!",
  },
  knight: {
    piece: "knight",
    boardSize: 6,
    startPos: { x: 2, y: 3 },
    validSquares: [
      { x: 0, y: 2 }, { x: 4, y: 2 },
      { x: 0, y: 4 }, { x: 4, y: 4 },
      { x: 1, y: 1 }, { x: 3, y: 1 },
      { x: 1, y: 5 }, { x: 3, y: 5 },
    ],
    steps: [
      { from: { x: 2, y: 3 }, to: { x: 4, y: 2 }, label: "2 right + 1 up (L-shape!)" },
      { from: { x: 4, y: 2 }, to: { x: 3, y: 4 }, label: "1 left + 2 down" },
      { from: { x: 3, y: 4 }, to: { x: 1, y: 3 }, label: "2 left + 1 up" },
      { from: { x: 1, y: 3 }, to: { x: 2, y: 1 }, label: "1 right + 2 up" },
    ],
    ruleTitle: "Knight moves in an L-shape",
    rules: ["Move 2 squares in one direction", "Then 1 square sideways — makes an L!", "CAN jump over other pieces!"],
    specialNote: "🐴 The only piece that can jump over others!",
  },
  bishop: {
    piece: "bishop",
    boardSize: 6,
    startPos: { x: 2, y: 3 },
    validSquares: [
      { x: 0, y: 1 }, { x: 1, y: 2 }, { x: 3, y: 4 }, { x: 4, y: 5 },
      { x: 0, y: 5 }, { x: 1, y: 4 }, { x: 3, y: 2 }, { x: 4, y: 1 }, { x: 5, y: 0 },
    ],
    steps: [
      { from: { x: 2, y: 3 }, to: { x: 4, y: 1 }, label: "Slide diagonally up-right" },
      { from: { x: 4, y: 1 }, to: { x: 1, y: 4 }, label: "Slide diagonally down-left" },
      { from: { x: 1, y: 4 }, to: { x: 4, y: 1 }, label: "Back up-right" },
      { from: { x: 4, y: 1 }, to: { x: 2, y: 3 }, label: "Return home" },
    ],
    ruleTitle: "Bishop moves diagonally",
    rules: ["Move any number of squares diagonally", "Stays on the same color forever", "Cannot move straight"],
    specialNote: "🌈 Your two bishops cover different colored squares!",
  },
  queen: {
    piece: "queen",
    boardSize: 6,
    startPos: { x: 2, y: 3 },
    validSquares: [
      { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 },
      { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 4 }, { x: 2, y: 5 },
      { x: 0, y: 1 }, { x: 1, y: 2 }, { x: 3, y: 4 }, { x: 4, y: 5 },
      { x: 0, y: 5 }, { x: 1, y: 4 }, { x: 3, y: 2 }, { x: 4, y: 1 }, { x: 5, y: 0 },
    ],
    steps: [
      { from: { x: 2, y: 3 }, to: { x: 5, y: 3 }, label: "Slide right like a Rook" },
      { from: { x: 5, y: 3 }, to: { x: 2, y: 0 }, label: "Slide diagonal like a Bishop" },
      { from: { x: 2, y: 0 }, to: { x: 2, y: 5 }, label: "Slide down like a Rook" },
      { from: { x: 2, y: 5 }, to: { x: 2, y: 3 }, label: "Return home" },
    ],
    ruleTitle: "Queen moves in ANY direction",
    rules: ["Move any number of squares", "Any direction: straight OR diagonal", "Rook + Bishop combined!"],
    specialNote: "👑 The Queen is the MOST powerful piece on the board!",
  },
  king: {
    piece: "king",
    boardSize: 6,
    startPos: { x: 3, y: 3 },
    validSquares: [
      { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 },
      { x: 2, y: 3 }, { x: 4, y: 3 },
      { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 },
    ],
    steps: [
      { from: { x: 3, y: 3 }, to: { x: 4, y: 3 }, label: "Step right" },
      { from: { x: 4, y: 3 }, to: { x: 4, y: 2 }, label: "Step up" },
      { from: { x: 4, y: 2 }, to: { x: 3, y: 2 }, label: "Step left" },
      { from: { x: 3, y: 2 }, to: { x: 3, y: 3 }, label: "Step back" },
    ],
    ruleTitle: "King moves ONE step at a time",
    rules: ["Move exactly 1 square in any direction", "Must NEVER move into danger", "The most important piece!"],
    specialNote: "🤴 If your King is trapped, it's Checkmate — game over!",
  },
};
