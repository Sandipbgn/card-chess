// Basic game types
export type PlayerColor = "white" | "black";
export type GameStatus = "active" | "check" | "checkmate" | "draw";

// Card related types
export type CardValue =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K"
  | "A";
export type CardSuit = "Hearts" | "Diamonds" | "Clubs" | "Spades";
export type Card = `${CardValue} of ${CardSuit}`;

// Move interface for tracking game moves
export interface Move {
  from: string;
  to: string;
  piece: string;
  card: Card;
}

// Core game state interface
export interface GameState {
  fen: string;
  turn: PlayerColor;
  status: GameStatus;
  currentCard: Card | null;
  usedCards: Card[];
  moveHistory: Move[];
}

// Game result types
export type GameResult = {
  winner: PlayerColor | "draw";
  reason: string;
};
