"use client";

import { useState } from "react";
import { Chess, Square } from "chess.js";
import { Chessboard } from "react-chessboard";

interface ChessboardProps {
  drawnCard: string | null;
}

const ChessboardComponent: React.FC<ChessboardProps> = ({ drawnCard }) => {
  const [game, setGame] = useState(new Chess());

  const getPieceFromCard = (card: string | null) => {
    if (!card) return null; // If there's no card, return null
    const value = card.split(" ")[0]; // Get the card value since we don't care about the suit
    switch (value) {
      case "2":
        return "P"; // Pawn
      case "3":
        return "P";
      case "4":
        return "P";
      case "5":
        return "P";
      case "6":
        return "P";
      case "7":
        return "P";
      case "8":
        return "P";
      case "9":
        return "P";
      case "10":
        return "N"; // Knight
      case "J":
        return "B"; // Bishop
      case "Q":
        return "Q"; // Queen
      case "K":
        return "K"; // King
      case "A":
        return "R"; // Rook
      default:
        return null;
    }
  };

  const onDrop = (sourceSquare: Square, targetSquare: Square) => {
    const drawnPiece = getPieceFromCard(drawnCard); // Get the piece based on drawn card
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      //TODO : In future we should add promotion by user selection
      promotion: "q", // Automatically promote to a queen
    });

    //check if card is actually drawn
    if (!drawnPiece) {
      alert("Please draw a card first.");
      return false;
    } else if (move === null) {
      alert("Invalid move! Please try again.");
      return false;
    } else if (drawnPiece !== move.piece.toUpperCase()) {
      alert(
        "Invalid move! You must move the piece corresponding to the drawn card."
      );
      return false;
    }

    setGame(new Chess(game.fen()));
    return true;
  };

  return (
    <div>
      <Chessboard position={game.fen()} onPieceDrop={onDrop} />
    </div>
  );
};

export default ChessboardComponent;
