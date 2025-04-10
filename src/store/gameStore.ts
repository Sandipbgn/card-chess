import { GameState, Move, Card, PlayerColor, GameStatus } from "@/types/game";
import { IGameService } from "@/services/interfaces/IGameService";
import { ICardService } from "@/services/interfaces/ICardService";
import { IPlayerService } from "@/services/interfaces/IPlayerService";
import { gameEvents } from "@/events/gameEvents";

export interface GameStoreState {
  game: GameState;
  isLoading: boolean;
  error: string | null;
  lastAction: {
    type: "move" | "draw" | "reset";
    timestamp: number;
    data?: any;
  } | null;
}

export class GameStore {
  private state: GameStoreState;
  private subscribers: Set<(state: GameStoreState) => void>;

  constructor(
    private gameService: IGameService,
    private cardService: ICardService,
    private playerService: IPlayerService
  ) {
    this.state = {
      game: this.gameService.initGame(),
      isLoading: false,
      error: null,
      lastAction: null,
    };
    this.subscribers = new Set();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    gameEvents.on("move", (data) => {
      this.updateState({
        lastAction: {
          type: "move",
          timestamp: Date.now(),
          data,
        },
      });
    });

    gameEvents.on("cardDraw", (data) => {
      this.updateState({
        lastAction: {
          type: "draw",
          timestamp: Date.now(),
          data,
        },
      });
    });

    gameEvents.on("error", (error) => {
      this.updateState({ error: error.message });
    });
  }

  private updateState(partial: Partial<GameStoreState>): void {
    this.state = { ...this.state, ...partial };
    this.notifySubscribers();
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((callback) => callback(this.state));
  }

  // Public API
  subscribe(callback: (state: GameStoreState) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  getState(): GameStoreState {
    return this.state;
  }

  async makeMove(from: string, to: string, card: Card): Promise<boolean> {
    try {
      this.updateState({ isLoading: true, error: null });

      const result = this.gameService.makeMove(
        from as any,
        to as any,
        card,
        this.state.game.turn
      );

      if (!result.success) {
        this.updateState({ error: result.message || "Invalid move" });
        return false;
      }

      if (result.newState) {
        this.updateState({ game: result.newState });
      }

      return true;
    } catch (error) {
      this.updateState({ error: (error as Error).message });
      return false;
    } finally {
      this.updateState({ isLoading: false });
    }
  }

  async drawCard(): Promise<Card | null> {
    try {
      this.updateState({ isLoading: true, error: null });

      const result = this.cardService.drawCard(this.state.game.turn);

      if (!result.success) {
        this.updateState({ error: result.message || "Failed to draw card" });
        return null;
      }

      return result.card || null;
    } catch (error) {
      this.updateState({ error: (error as Error).message });
      return null;
    } finally {
      this.updateState({ isLoading: false });
    }
  }

  resetGame(): void {
    const newGame = this.gameService.initGame();
    this.updateState({
      game: newGame,
      error: null,
      lastAction: {
        type: "reset",
        timestamp: Date.now(),
      },
    });
  }

  // Persistence
  saveState(): void {
    try {
      localStorage.setItem("cardChessGame", JSON.stringify(this.state));
    } catch (error) {
      console.error("Failed to save game state:", error);
    }
  }

  loadState(): boolean {
    try {
      const saved = localStorage.getItem("cardChessGame");
      if (saved) {
        const parsed = JSON.parse(saved);
        this.updateState(parsed);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to load game state:", error);
      return false;
    }
  }
}
