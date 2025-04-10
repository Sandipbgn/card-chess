import { PlayerColor, GameState, Card } from "@/types/game";

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  totalMoves: number;
  checksGiven: number;
  checkmatesAchieved: number;
}

export interface PlayerState {
  color: PlayerColor;
  currentHand: Card[];
  isInCheck: boolean;
  redraws: number;
  stats: PlayerStats;
}

export interface IPlayerService {
  // Player state management
  initializePlayer(color: PlayerColor): PlayerState;
  getCurrentPlayer(): PlayerColor;
  getPlayerState(color: PlayerColor): PlayerState;

  // Hand management
  addCardToHand(card: Card, color: PlayerColor): boolean;
  removeCardFromHand(card: Card, color: PlayerColor): boolean;
  getHand(color: PlayerColor): Card[];

  // Check handling
  setPlayerInCheck(color: PlayerColor, isInCheck: boolean): void;
  incrementRedraws(color: PlayerColor): boolean;
  canRedraw(color: PlayerColor): boolean;

  // Statistics
  updateStats(color: PlayerColor, gameState: GameState): void;
  getPlayerStats(color: PlayerColor): PlayerStats;
  resetStats(color: PlayerColor): void;

  // Event handlers
  onTurnChange(callback: (player: PlayerColor) => void): void;
  onCheckState(
    callback: (player: PlayerColor, isInCheck: boolean) => void
  ): void;
  onHandUpdate(callback: (player: PlayerColor, hand: Card[]) => void): void;
}
