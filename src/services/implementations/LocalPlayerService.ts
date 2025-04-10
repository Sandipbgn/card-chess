import { PlayerColor, GameState, Card } from "@/types/game";
import {
  IPlayerService,
  PlayerState,
  PlayerStats,
} from "../interfaces/IPlayerService";
import { gameEvents } from "@/events/gameEvents";

export class LocalPlayerService implements IPlayerService {
  private players: Record<PlayerColor, PlayerState>;
  private currentPlayer: PlayerColor = "white";
  private callbacks = {
    turnChange: new Set<(player: PlayerColor) => void>(),
    checkState: new Set<(player: PlayerColor, isInCheck: boolean) => void>(),
    handUpdate: new Set<(player: PlayerColor, hand: Card[]) => void>(),
  };

  constructor() {
    this.players = {
      white: this.initializePlayer("white"),
      black: this.initializePlayer("black"),
    };
  }

  initializePlayer(color: PlayerColor): PlayerState {
    return {
      color,
      currentHand: [],
      isInCheck: false,
      redraws: 0,
      stats: {
        gamesPlayed: 0,
        gamesWon: 0,
        totalMoves: 0,
        checksGiven: 0,
        checkmatesAchieved: 0,
      },
    };
  }

  getCurrentPlayer(): PlayerColor {
    return this.currentPlayer;
  }

  getPlayerState(color: PlayerColor): PlayerState {
    return { ...this.players[color] };
  }

  addCardToHand(card: Card, color: PlayerColor): boolean {
    const maxCards = color === "black" ? 4 : 3;
    if (this.players[color].currentHand.length >= maxCards) {
      return false;
    }

    this.players[color].currentHand.push(card);
    this.notifyHandUpdate(color);
    return true;
  }

  removeCardFromHand(card: Card, color: PlayerColor): boolean {
    const hand = this.players[color].currentHand;
    const index = hand.indexOf(card);
    if (index === -1) return false;

    hand.splice(index, 1);
    this.notifyHandUpdate(color);
    return true;
  }

  getHand(color: PlayerColor): Card[] {
    return [...this.players[color].currentHand];
  }

  setPlayerInCheck(color: PlayerColor, isInCheck: boolean): void {
    this.players[color].isInCheck = isInCheck;
    this.callbacks.checkState.forEach((cb) => cb(color, isInCheck));
  }

  incrementRedraws(color: PlayerColor): boolean {
    if (this.players[color].redraws >= 5) return false;
    this.players[color].redraws++;
    return true;
  }

  canRedraw(color: PlayerColor): boolean {
    return this.players[color].redraws < 5 && this.players[color].isInCheck;
  }

  updateStats(color: PlayerColor, gameState: GameState): void {
    const stats = this.players[color].stats;
    const isWinner =
      gameState.status === "checkmate" && gameState.turn !== color;

    if (gameState.status === "checkmate" || gameState.status === "draw") {
      stats.gamesPlayed++;
      if (isWinner) stats.gamesWon++;
    }

    const lastMove = gameState.moveHistory[gameState.moveHistory.length - 1];
    if (lastMove?.player === color) {
      stats.totalMoves++;
    }

    if (gameState.status === "check" && lastMove?.player === color) {
      stats.checksGiven++;
    }

    if (gameState.status === "checkmate" && isWinner) {
      stats.checkmatesAchieved++;
    }
  }

  getPlayerStats(color: PlayerColor): PlayerStats {
    return { ...this.players[color].stats };
  }

  resetStats(color: PlayerColor): void {
    this.players[color].stats = {
      gamesPlayed: 0,
      gamesWon: 0,
      totalMoves: 0,
      checksGiven: 0,
      checkmatesAchieved: 0,
    };
  }

  onTurnChange(callback: (player: PlayerColor) => void): void {
    this.callbacks.turnChange.add(callback);
  }

  onCheckState(
    callback: (player: PlayerColor, isInCheck: boolean) => void
  ): void {
    this.callbacks.checkState.add(callback);
  }

  onHandUpdate(callback: (player: PlayerColor, hand: Card[]) => void): void {
    this.callbacks.handUpdate.add(callback);
  }

  private notifyHandUpdate(color: PlayerColor): void {
    const hand = this.getHand(color);
    this.callbacks.handUpdate.forEach((cb) => cb(color, hand));
  }
}
