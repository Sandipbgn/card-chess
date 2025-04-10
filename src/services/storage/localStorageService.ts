import { GameState } from "@/types/game";

interface StorageKeys {
  GAME_STATE: "cardChess_gameState";
  PLAYER_STATS: "cardChess_playerStats";
  SETTINGS: "cardChess_settings";
  LAST_SESSION: "cardChess_lastSession";
}

const STORAGE_KEYS: StorageKeys = {
  GAME_STATE: "cardChess_gameState",
  PLAYER_STATS: "cardChess_playerStats",
  SETTINGS: "cardChess_settings",
  LAST_SESSION: "cardChess_lastSession",
};

export interface StorageData {
  gameState: GameState;
  timestamp: number;
  version: string;
}

export class LocalStorageService {
  private readonly VERSION = "1.0.0";

  constructor(private prefix: string = "cardChess_") {}

  saveGameState(state: GameState): boolean {
    try {
      const data: StorageData = {
        gameState: state,
        timestamp: Date.now(),
        version: this.VERSION,
      };

      localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("Failed to save game state:", error);
      return false;
    }
  }

  loadGameState(): GameState | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
      if (!saved) return null;

      const data: StorageData = JSON.parse(saved);

      // Version check for future compatibility
      if (data.version !== this.VERSION) {
        console.warn("Saved game state version mismatch");
        return null;
      }

      return data.gameState;
    } catch (error) {
      console.error("Failed to load game state:", error);
      return null;
    }
  }

  saveSettings<T>(settings: T): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error("Failed to save settings:", error);
      return false;
    }
  }

  loadSettings<T>(): T | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Failed to load settings:", error);
      return null;
    }
  }

  clearGameState(): void {
    localStorage.removeItem(STORAGE_KEYS.GAME_STATE);
  }

  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }

  hasStoredGame(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.GAME_STATE);
  }

  updateLastSession(): void {
    localStorage.setItem(
      STORAGE_KEYS.LAST_SESSION,
      JSON.stringify({ timestamp: Date.now() })
    );
  }

  getLastSession(): Date | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LAST_SESSION);
      if (!saved) return null;

      const { timestamp } = JSON.parse(saved);
      return new Date(timestamp);
    } catch {
      return null;
    }
  }
}
