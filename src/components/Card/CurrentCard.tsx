import React, { useState } from "react";
import { Card } from "@/types/game";
import { useGame } from "@/contexts/GameContext";

interface CurrentCardProps {
  isDisabled?: boolean;
}

export const CurrentCard: React.FC<CurrentCardProps> = ({ 
  isDisabled = false 
}) => {
  const { currentCard, drawCard, gameState } = useGame();
  const [isLoading, setIsLoading] = useState(false);

  const handleDrawCard = async () => {
    setIsLoading(true);
    try {
      await drawCard();
    } finally {
      setIsLoading(false);
    }
  };

  // Get chess piece symbol based on card value
  const getChessPieceSymbol = (value: string): string => {
    switch (value) {
      case "2": 
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9": return "♙"; // Pawn
      case "10": return "♘"; // Knight
      case "J": return "♗"; // Bishop
      case "Q": return "♕"; // Queen
      case "K": return "♔"; // King
      case "A": return "♖"; // Rook
      default: return "";
    }
  };

  // Get suit symbol based on suit
  const getSuitSymbol = (suit: string): string => {
    switch (suit) {
      case "Hearts": return "♥";
      case "Diamonds": return "♦";
      case "Clubs": return "♣";
      case "Spades": return "♠";
      default: return "";
    }
  };

  const renderCard = (card: Card) => {
    const [value, , suit] = card.split(" ");
    const isRedSuit = suit === "Hearts" || suit === "Diamonds";
    const suitSymbol = getSuitSymbol(suit);
    const chessPieceSymbol = getChessPieceSymbol(value);
    
    return (
      <div className="flex flex-col items-center perspective-1000">
        <div className="card-container relative w-64 h-96 transition-transform duration-700 transform hover:scale-105">
          <div className={`
            absolute inset-0 rounded-xl shadow-xl border-8 border-white
            bg-gradient-to-br ${isRedSuit ? 'from-rose-50 to-rose-100' : 'from-slate-50 to-slate-100'}
            flex flex-col items-center justify-between p-4
          `}>
            {/* Card corners */}
            <div className="absolute top-2 left-2 flex flex-col items-center">
              <span className={`text-2xl font-bold ${isRedSuit ? 'text-red-600' : 'text-gray-800'}`}>
                {value}
              </span>
              <span className={`text-xl ${isRedSuit ? 'text-red-600' : 'text-gray-800'}`}>
                {suitSymbol}
              </span>
            </div>
            
            <div className="absolute bottom-2 right-2 flex flex-col items-center rotate-180">
              <span className={`text-2xl font-bold ${isRedSuit ? 'text-red-600' : 'text-gray-800'}`}>
                {value}
              </span>
              <span className={`text-xl ${isRedSuit ? 'text-red-600' : 'text-gray-800'}`}>
                {suitSymbol}
              </span>
            </div>

            {/* Card center */}
            <div className="flex flex-col items-center justify-center h-full w-full">
              {/* Large suit symbol */}
              <span className={`text-7xl ${isRedSuit ? 'text-red-600' : 'text-gray-800'}`}>
                {suitSymbol}
              </span>
              
              {/* Chess piece symbol */}
              <div className="mt-4 p-3 bg-white/80 rounded-full shadow-inner">
                <span className="text-5xl text-gray-800">{chessPieceSymbol}</span>
              </div>
              
              {/* Piece description */}
              <div className="mt-4 px-3 py-1 bg-white/80 rounded-lg text-sm text-gray-700 font-medium text-center">
                {renderPieceInfo(value)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPieceInfo = (cardValue: string) => {
    switch (cardValue) {
      case "2": return "a-file Pawn";
      case "3": return "b-file Pawn";
      case "4": return "c-file Pawn";
      case "5": return "d-file Pawn";
      case "6": return "e-file Pawn";
      case "7": return "f-file Pawn";
      case "8": return "g-file Pawn";
      case "9": return "h-file Pawn";
      case "10": return "Knight";
      case "J": return "Bishop";
      case "Q": return "Queen";
      case "K": return "King";
      case "A": return "Rook";
      default: return "";
    }
  };

  // Determine if draw button should be disabled
  const isDrawDisabled = isDisabled || isLoading || currentCard !== null;

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold text-white mb-6">Current Card</h2>
      
      <div className="min-h-[25rem] flex items-center justify-center">
        {currentCard ? (
          renderCard(currentCard)
        ) : (
          <div className="w-64 h-96 rounded-xl border-2 border-dashed border-gray-500 flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-700">
            <span className="text-6xl text-gray-600 mb-4">♠</span>
            <p className="text-gray-400 text-center">No card drawn</p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <button
          onClick={handleDrawCard}
          disabled={isDrawDisabled}
          className={`
            relative overflow-hidden px-8 py-4 rounded-lg font-bold text-white text-lg
            transition-all duration-300 transform
            ${isDrawDisabled
              ? 'bg-gray-500 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:-translate-y-1 hover:shadow-lg'
            }
          `}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Drawing...
            </span>
          ) : (
            <>
              <span className="relative z-10">Draw Card</span>
              <span className="absolute inset-0 bg-white/20 transform scale-x-0 origin-left transition-transform group-hover:scale-x-100"></span>
            </>
          )}
        </button>
      </div>

      {/* Section to display discarded cards */}
      {gameState.usedCards.length > 0 && (
        <div className="mt-10 w-full">
          <h3 className="text-xl font-bold text-white mb-3">Discarded Cards</h3>
          <div className="bg-gray-800/50 p-4 rounded-lg max-h-36 overflow-y-auto shadow-inner">
            <div className="flex flex-wrap gap-2">
              {gameState.usedCards.map((card, index) => {
                const [value, , suit] = card.split(" ");
                const suitSymbol = getSuitSymbol(suit);
                const isRed = suit === "Hearts" || suit === "Diamonds";
                return (
                  <div 
                    key={index} 
                    className={`
                      px-2 py-1 rounded border flex items-center gap-1
                      ${isRed ? 'text-red-300 border-red-900/30 bg-red-900/20' : 'text-blue-300 border-blue-900/30 bg-blue-900/20'}
                    `}
                    title={card}
                  >
                    <span>{value}</span>
                    <span>{suitSymbol}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-center mt-2 text-gray-400">
            {gameState.usedCards.length} cards used
          </div>
        </div>
      )}
    </div>
  );
};
