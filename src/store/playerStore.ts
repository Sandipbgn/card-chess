import { PlayerColor, Card } from "@/types/game";
import { PlayerState, PlayerStats } from "@/services/interfaces/IPlayerService";
import { gameEvents } from "@/events/gameEvents";

interface PlayerStoreState {
  players: Record<PlayerColor, PlayerState>;
  currentTurn: PlayerColor;
  isLoading: boolean;
  error: string | null;
}

export class PlayerStore {
  private state: PlayerStoreState;
  private subscribers: Set<(state: PlayerStoreState) => void>;

  constructor() {
    this.state = {
      players: {
        white: this.createInitialPlayerState("white"),
        black: this.createInitialPlayerState("black"),
      },
      currentTurn: "white",
      isLoading: false,
      error: null,
    };
    this.subscribers = new Set();
    this.setupEventListeners();
  }

  private createInitialPlayerState(color: PlayerColor): PlayerState {
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

  private setupEventListeners(): void {
    gameEvents.on("check", ({ player }) => {
      this.updatePlayerState(player, { isInCheck: true });
    });

    gameEvents.on("turnChange", ({ player }) => {
      this.updateState({ currentTurn: player });
    });

    gameEvents.on("cardDraw", ({ player, card }) => {
      const currentHand = [...this.state.players[player].currentHand, card];
      this.updatePlayerState(player, { currentHand });
    });
  }

  private updateState(partial: Partial<PlayerStoreState>): void {
    this.state = { ...this.state, ...partial };
    this.notifySubscribers();
  }

  private updatePlayerState(
    color: PlayerColor,
    update: Partial<PlayerState>
  ): void {
    this.state.players[color] = {
      ...this.state.players[color],
      ...update,
    };
    this.notifySubscribers();
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((callback) => callback(this.state));
  }

  // Public API
  subscribe(callback: (state: PlayerStoreState) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  getState(): PlayerStoreState {
    return this.state;
  }

  getPlayerState(color: PlayerColor): PlayerState {
    return this.state.players[color];
  }

  getCurrentTurn(): PlayerColor {
    return this.state.currentTurn;
  }

  addCardToHand(color: PlayerColor, card: Card): void {
    const currentHand = [...this.state.players[color].currentHand, card];
    this.updatePlayerState(color, { currentHand });
  }

  removeCardFromHand(color: PlayerColor, card: Card): void {
    const currentHand = this.state.players[color].currentHand.filter(
      (c) => c !== card
    );
    this.updatePlayerState(color, { currentHand });
  }

  incrementRedraws(color: PlayerColor): boolean {
    const player = this.state.players[color];
    if (player.redraws >= 5) return false;

    this.updatePlayerState(color, {
      redraws: player.redraws + 1,
    });
    return true;
  }

  updateStats(color: PlayerColor, update: Partial<PlayerStats>): void {
    const currentStats = this.state.players[color].stats;
    this.updatePlayerState(color, {
      stats: { ...currentStats, ...update },
    });
  }

  resetPlayerState(color: PlayerColor): void {
    this.updatePlayerState(color, this.createInitialPlayerState(color));
  }

  resetAllPlayers(): void {
    this.updateState({
      players: {
        white: this.createInitialPlayerState("white"),
        black: this.createInitialPlayerState("black"),
      },
      currentTurn: "white",
    });
  }
}
