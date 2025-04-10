import { GameEvents } from "../types/socket";

export interface IGameSocket {
  connect(): void;
  disconnect(): void;
  emit<T extends keyof GameEvents>(event: T, data: GameEvents[T]): void;
  on<T extends keyof GameEvents>(
    event: T,
    callback: (data: GameEvents[T]) => void
  ): void;
}

// Placeholder for future WebSocket implementation
export class LocalGameSocket implements IGameSocket {
  connect(): void {
    console.log("Connected to WebSocket");
  }

  disconnect(): void {
    console.log("Disconnected from WebSocket");
  }

  emit<T extends keyof GameEvents>(event: T, data: GameEvents[T]): void {
    console.log(`Emitted event: ${event}`, data);
  }

  on<T extends keyof GameEvents>(
    event: T,
    callback: (data: GameEvents[T]) => void
  ): void {
    console.log(`Listening for event: ${event}`);
  }
}
