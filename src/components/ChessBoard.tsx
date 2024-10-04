"use client";

import { useState, useEffect } from "react";
import { Chess, Move, Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import useSound from "use-sound";

interface ChessboardProps {
  drawnCard: string | null;
}

const ChessboardComponent: React.FC<ChessboardProps> = ({ drawnCard }) => {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [highlightedSquares, setHighlightedSquares] = useState<Square[]>([]);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [turn, setTurn] = useState("white"); // To track current turn

  // Sound effect hooks (move sound)
  const [playMoveSound] = useSound("/sounds/move.mp3"); // Add move sound

  // Load game from local storage (state persistence)
  useEffect(() => {
    const savedGame = localStorage.getItem("chessGame");
    if (savedGame) {
      setGame(new Chess(savedGame));
    }
  }, []);

  // Save game state to local storage after every move
  useEffect(() => {
    localStorage.setItem("chessGame", game.fen());
  }, [game]);

  // Map card to specific pieces
  const getPieceFromCard = (card: string | null) => {
    if (!card) return null;
    const value = card.split(" ")[0];
    switch (value) {
      case "2":
        return { piece: "P", file: "a" }; // Pawn on A file
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
        return { piece: "N" }; // Knight
      case "J":
        return { piece: "B" }; // Bishop
      case "Q":
        return { piece: "Q" }; // Queen
      case "K":
        return { piece: "K" }; // King
      case "A":
        return { piece: "R" }; // Rook
      default:
        return null;
    }
  };

  // Get all legal moves for the selected square
  const getLegalMoves = (square: Square) => {
    return game.moves({ square, verbose: true }).map((move: Move) => move.to);
  };

  // Handle square click (for click-to-move)
  const handleSquareClick = (square: Square) => {
    const drawnInfo = getPieceFromCard(drawnCard);
    if (!drawnInfo) {
      alert("Please draw a card first.");
      return;
    }

    const pieceAtSquare = game.get(square)?.type;
    const squareFile = square.charAt(0);

    if (
      pieceAtSquare?.toUpperCase() === drawnInfo.piece &&
      (drawnInfo.piece !== "P" || drawnInfo.file === squareFile)
    ) {
      setSelectedSquare(square);
      const legalMoves = getLegalMoves(square);
      setHighlightedSquares(legalMoves);
    } else {
      alert("You can only move the piece corresponding to the drawn card!");
      setSelectedSquare(null);
      setHighlightedSquares([]);
    }
  };

  // Handle move when clicked (click-to-move)
  const handleMove = (targetSquare: Square) => {
    if (selectedSquare && highlightedSquares.includes(targetSquare)) {
      const move = game.move({
        from: selectedSquare,
        to: targetSquare,
        promotion: "q", // Auto-promote pawns
      });

      if (move === null) {
        alert("Invalid move!");
      } else {
        playMoveSound(); // Play move sound
        setGame(new Chess(game.fen()));
        setSelectedSquare(null);
        setHighlightedSquares([]);
        setMoveHistory([...moveHistory, move]); // Add move to history
        setTurn(game.turn() === "w" ? "white" : "black"); // Update turn
      }
    }
  };

  // Handle undo move
  const undoMove = () => {
    if (moveHistory.length === 0) return; // Prevent undoing if no history
    const previousMove = moveHistory.pop();
    if (previousMove) {
      game.undo(); // Undo the last move on the board
      setGame(new Chess(game.fen())); // Update the game state
      setMoveHistory([...moveHistory]); // Update move history
      setTurn(game.turn() === "w" ? "white" : "black"); // Update turn
    }
  };

  // Drag-and-drop move validation
  const onDrop = (sourceSquare: Square, targetSquare: Square) => {
    const drawnInfo = getPieceFromCard(drawnCard);
    if (!drawnInfo) {
      alert("Please draw a card first.");
      return false;
    }

    const pieceAtSource = game.get(sourceSquare)?.type;
    const sourceFile = sourceSquare.charAt(0);

    // Check if the drawn piece matches the source square
    if (
      pieceAtSource?.toUpperCase() === drawnInfo.piece &&
      (drawnInfo.piece !== "P" || drawnInfo.file === sourceFile)
    ) {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q", // Auto-promote pawns
      });

      if (move === null) {
        alert("Invalid move!");
        return false;
      }

      playMoveSound(); // Play move sound
      setGame(new Chess(game.fen())); // Update game state
      setMoveHistory([...moveHistory, move]); // Add move to history
      setTurn(game.turn() === "w" ? "white" : "black"); // Update turn
      return true;
    } else {
      alert("You can only move the piece corresponding to the drawn card!");
      return false;
    }
  };

  return (
    <div>
      {/* Turn Indicator */}
      <h2>{turn === "white" ? "White's Turn" : "Black's Turn"}</h2>

      <Chessboard
        position={game.fen()}
        onPieceDrop={onDrop} // Drag-and-drop handler
        onSquareClick={(square) =>
          highlightedSquares.length > 0
            ? handleMove(square)
            : handleSquareClick(square)
        } // Click-to-move handler
        customSquareStyles={highlightedSquares.reduce(
          (acc, square) => ({
            ...acc,
            [square]: { backgroundColor: "rgba(0, 255, 0, 0.5)" },
          }),
          {}
        )}
      />

      {/* Display move history */}
      <div className="move-history">
        <h4>Move History</h4>
        <ul>
          {moveHistory.map((move, index) => (
            <li key={index}>
              {move.from} - {move.to}
            </li>
          ))}
        </ul>
      </div>

      {/* Undo Button */}
      <button onClick={undoMove}>Undo Move</button>
    </div>
  );
};

export default ChessboardComponent;
