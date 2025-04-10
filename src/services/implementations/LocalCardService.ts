import { Card } from "@/types/game";
import {
  ICardService,
  DrawResult,
  DeckState,
} from "@/services/interfaces/ICardService";

export class LocalCardService implements ICardService {
  private deck: Card[];
  private usedCards: Card[];
  private readonly suits = ["Hearts", "Diamonds", "Clubs", "Spades"] as const;
  private readonly values = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
    "A",
  ] as const;

  constructor() {
    const initialState = this.initializeDeck();
    this.deck = initialState.remainingCards;
    this.usedCards = initialState.usedCards;
  }

  initializeDeck(): DeckState {
    return {
      remainingCards: this.shuffle(this.createFullDeck()),
      usedCards: [],
    };
  }

  private createFullDeck(): Card[] {
    const deck: Card[] = [];
    this.suits.forEach((suit) => {
      this.values.forEach((value) => {
        deck.push(`${value} of ${suit}` as Card);
      });
    });
    return deck;
  }

  // Private method for internal shuffling with parameter
  private shuffle(cards: Card[]): Card[] {
    const deck = [...cards];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }
  
  // Public method that matches interface (no parameters)
  shuffleDeck(): void {
    this.deck = this.shuffle(this.deck);
  }

  drawCard(): DrawResult {
    if (this.deck.length === 0) {
      if (this.usedCards.length === 0) {
        return {
          success: false,
          message: "No cards remaining",
        };
      }
      this.deck = this.shuffle(this.usedCards);
      this.usedCards = [];
    }

    const card = this.deck.pop();
    if (!card) {
      return {
        success: false,
        message: "Failed to draw card",
      };
    }

    return {
      success: true,
      card,
    };
  }

  discardCard(card: Card): boolean {
    this.usedCards.push(card);
    return true;
  }

  resetDeck(): void {
    const initialState = this.initializeDeck();
    this.deck = initialState.remainingCards;
    this.usedCards = initialState.usedCards;
  }

  getRemainingCards(): number {
    return this.deck.length;
  }

  getUsedCards(): Card[] {
    return [...this.usedCards];
  }

  getDeckState(): DeckState {
    return {
      remainingCards: [...this.deck],
      usedCards: [...this.usedCards],
    };
  }
}
