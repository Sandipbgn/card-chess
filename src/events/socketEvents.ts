import { GameState, Move, Card, PlayerColor } from "@/types/game";

export type SocketEventType =
  | "game:join"
  | "game:leave"
  | "game:move"
  | "game:draw"
  | "game:sync"
  | "game:error"
  | "connection:state";

export interface SocketEventMap {
  "game:join": {
    gameId: string;
    player: PlayerColor;
    timestamp: number;
  };
  "game:leave": {
    gameId: string;
    player: PlayerColor;
    reason?: string;
  };
  "game:move": {
    move: Move;
    gameState: GameState;
    timestamp: number;
  };
  "game:draw": {
    player: PlayerColor;
    card: Card;
    timestamp: number;
  };
  "game:sync": {
    gameState: GameState;
    lastAction: {
      type: "move" | "draw";
      data: any;
      timestamp: number;
    };
  };
  "game:error": {
    code: string;
    message: string;
    data?: any;
  };
  "connection:state": {
    connected: boolean;
    lastConnected?: number;
    attempting?: boolean;
  };
}

export interface SocketConfig {
  url: string;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  autoReconnect?: boolean;
}

export class SocketEventManager {
  private socket: WebSocket | null = null;
  private listeners: Map<SocketEventType, Function[]> = new Map();
  private config: SocketConfig;
  private reconnectAttempts = 0;
  private connectionState: SocketEventMap["connection:state"] = {
    connected: false,
  };

  constructor(config: SocketConfig) {
    this.config = {
      reconnectAttempts: 3,
      reconnectDelay: 1000,
      autoReconnect: true,
      ...config,
    };
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.config.url);
        this.setupSocketHandlers(resolve, reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  private setupSocketHandlers(resolve: Function, reject: Function): void {
    if (!this.socket) return;

    this.socket.onopen = () => {
      this.connectionState.connected = true;
      this.connectionState.lastConnected = Date.now();
      this.emit("connection:state", this.connectionState);
      resolve();
    };

    this.socket.onclose = () => {
      this.connectionState.connected = false;
      this.emit("connection:state", this.connectionState);
      this.handleReconnect();
    };

    this.socket.onerror = (error) => {
      this.emit("game:error", {
        code: "SOCKET_ERROR",
        message: "WebSocket connection error",
        data: error,
      });
      reject(error);
    };

    this.socket.onmessage = (event) => {
      try {
        const { type, data } = JSON.parse(event.data);
        this.emit(type as SocketEventType, data);
      } catch (error) {
        this.emit("game:error", {
          code: "MESSAGE_PARSE_ERROR",
          message: "Failed to parse socket message",
          data: error,
        });
      }
    };
  }

  private handleReconnect(): void {
    if (!this.config.autoReconnect) return;
    if (this.reconnectAttempts >= (this.config.reconnectAttempts || 0)) return;

    this.connectionState.attempting = true;
    this.emit("connection:state", this.connectionState);

    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect().catch(() => this.handleReconnect());
    }, this.config.reconnectDelay);
  }

  on<T extends SocketEventType>(
    event: T,
    callback: (data: SocketEventMap[T]) => void
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off<T extends SocketEventType>(
    event: T,
    callback: (data: SocketEventMap[T]) => void
  ): void {
    const callbacks = this.listeners.get(event) || [];
    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  }

  emit<T extends SocketEventType>(event: T, data: SocketEventMap[T]): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach((callback) => callback(data));
  }

  disconnect(): void {
    this.socket?.close();
    this.socket = null;
    this.reconnectAttempts = 0;
    this.connectionState.connected = false;
    this.connectionState.attempting = false;
    this.emit("connection:state", this.connectionState);
  }
}

export const socketEvents = new SocketEventManager({
  url: process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:3001",
});
