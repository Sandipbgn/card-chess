"use client"; // Mark as client-side component for Next.js
import { useState, useEffect } from "react";
import { Chess, Move, Square } from "chess.js"; // Chess game logic library
import { Chessboard } from "react-chessboard"; // Chess UI component
import useSound from "use-sound";

// Props interface definition
interface ChessboardProps {
  drawnCard: string | null; // Currently drawn card
  onCardUsed: () => void; // Callback when a card is used
  onTurnChange: (turn: "white" | "black") => void; // Callback for turn changes
}

// Main ChessBoard component
const ChessboardComponent: React.FC<ChessboardProps> = ({
  drawnCard,
  onCardUsed,
  onTurnChange,
}) => {
  // State management using hooks
  const [game, setGame] = useState(new Chess()); // Chess game instance
  const [highlightedSquares, setHighlightedSquares] = useState<Square[]>([]); // Legal moves
  const [moveHistory, setMoveHistory] = useState<Move[]>([]); // Game move history
  const [turn, setTurn] = useState<"white" | "black">("white"); // Current turn
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null); // Selected piece
  const [playMoveSound] = useSound("/sounds/move.mp3"); // Move sound effect

  // Load saved game from localStorage on component mount
  //lateron we have to load from the server
  useEffect(() => {
    const savedGame = localStorage.getItem("chessGame");
    if (savedGame) {
      setGame(new Chess(savedGame));
    }
  }, []);

  // Save game state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("chessGame", game.fen());
  }, [game]);

  // Convert card value to chess piece and file position
  const getPieceFromCard = (card: string | null) => {
    if (!card) return null;
    const value = card.split(" ")[0];
    switch (value) {
      // Map number cards 2-9 to pawns on specific files
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

  // Handle square click event
  const handleSquareClick = (square: Square) => {
    const drawnInfo = getPieceFromCard(drawnCard);
    // Validate card drawn
    if (!drawnInfo) {
      alert("Please draw a card first.");
      return;
    }

    // Validate turn
    if (game.turn() !== turn[0]) {
      alert("Wait for your turn.");
      return;
    }

    const pieceAtSquare = game.get(square)?.type;
    const squareFile = square.charAt(0);

    // Validate piece selection based on drawn card
    if (
      pieceAtSquare?.toUpperCase() === drawnInfo.piece &&
      (drawnInfo.piece !== "P" || drawnInfo.file === squareFile)
    ) {
      setSelectedSquare(square);
      // Get and highlight legal moves
      const legalMoves = game
        .moves({ square, verbose: true })
        .map((move) => move.to);
      setHighlightedSquares(legalMoves);
    } else {
      alert("You can only move the piece corresponding to the drawn card!");
      setSelectedSquare(null);
      setHighlightedSquares([]);
    }
  };
  // Handle piece movement
  const handleMove = (targetSquare: Square) => {
    if (selectedSquare && highlightedSquares.includes(targetSquare)) {
      const move = game.move({
        from: selectedSquare,
        to: targetSquare,
        promotion: "q", // Auto-promote to queen
      });

      if (move === null) {
        alert("Invalid move!");
      } else {
        // Update game state after successful move
        playMoveSound();
        setGame(new Chess(game.fen()));
        setSelectedSquare(null);
        setHighlightedSquares([]);
        setMoveHistory([...moveHistory, move]);
        const newTurn = game.turn() === "w" ? "white" : "black";
        setTurn(newTurn);
        onTurnChange(newTurn);
        onCardUsed();
      }
    }
  };

  // Handle drag and drop movement
  const onDrop = (sourceSquare: Square, targetSquare: Square) => {
    const drawnInfo = getPieceFromCard(drawnCard);
    // Validate card and turn
    if (!drawnInfo) {
      alert("Please draw a card first.");
      return false;
    }

    if (game.turn() !== turn[0]) {
      alert("It's not your turn!");
      return false;
    }

    const pieceAtSource = game.get(sourceSquare)?.type;
    const sourceFile = sourceSquare.charAt(0);

    // Validate piece movement based on drawn card
    if (
      pieceAtSource?.toUpperCase() === drawnInfo.piece &&
      (drawnInfo.piece !== "P" || drawnInfo.file === sourceFile)
    ) {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });

      if (move === null) {
        alert("Invalid move!");
        return false;
      }

      // Update game state after successful move
      playMoveSound();
      setGame(new Chess(game.fen()));
      setMoveHistory([...moveHistory, move]);
      const newTurn = game.turn() === "w" ? "white" : "black";
      setTurn(newTurn);
      onTurnChange(newTurn);
      onCardUsed();
      return true;
    } else {
      alert("You can only move the piece corresponding to the drawn card!");
      return false;
    }
  };

  // Reset game to initial state
  const resetGame = () => {
    setGame(new Chess());
    setMoveHistory([]);
    setHighlightedSquares([]);
    setSelectedSquare(null);
    setTurn("white");
    onTurnChange("white");
    onCardUsed();
  };

  // Render component
  return (
    <div className="flex flex-col items-center">
      {/* Turn indicator */}
      <h2 className="text-xl mb-4">
        {turn === "white" ? "White's Turn" : "Black's Turn"}
      </h2>

      {/* Chess board */}
      <Chessboard
        position={game.fen()} // Current board position
        onPieceDrop={onDrop} // Handle drag-drop moves
        onSquareClick={
          (square) =>
            highlightedSquares.length > 0
              ? handleMove(square) // Execute move if square is highlighted
              : handleSquareClick(square) // Select piece and show moves
        }
        customSquareStyles={highlightedSquares.reduce(
          (acc, square) => ({
            ...acc,
            [square]: { backgroundColor: "rgba(0, 255, 0, 0.5)" }, // Highlight legal moves
          }),
          {}
        )}
      />

      {/* Reset button */}
      <div className="mt-4">
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2"
          onClick={resetGame}
        >
          Reset Game
        </button>
      </div>

      {/* Move history display */}
      <div className="mt-4 p-4 border rounded max-h-40 overflow-y-auto">
        <h4 className="font-bold mb-2">Move History</h4>
        <ul>
          {moveHistory.map((move, index) => (
            <li key={index}>
              {index + 1}. {move.from} → {move.to}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChessboardComponent;
