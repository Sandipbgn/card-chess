import { GameState, Move, Card, PlayerColor } from "./game";

// Socket event payload types
export interface SocketEventPayloads {
  "game:start": { gameId: string };
  "game:move": Move;
  "game:state": GameState;
  "game:draw": { player: PlayerColor; card: Card };
  "game:end": { winner: PlayerColor | "draw" };
}

// Socket event types
export type SocketEventType = keyof SocketEventPayloads;

// Socket service interface
export interface IGameSocket {
  connect(): Promise<void>;
  disconnect(): void;
  emit<T extends SocketEventType>(event: T, data: SocketEventPayloads[T]): void;
  on<T extends SocketEventType>(
    event: T,
    callback: (data: SocketEventPayloads[T]) => void
  ): void;
  off<T extends SocketEventType>(event: T): void;
}
