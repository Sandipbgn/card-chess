import { GameState, Move, Card, PlayerColor } from "@/types/game";
import { Square } from "chess.js";

export type GameEventType =
  | "move"
  | "cardDraw"
  | "check"
  | "checkmate"
  | "draw"
  | "gameEnd"
  | "turnChange"
  | "stateChange"
  | "redraw"
  | "error";

export interface GameEventMap {
  move: {
    from: Square;
    to: Square;
    piece: string;
    card: Card;
    player: PlayerColor;
  };
  cardDraw: {
    card: Card;
    player: PlayerColor;
  };
  check: {
    player: PlayerColor;
    canRedraw: boolean;
    remainingRedraws: number;
  };
  checkmate: {
    winner: PlayerColor;
    loser: PlayerColor;
  };
  draw: {
    reason: "stalemate" | "insufficient" | "threefold" | "fifty-move";
  };
  gameEnd: {
    result: PlayerColor | "draw";
    reason: string;
  };
  turnChange: {
    player: PlayerColor;
    canDraw: boolean;
  };
  stateChange: {
    newState: GameState;
    previousState: GameState;
  };
  redraw: {
    player: PlayerColor;
    remainingRedraws: number;
    card: Card;
  };
  error: {
    code: string;
    message: string;
    data?: any;
  };
}

type EventCallback<T> = (data: T) => void | Promise<void>;

export class GameEventEmitter {
  private listeners: Map<GameEventType, EventCallback<any>[]> = new Map();

  on<T extends GameEventType>(
    event: T,
    callback: EventCallback<GameEventMap[T]>
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off<T extends GameEventType>(
    event: T,
    callback: EventCallback<GameEventMap[T]>
  ): void {
    const callbacks = this.listeners.get(event) ?? [];
    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  }

  async emit<T extends GameEventType>(
    event: T,
    data: GameEventMap[T]
  ): Promise<void> {
    const callbacks = this.listeners.get(event) ?? [];
    await Promise.all(callbacks.map((callback) => callback(data)));
  }

  removeAllListeners(): void {
    this.listeners.clear();
  }
}

export const gameEvents = new GameEventEmitter();
