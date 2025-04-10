import { Square } from "chess.js";
import { Card, GameState, PlayerColor, GameStatus } from "@/types/game";

export interface MoveResult {
  success: boolean;
  message?: string;
  newState?: GameState;
}

export interface GameRules {
  maxRedraws: number;
  autoPromoteTo: "q" | "r" | "b" | "n";
}

export interface IGameService {
  // Game state management
  initGame(config?: Partial<GameRules>): GameState;
  getCurrentState(): GameState;

  // Move validation and execution
  isValidMove(from: Square, to: Square, card: Card): boolean;
  makeMove(
    from: Square,
    to: Square,
    card: Card,
    player: PlayerColor
  ): MoveResult;

  // Game state checks
  isCheck(): boolean;
  isCheckmate(): boolean;
  isDraw(): boolean;
  getGameStatus(): GameStatus;

  // Special moves
  castle(side: "kingside" | "queenside", player: PlayerColor): MoveResult;
  undoLastMove(): boolean;

  // Check handling
  getRemainingRedraws(): number;
  canRedraw(): boolean;

  // Event subscribers
  onStateChange(callback: (state: GameState) => void): void;
  onGameEnd(callback: (winner: PlayerColor | "draw") => void): void;

  updateCurrentCard(card: Card): GameState;
}
