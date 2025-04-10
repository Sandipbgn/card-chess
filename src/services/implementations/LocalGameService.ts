import { Chess, Square } from "chess.js";
import { Card, GameState, PlayerColor, GameStatus, Move } from "@/types/game";
import { IGameService, MoveResult, GameRules } from "@/services/interfaces/IGameService";

export class LocalGameService implements IGameService {
  private game: Chess;
  private state: GameState;
  private rules: GameRules = {
    maxRedraws: 3,
    autoPromoteTo: "q"
  };
  private stateChangeCallbacks: ((state: GameState) => void)[] = [];
  private gameEndCallbacks: ((winner: PlayerColor | "draw") => void)[] = [];
  private redraws = 0;

  constructor() {
    this.game = new Chess();
    this.state = this.createInitialState();
  }

  private createInitialState(): GameState {
    return {
      fen: this.game.fen(),
      turn: "white",
      status: "active",
      currentCard: null,
      usedCards: [],
      moveHistory: [],
    };
  }

  initGame(config?: Partial<GameRules>): GameState {
    if (config) {
      this.rules = { ...this.rules, ...config };
    }
    this.game = new Chess();
    this.state = this.createInitialState();
    this.redraws = 0;
    return this.state;
  }

  getCurrentState(): GameState {
    return this.state;
  }

  isValidMove(from: Square, to: Square, card: Card): boolean {
    try {
      // Check if the move is valid according to chess rules
      const moves = this.game.moves({ 
        square: from, 
        verbose: true 
      });
      
      const isValidChessMove = moves.some(m => m.to === to);
      if (!isValidChessMove) return false;
      
      // Check if the piece matches the card
      const piece = this.game.get(from);
      if (!piece) return false;
      
      const cardInfo = this.getPieceFromCard(card);
      if (!cardInfo) return false;
      
      // Check piece type
      if (piece.type.toUpperCase() !== cardInfo.piece) return false;
      
      // Special check for pawns (must be on the correct file)
      if (cardInfo.piece === 'P' && cardInfo.file && from[0] !== cardInfo.file) return false;
      
      return true;
    } catch (error) {
      console.error('Move validation error:', error);
      return false;
    }
  }
  
  private getPieceFromCard(card: Card) {
    const value = card.split(" ")[0];
    switch (value) {
      case "2": return { piece: "P", file: "a" };
      case "3": return { piece: "P", file: "b" };
      case "4": return { piece: "P", file: "c" };
      case "5": return { piece: "P", file: "d" };
      case "6": return { piece: "P", file: "e" };
      case "7": return { piece: "P", file: "f" };
      case "8": return { piece: "P", file: "g" };
      case "9": return { piece: "P", file: "h" };
      case "10": return { piece: "N" };
      case "J": return { piece: "B" };
      case "Q": return { piece: "Q" };
      case "K": return { piece: "K" };
      case "A": return { piece: "R" };
      default: return null;
    }
  }

  makeMove(
    from: Square,
    to: Square,
    card: Card,
    player: PlayerColor
  ): MoveResult {
    // First check if the move is valid according to our card rules
    if (!this.isValidMove(from, to, card)) {
      return {
        success: false,
        message: "Invalid move for the drawn card",
      };
    }

    try {
      const move = this.game.move({
        from,
        to,
        promotion: this.rules.autoPromoteTo,
      });

      if (!move) {
        return {
          success: false,
          message: "Invalid move",
        };
      }

      const newMove: Move = {
        from,
        to,
        piece: move.piece,
        card,
      };

      this.state = {
        ...this.state,
        fen: this.game.fen(),
        turn: this.game.turn() === "w" ? "white" : "black",
        status: this.getGameStatus(),
        moveHistory: [...this.state.moveHistory, newMove],
        usedCards: [...this.state.usedCards, card],
        currentCard: null,
      };
      
      // Notify subscribers of state change
      this.notifyStateChange();
      
      // Check if the game has ended
      const status = this.getGameStatus();
      if (status !== 'active') {
        let winner: PlayerColor | 'draw';
        
        if (status === 'checkmate') {
          // If it's checkmate, the winner is the opposite of current turn
          winner = this.state.turn === 'white' ? 'black' : 'white';
        } else {
          winner = 'draw';
        }
        
        this.notifyGameEnd(winner);
      }

      return {
        success: true,
        newState: this.state,
      };
    } catch (error) {
      return {
        success: false,
        message: "Move error",
      };
    }
  }

  isCheck(): boolean {
    return this.game.isCheck();
  }

  isCheckmate(): boolean {
    return this.game.isCheckmate();
  }

  isDraw(): boolean {
    return this.game.isDraw();
  }

  getGameStatus(): GameStatus {
    if (this.game.isCheckmate()) return "checkmate";
    if (this.game.isCheck()) return "check";
    if (this.game.isDraw()) return "draw";
    return "active";
  }

  castle(side: "kingside" | "queenside", player: PlayerColor): MoveResult {
    try {
      const move = this.game.move(side === "kingside" ? "O-O" : "O-O-O");
      if (move) {
        this.state = {
          ...this.state,
          fen: this.game.fen(),
          turn: this.game.turn() === "w" ? "white" : "black",
          status: this.getGameStatus(),
        };
        
        // Notify subscribers
        this.notifyStateChange();
        
        return { success: true, newState: this.state };
      }
      return { success: false, message: "Invalid castling move" };
    } catch (error) {
      return { success: false, message: "Castling error" };
    }
  }

  undoLastMove(): boolean {
    try {
      this.game.undo();
      const lastMove =
        this.state.moveHistory[this.state.moveHistory.length - 1];

      this.state = {
        ...this.state,
        fen: this.game.fen(),
        turn: this.game.turn() === "w" ? "white" : "black",
        status: this.getGameStatus(),
        moveHistory: this.state.moveHistory.slice(0, -1),
        usedCards: this.state.usedCards.filter(
          (card) => card !== lastMove?.card
        ),
      };
      
      // Notify subscribers
      this.notifyStateChange();
      
      return true;
    } catch {
      return false;
    }
  }

  updateCurrentCard(card: Card): GameState {
    this.state = {
      ...this.state,
      currentCard: card,
    };
    
    // Notify subscribers
    this.notifyStateChange();
    
    return this.state;
  }

  getRemainingRedraws(): number {
    return this.rules.maxRedraws - this.redraws;
  }

  canRedraw(): boolean {
    return this.redraws < this.rules.maxRedraws;
  }

  onStateChange(callback: (state: GameState) => void): void {
    this.stateChangeCallbacks.push(callback);
  }

  onGameEnd(callback: (winner: PlayerColor | "draw") => void): void {
    this.gameEndCallbacks.push(callback);
  }
  
  private notifyStateChange(): void {
    for (const callback of this.stateChangeCallbacks) {
      callback(this.state);
    }
  }
  
  private notifyGameEnd(winner: PlayerColor | "draw"): void {
    for (const callback of this.gameEndCallbacks) {
      callback(winner);
    }
  }
}
