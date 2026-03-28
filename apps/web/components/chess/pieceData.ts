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
    name: "Piyon",
    nickname: "Piyade Askeri",
    symbol: "♟",
    emoji: "⚔️",
    color: "#64748b",
    gradient: "linear-gradient(135deg, #94a3b8, #64748b)",
    description: "Piyonlar en küçük taşlardır ama birlikte güçlü bir ordu oluştururlar! Her oyuncu 8 piyonla başlar.",
    facts: [
      "8 piyonla başlarsın — diğer taşlardan daha fazla!",
      "Piyonlar arkalarındaki güçlü taşları korur",
      "Bir piyon karşı tarafa ulaşırsa Vezir olur! 👑",
    ],
    funFact: "🌟 Karşı uca ulaşan bir piyon istediği herhangi bir taşa dönüşebilir!",
    startSquares: [
      { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 },
      { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 }, { x: 7, y: 6 },
    ],
  },
  rook: {
    name: "Kale",
    nickname: "Kule Savaşçısı",
    symbol: "♜",
    emoji: "🏰",
    color: "#0369a1",
    gradient: "linear-gradient(135deg, #38bdf8, #0369a1)",
    description: "Kale bir kule gibi görünür ve düz çizgilerde hareket eder — ileri, geri ve yana!",
    facts: [
      "Kaleler düz çizgide istediği kadar kare hareket eder",
      "2 kaleyle başlarsın — her köşede bir tane",
      "İki kale birlikte çok güçlüdür!",
    ],
    funFact: "🏰 Kaleler Şah ile 'Rok' adında özel bir hamle yapabilir!",
    startSquares: [{ x: 0, y: 7 }, { x: 7, y: 7 }],
  },
  knight: {
    name: "At",
    nickname: "Atlı Savaşçı",
    symbol: "♞",
    emoji: "🐴",
    color: "#15803d",
    gradient: "linear-gradient(135deg, #4ade80, #15803d)",
    description: "At, diğer taşların üzerinden ZIPLAYABİLEN tek taştır! L şeklinde hareket eder.",
    facts: [
      "At L şeklinde hareket eder: 2 kare + 1 yana",
      "Atlar yoldaki her taşın üzerinden atlayabilir",
      "2 atle başlarsın — her yanda bir tane",
    ],
    funFact: "🐴 At en kurnaz taştır — her şeyin üzerinden atlayabilir!",
    startSquares: [{ x: 1, y: 7 }, { x: 6, y: 7 }],
  },
  bishop: {
    name: "Fil",
    nickname: "Çapraz Hareket Eden",
    symbol: "♝",
    emoji: "⛪",
    color: "#b45309",
    gradient: "linear-gradient(135deg, #fbbf24, #b45309)",
    description: "Fil her zaman çapraz hareket eder — ve oyun boyunca kendi renginde kalır!",
    facts: [
      "Filler çapraz olarak istediği kadar kare hareket eder",
      "Bir fil açık karelerde, diğeri koyu karelerde kalır",
      "2 fille başlarsın — her renk için bir tane",
    ],
    funFact: "🌈 Her fil oyun boyunca kendi renginde KALIR!",
    startSquares: [{ x: 2, y: 7 }, { x: 5, y: 7 }],
  },
  queen: {
    name: "Vezir",
    nickname: "En Güçlü Taş",
    symbol: "♛",
    emoji: "👑",
    color: "#7c3aed",
    gradient: "linear-gradient(135deg, #c084fc, #7c3aed)",
    description: "Vezir tahtadaki en güçlü taştır! HER yönde hareket edebilir.",
    facts: [
      "Vezir her yönde istediği kadar kare hareket edebilir",
      "Kale VE Filin hareketlerini birleştirir",
      "Vezirini kaybetmek çok tehlikelidir — onu koru!",
    ],
    funFact: "👑 Vezir o kadar güçlüdür ki, onu kaybetmek oyunu kaybettirebilir!",
    startSquares: [{ x: 3, y: 7 }],
  },
  king: {
    name: "Şah",
    nickname: "En Önemli Taş",
    symbol: "♚",
    emoji: "🤴",
    color: "#be185d",
    gradient: "linear-gradient(135deg, #f472b6, #be185d)",
    description: "Şah en önemli taştır! Şah ele geçirilirse oyun biter.",
    facts: [
      "Şah her yönde 1 kare hareket edebilir",
      "Şahını her ne pahasına olursa olsun korumalısın!",
      "Şah tehlikedeyken buna 'Şah' denir ♟",
    ],
    funFact: "🤴 Satrancın amacı rakibin Şahını köşeye sıkıştırmaktır — buna 'Mat' denir!",
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
      { from: { x: 2, y: 4 }, to: { x: 2, y: 3 }, label: "1 kare ileri git" },
      { from: { x: 2, y: 4 }, to: { x: 2, y: 2 }, label: "İlk hamlede 2 kare gidebilirsin!" },
    ],
    ruleTitle: "Piyon sadece İLERİ gider",
    rules: ["1 kare ileri hareket et", "İlk hamlede 2 kare gidebilirsin!", "Çapraz olarak taş yer"],
    specialNote: "⭐ Karşı uca ulaşırsan Vezir olursun!",
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
      { from: { x: 2, y: 2 }, to: { x: 5, y: 2 }, label: "Sağa kaydır" },
      { from: { x: 5, y: 2 }, to: { x: 5, y: 0 }, label: "Yukarı kaydır" },
      { from: { x: 5, y: 0 }, to: { x: 2, y: 0 }, label: "Sola kaydır" },
      { from: { x: 2, y: 0 }, to: { x: 2, y: 2 }, label: "Aşağı kaydır" },
    ],
    ruleTitle: "Kale düz çizgilerde hareket eder",
    rules: ["İstediğin kadar kare hareket et", "Sadece ileri, geri veya yana", "Taşların üzerinden atlayamaz"],
    specialNote: "🏰 İki kale birlikte satırları ve sütunları kontrol eder!",
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
      { from: { x: 2, y: 3 }, to: { x: 4, y: 2 }, label: "2 sağ + 1 yukarı (L şekli!)" },
      { from: { x: 4, y: 2 }, to: { x: 3, y: 4 }, label: "1 sol + 2 aşağı" },
      { from: { x: 3, y: 4 }, to: { x: 1, y: 3 }, label: "2 sol + 1 yukarı" },
      { from: { x: 1, y: 3 }, to: { x: 2, y: 1 }, label: "1 sağ + 2 yukarı" },
    ],
    ruleTitle: "At L şeklinde hareket eder",
    rules: ["Bir yönde 2 kare git", "Sonra yana 1 kare — L şekli oluşturur!", "Diğer taşların üzerinden atlayabilir!"],
    specialNote: "🐴 Diğer taşların üzerinden atlayabilen tek taş!",
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
      { from: { x: 2, y: 3 }, to: { x: 4, y: 1 }, label: "Çapraz sağ-yukarı kaydır" },
      { from: { x: 4, y: 1 }, to: { x: 1, y: 4 }, label: "Çapraz sol-aşağı kaydır" },
      { from: { x: 1, y: 4 }, to: { x: 4, y: 1 }, label: "Tekrar sağ-yukarı" },
      { from: { x: 4, y: 1 }, to: { x: 2, y: 3 }, label: "Eve dön" },
    ],
    ruleTitle: "Fil çapraz hareket eder",
    rules: ["Çapraz olarak istediğin kadar kare git", "Oyun boyunca aynı renkte kalır", "Düz hareket edemez"],
    specialNote: "🌈 İki filin farklı renkli kareleri var!",
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
      { from: { x: 2, y: 3 }, to: { x: 5, y: 3 }, label: "Kale gibi sağa kaydır" },
      { from: { x: 5, y: 3 }, to: { x: 2, y: 0 }, label: "Fil gibi çapraz kaydır" },
      { from: { x: 2, y: 0 }, to: { x: 2, y: 5 }, label: "Kale gibi aşağı kaydır" },
      { from: { x: 2, y: 5 }, to: { x: 2, y: 3 }, label: "Eve dön" },
    ],
    ruleTitle: "Vezir HER yönde hareket eder",
    rules: ["İstediğin kadar kare hareket et", "Her yön: düz VEYA çapraz", "Kale + Fil birleşimi!"],
    specialNote: "👑 Vezir tahtadaki EN GÜÇLÜ taştır!",
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
      { from: { x: 3, y: 3 }, to: { x: 4, y: 3 }, label: "Sağa 1 adım" },
      { from: { x: 4, y: 3 }, to: { x: 4, y: 2 }, label: "Yukarı 1 adım" },
      { from: { x: 4, y: 2 }, to: { x: 3, y: 2 }, label: "Sola 1 adım" },
      { from: { x: 3, y: 2 }, to: { x: 3, y: 3 }, label: "Geri 1 adım" },
    ],
    ruleTitle: "Şah her seferinde 1 adım atar",
    rules: ["Her yönde tam 1 kare hareket et", "ASLA tehlikeye girme", "En önemli taş!"],
    specialNote: "🤴 Şahın sıkışması Mat demektir — oyun biter!",
  },
};
