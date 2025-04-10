"use client";
import { useState, useEffect } from "react";
import { ChessBoard } from "@/components/ChessBoard/ChessBoard";
import { CurrentCard } from "@/components/Card/CurrentCard";
import { GameProvider } from "@/contexts/GameContext";
import { LocalGameService } from "@/services/implementations/LocalGameService";
import { LocalCardService } from "@/services/implementations/LocalCardService";
import { GameStatus } from "@/types/game";

export default function GamePage() {
  // Initialize services
  const [cardService] = useState(() => new LocalCardService());
  const [gameService] = useState(() => new LocalGameService());
  const [gameStatus, setGameStatus] = useState<GameStatus>("active");

  // Subscribe to game state changes
  useEffect(() => {
    const unsubscribe = gameService.onStateChange((state) => {
      setGameStatus(state.status);
    });
    
    return () => {
      // Clean up subscription when component unmounts
      if (unsubscribe) {
        // Note: We'd need to modify the service to return an unsubscribe function
      }
    };
  }, [gameService]);

  const resetGame = () => {
    gameService.initGame();
    cardService.resetDeck();
  };

  // Function to get status message
  const getStatusMessage = () => {
    switch (gameStatus) {
      case "check":
        return "Check! King is under attack.";
      case "checkmate":
        return `Checkmate! ${gameService.getCurrentState().turn === "white" ? "Black" : "White"} wins!`;
      case "draw":
        return "Game ended in a draw.";
      default:
        return null;
    }
  };

  const statusMessage = getStatusMessage();
  const currentState = gameService.getCurrentState();

  return (
    <GameProvider gameService={gameService} cardService={cardService}>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Game Header */}
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-2">
              Card Chess
            </h1>
            <p className="text-gray-400">Draw cards to determine which chess pieces to move</p>
          </div>

          {/* Main Game Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left side - Current Card and Controls */}
            <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6 backdrop-blur-sm">
              <CurrentCard isDisabled={gameStatus !== "active"} />
            </div>

            {/* Center - Chess Board */}
            <div className="lg:col-span-1 bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6">
              <ChessBoard />
              
              {/* Game status message below the board */}
              {statusMessage && (
                <div className={`mt-4 p-4 rounded-lg text-center font-bold ${
                  gameStatus === "checkmate" ? "bg-red-900/50 text-red-100" :
                  gameStatus === "check" ? "bg-yellow-900/50 text-yellow-100" :
                  "bg-blue-900/50 text-blue-100"
                }`}>
                  {statusMessage}
                </div>
              )}
            </div>

            {/* Right side - Game Info */}
            <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6">
              <div className="text-white h-full flex flex-col">
                <h2 className="text-2xl font-bold mb-6">Game Info</h2>
                
                {/* Current Turn Indicator */}
                <div className="mb-8">
                  <h3 className="text-gray-400 mb-2">Current Turn</h3>
                  <div className={`
                    p-4 rounded-lg text-center font-bold text-xl
                    transition-all duration-500 transform
                    ${currentState.turn === "white" 
                      ? "bg-white text-gray-800" 
                      : "bg-gray-900 text-white border border-gray-700"
                    }
                  `}>
                    {currentState.turn.charAt(0).toUpperCase() + currentState.turn.slice(1)}
                  </div>
                </div>

                {/* Card Statistics */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <span className="block text-gray-400 text-sm mb-1">Remaining</span>
                    <span className="text-2xl font-bold">{cardService.getRemainingCards()}</span>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <span className="block text-gray-400 text-sm mb-1">Used</span>
                    <span className="text-2xl font-bold">{cardService.getUsedCards().length}</span>
                  </div>
                </div>
                
                {/* Move History */}
                <div className="flex-grow mb-6">
                  <h3 className="text-gray-400 mb-2">Move History</h3>
                  <div className="bg-gray-700/50 rounded-lg p-3 max-h-40 overflow-y-auto">
                    {currentState.moveHistory.length > 0 ? (
                      <div className="space-y-1">
                        {currentState.moveHistory.map((move, index) => (
                          <div key={index} className="flex justify-between items-center p-1 border-b border-gray-600/30 text-sm">
                            <span className="text-gray-300">
                              {(index % 2 === 0 ? "White" : "Black") + ": "}
                              <span className="font-mono">{move.from} → {move.to}</span>
                            </span>
                            <span className="text-gray-400">{move.card.split(" ")[0]}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-center py-4">No moves yet</div>
                    )}
                  </div>
                </div>

                {/* Game Controls */}
                <div className="mt-auto">
                  <button
                    onClick={resetGame}
                    className={`
                      w-full py-3 rounded-lg font-bold text-center
                      transition-all duration-300 transform
                      ${gameStatus !== "active" 
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 hover:-translate-y-1 hover:shadow-lg" 
                        : "bg-gray-700 text-gray-400 cursor-not-allowed"
                      }
                    `}
                    disabled={gameStatus === "active"}
                  >
                    {gameStatus !== "active" ? "New Game" : "Game in Progress"}
                  </button>
                  
                  {gameStatus === "active" && (
                    <div className="mt-4 text-center text-xs text-gray-500">
                      Complete the game to start a new one
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-16 text-center text-gray-600 text-sm">
            <p>Card Chess - Draw cards to determine your chess moves</p>
          </div>
        </div>
      </div>
    </GameProvider>
  );
}
