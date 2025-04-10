"use client";
import { useState, useCallback, useEffect, useMemo } from "react";
import { Chess, Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useGame } from "@/contexts/GameContext";
import useSound from "use-sound";

interface ChessBoardProps {
  boardOrientation?: 'white' | 'black';
}

export const ChessBoard: React.FC<ChessBoardProps> = ({ 
  boardOrientation = 'white' 
}) => {
  const { currentCard, makeMove, gameState } = useGame();
  const [game, setGame] = useState(new Chess());
  const [highlightedSquares, setHighlightedSquares] = useState<Square[]>([]);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [playMoveSound] = useSound("/sounds/move.mp3", { volume: 0.5 });
  const [validPieces, setValidPieces] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{from: Square, to: Square} | null>(null);
  
  // Update game state when FEN changes
  useEffect(() => {
    if (gameState && gameState.fen) {
      const newGame = new Chess(gameState.fen);
      setGame(newGame);
      
      // Update last move from move history
      const moveHistory = gameState.moveHistory;
      if (moveHistory.length > 0) {
        const move = moveHistory[moveHistory.length - 1];
        setLastMove({
          from: move.from as Square,
          to: move.to as Square
        });
      }
      
      // Clear selections on state change
      setSelectedSquare(null);
      setHighlightedSquares([]);
      
      // Check for pieces that match the current card
      if (currentCard) {
        highlightValidPieces(newGame, currentCard);
      } else {
        setValidPieces([]);
      }
    }
  }, [gameState.fen, currentCard]);
  
  // Highlight pieces that match the current card when card changes
  useEffect(() => {
    if (currentCard) {
      highlightValidPieces(game, currentCard);
    } else {
      setValidPieces([]);
    }
  }, [currentCard, game]);
  
  // Get piece type and file from card value
  const getPieceFromCard = useCallback((card: string | null) => {
    if (!card) return null;
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
  }, []);
  
  // Find all valid pieces on board that match the current card
  const highlightValidPieces = (chessGame: Chess, card: string) => {
    const cardInfo = getPieceFromCard(card);
    if (!cardInfo) return;
    
    const validSquares: Square[] = [];
    const currentTurn = chessGame.turn() === 'w' ? 'white' : 'black';
    
    // Loop through all squares on the board
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const file = String.fromCharCode(97 + i); // 'a' to 'h'
        const rank = j + 1; // 1 to 8
        const square = `${file}${rank}` as Square;
        
        const piece = chessGame.get(square);
        if (!piece) continue;
        
        // Check if piece color matches current turn
        const pieceColor = piece.color === 'w' ? 'white' : 'black';
        if (pieceColor !== currentTurn) continue;
        
        // Check if piece type matches the card
        if (piece.type.toUpperCase() !== cardInfo.piece) continue;
        
        // For pawns, check if the file matches the card
        if (cardInfo.piece === 'P' && cardInfo.file && square[0] !== cardInfo.file) continue;
        
        // If all checks pass, this is a valid piece
        validSquares.push(square);
      }
    }
    
    setValidPieces(validSquares);
  };

  const handleSquareClick = useCallback((square: Square) => {
    if (!currentCard) {
      // Visual feedback for missing card
      setHighlightedSquares([]);
      setSelectedSquare(null);
      return;
    }

    // If a square is already selected, try to make a move
    if (selectedSquare) {
      // If clicked on the same square, deselect it
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setHighlightedSquares([]);
        return;
      }

      // If clicked on a highlighted square, make the move
      if (highlightedSquares.includes(square)) {
        makeMove(selectedSquare, square).then(success => {
          if (success) {
            playMoveSound();
          }
        });
      }
      
      // Clear selection regardless of move success
      setSelectedSquare(null);
      setHighlightedSquares([]);
      return;
    }
    
    // First click - check if the piece matches the card
    const piece = game.get(square);
    if (!piece) return;
    
    const cardInfo = getPieceFromCard(currentCard);
    if (!cardInfo) return;
    
    // Check if piece type matches the card
    if (piece.type.toUpperCase() !== cardInfo.piece) {
      return;
    }
    
    // For pawns, check if the file matches the card
    if (cardInfo.piece === 'P' && cardInfo.file && square[0] !== cardInfo.file) {
      return;
    }
    
    // Get valid moves for the selected piece
    const legalMoves = game.moves({
      square,
      verbose: true
    });
    
    // Highlight possible moves
    setSelectedSquare(square);
    setHighlightedSquares(legalMoves.map(m => m.to as Square));
    
  }, [currentCard, selectedSquare, highlightedSquares, game, makeMove, getPieceFromCard, playMoveSound]);

  const onDrop = (sourceSquare: Square, targetSquare: Square, piece: string): boolean => {
    if (!currentCard) {
      return false;
    }

    const cardInfo = getPieceFromCard(currentCard);
    if (!cardInfo) return false;

    const chessPiece = game.get(sourceSquare);
    if (!chessPiece) return false;

    // Check if piece type matches the card
    if (chessPiece.type.toUpperCase() !== cardInfo.piece) {
      return false;
    }

    // For pawns, check if the file matches the card
    if (cardInfo.piece === 'P' && cardInfo.file && sourceSquare[0] !== cardInfo.file) {
      return false;
    }

    // Try to make the move
    makeMove(sourceSquare, targetSquare).then(success => {
      if (success) {
        playMoveSound();
      }
    });
    
    // Always return false to let our state management handle the move
    return false;
  };

  // Compute square styles based on current state
  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    
    // Style for valid pieces that match the current card
    validPieces.forEach(square => {
      styles[square] = {
        boxShadow: 'inset 0 0 0 3px rgba(50, 255, 50, 0.4)',
        background: 'radial-gradient(circle at center, rgba(50, 255, 50, 0.2) 0%, rgba(50, 255, 50, 0.05) 70%)',
        borderRadius: '50%'
      };
    });
    
    // Style for highlighted legal move squares
    highlightedSquares.forEach(square => {
      const isPotentialCapture = game.get(square) !== null; 
      
      if (isPotentialCapture) {
        styles[square] = {
          boxShadow: 'inset 0 0 0 3px rgba(255, 50, 50, 0.7)',
          background: 'radial-gradient(circle at center, rgba(255, 50, 50, 0.4) 0%, rgba(255, 50, 50, 0.1) 70%)',
        };
      } else {
        styles[square] = {
          background: 'radial-gradient(circle at center, rgba(255, 255, 50, 0.4) 0%, rgba(255, 255, 50, 0.1) 70%)',
        };
      }
    });
    
    // Style for selected square
    if (selectedSquare) {
      styles[selectedSquare] = {
        boxShadow: 'inset 0 0 0 4px rgba(0, 100, 255, 0.8)',
        background: 'rgba(0, 100, 255, 0.2)'
      };
    }
    
    // Style for the last move
    if (lastMove) {
      styles[lastMove.from] = {
        ...styles[lastMove.from],
        background: 'rgba(255, 170, 0, 0.2)'
      };
      
      styles[lastMove.to] = {
        ...styles[lastMove.to],
        background: 'rgba(255, 170, 0, 0.3)'
      };
    }
    
    // If game is in check, highlight the king
    if (gameState.status === 'check') {
      // Find the king of current player
      const currentColor = gameState.turn;
      const kingColor = currentColor === 'white' ? 'w' : 'b';
      
      // Find king position
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          const file = String.fromCharCode(97 + i); // 'a' to 'h'
          const rank = j + 1; // 1 to 8
          const square = `${file}${rank}` as Square;
          
          const piece = game.get(square);
          if (piece && piece.type === 'k' && piece.color === kingColor) {
            styles[square] = {
              boxShadow: 'inset 0 0 0 4px rgba(255, 0, 0, 0.8)',
              background: 'radial-gradient(circle at center, rgba(255, 0, 0, 0.4) 0%, rgba(255, 0, 0, 0.2) 70%)'
            };
          }
        }
      }
    }
    
    return styles;
  }, [validPieces, highlightedSquares, selectedSquare, lastMove, game, gameState.status, gameState.turn]);

  // Get card badge text to display on the board
  const getCardBadge = useCallback(() => {
    if (!currentCard) return null;
    
    const [value, , suit] = currentCard.split(" ");
    const isRedSuit = suit === "Hearts" || suit === "Diamonds";
    const suitSymbol = (() => {
      switch (suit) {
        case "Hearts": return "♥";
        case "Diamonds": return "♦";
        case "Clubs": return "♣";
        case "Spades": return "♠";
        default: return "";
      }
    })();
    
    return {
      text: `${value}${suitSymbol}`,
      isRed: isRedSuit
    };
  }, [currentCard]);

  const cardBadge = getCardBadge();

  return (
    <div className="flex flex-col items-center">
      {/* Card badge overlay */}
      {cardBadge && (
        <div className="relative z-10 mb-4 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm shadow-lg">
          <span className={`text-lg font-bold ${cardBadge.isRed ? 'text-red-400' : 'text-blue-300'}`}>
            Current: {cardBadge.text}
          </span>
        </div>
      )}
      
      <div className="w-full max-w-2xl relative">
        <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-lg z-0"></div>
        <div className="relative z-10 rounded-xl overflow-hidden shadow-2xl">
          <Chessboard
            position={gameState.fen}
            onSquareClick={handleSquareClick}
            onPieceDrop={onDrop}
            boardOrientation={boardOrientation}
            customSquareStyles={customSquareStyles}
            areArrowsAllowed={true}
            animationDuration={200}
            boardWidth={undefined}
            customBoardStyle={{
              borderRadius: '0.5rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            customDarkSquareStyle={{ backgroundColor: '#4b5563' }} // gray-600
            customLightSquareStyle={{ backgroundColor: '#9ca3af' }} // gray-400
          />
        </div>
      </div>
      
      {gameState.status === 'checkmate' && (
        <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 text-red-300 font-bold rounded-lg text-center transform animate-pulse">
          Checkmate! {gameState.turn === "white" ? "Black" : "White"} wins!
        </div>
      )}
      
      {gameState.status === 'draw' && (
        <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 text-blue-300 font-bold rounded-lg text-center">
          Game ended in a draw.
        </div>
      )}
      
      {!currentCard && gameState.status === 'active' && (
        <div className="mt-6 p-3 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-center rounded-lg">
          Draw a card to make a move
        </div>
      )}
    </div>
  );
};
