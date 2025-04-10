import { Chess, type Square } from "chess.js";
import {
  GameState,
  Move,
  Card,
  PlayerColor,
  GameStatus,
  CardValue,
  CardSuit,
} from "../types/game";

export interface IGameService {
  initGame(): GameState;
  makeMove(
    from: Square,
    to: Square,
    card: Card,
    player: PlayerColor
  ): GameState;
  drawCard(): Card | null;
  isValidMove(from: Square, to: Square, card: Card): boolean;
  getCurrentState(): GameState;
}

export class LocalGameService implements IGameService {
  private game: Chess;
  private gameState: GameState;
  private deck: Card[];
  private readonly suits: CardSuit[] = [
    "Hearts",
    "Diamonds",
    "Clubs",
    "Spades",
  ];
  private readonly values: CardValue[] = [
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
  ];

  constructor() {
    this.game = new Chess();
    this.deck = this.createDeck();
    this.gameState = this.createInitialState();
  }

  private createInitialState(): GameState {
    return {
      fen: this.game.fen(),
      turn: "white",
      status: "active",
      moveHistory: [],
      usedCards: [],
      currentCard: null,
    };
  }

  private createDeck(): Card[] {
    const deck: Card[] = [];
    this.suits.forEach((suit) => {
      this.values.forEach((value) => {
        deck.push(`${value} of ${suit}` as Card);
      });
    });
    return this.shuffleDeck(deck);
  }

  private shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private getPieceFromCard(card: Card) {
    const value = card.split(" ")[0];
    switch (value) {
      case "2":
        return { piece: "P", file: "a" };
      case "3":
        return { piece: "P", file: "b" };
      case "4":
        return { piece: "P", file: "c" };
      case "5":
        return { piece: "P", file: "d" };
      case "6":
        return { piece: "P", file: "e" };
      case "7":
        return { piece: "P", file: "f" };
      case "8":
        return { piece: "P", file: "g" };
      case "9":
        return { piece: "P", file: "h" };
      case "10":
        return { piece: "N" };
      case "J":
        return { piece: "B" };
      case "Q":
        return { piece: "Q" };
      case "K":
        return { piece: "K" };
      case "A":
        return { piece: "R" };
      default:
        return null;
    }
  }

  initGame(): GameState {
    this.game = new Chess();
    this.deck = this.createDeck();
    this.gameState = this.createInitialState();
    return this.gameState;
  }

  makeMove(
    from: Square,
    to: Square,
    card: Card,
    player: PlayerColor
  ): GameState {
    const pieceInfo = this.getPieceFromCard(card);
    if (!pieceInfo) return this.gameState;

    try {
      const chessMove = this.game.move({
        from,
        to,
        promotion: "q",
      });

      if (chessMove) {
        const move: Move = {
          from,
          to,
          piece: pieceInfo.piece,
          card,
          player,
        };

        this.gameState = {
          ...this.gameState,
          fen: this.game.fen(),
          turn: this.game.turn() === "w" ? "white" : "black",
          status: this.getGameStatus(),
          moveHistory: [...this.gameState.moveHistory, move],
          usedCards: [...this.gameState.usedCards, card],
          currentCard: null,
        };
      }
    } catch (error) {
      console.error("Invalid move:", error);
    }

    return this.gameState;
  }

  drawCard(): Card | null {
    if (this.deck.length === 0) {
      if (this.gameState.usedCards.length > 0) {
        this.deck = this.shuffleDeck([...this.gameState.usedCards]);
        this.gameState.usedCards = [];
      } else {
        return null;
      }
    }

    const card = this.deck.pop() || null;
    this.gameState.currentCard = card;
    return card;
  }

  isValidMove(from: Square, to: Square, card: Card): boolean {
    const pieceInfo = this.getPieceFromCard(card);
    if (!pieceInfo) return false;

    try {
      const piece = this.game.get(from);
      if (!piece) return false;

      if (piece.type.toUpperCase() !== pieceInfo.piece) return false;
      if (pieceInfo.piece === "P" && from[0] !== pieceInfo.file) return false;

      const legalMoves = this.game.moves({
        square: from,
        verbose: true,
      });

      return legalMoves.some((m) => m.to === to);
    } catch (error) {
      console.error("Move validation error:", error);
      return false;
    }
  }

  getCurrentState(): GameState {
    return this.gameState;
  }

  private getGameStatus(): GameStatus {
    if (this.game.isCheckmate()) return "checkmate";
    if (this.game.isCheck()) return "check";
    if (this.game.isDraw()) return "draw";
    return "active";
  }
}
