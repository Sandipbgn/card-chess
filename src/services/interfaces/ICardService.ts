import { Card } from "@/types/game";

export interface DrawResult {
  success: boolean;
  card?: Card;
  message?: string;
}

export interface DeckState {
  remainingCards: Card[];
  usedCards: Card[];
}

export interface ICardService {
  initializeDeck(): DeckState;
  shuffleDeck(): void; // No parameters
  resetDeck(): void;
  drawCard(): DrawResult;
  discardCard(card: Card): boolean;
  getRemainingCards(): number;
  getUsedCards(): Card[];
  getDeckState(): DeckState;
}
