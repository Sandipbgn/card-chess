import { createContext, useContext, useMemo, ReactNode } from "react";
import { Square } from "chess.js";
import { IGameService } from "@/services/interfaces/IGameService";
import { ICardService } from "@/services/interfaces/ICardService";
import { Card, GameState } from "@/types/game";

interface GameContextType {
  gameState: GameState;
  currentCard: Card | null;
  isLoading: boolean;
  error: string | null;
  drawCard: () => Promise<Card | null>;
  makeMove: (from: Square, to: Square) => Promise<boolean>;
}

const GameContext = createContext<GameContextType | null>(null);

interface GameProviderProps {
  children: ReactNode;
  gameService: IGameService;
  cardService: ICardService;
}

export function GameProvider({
  children,
  gameService,
  cardService,
}: GameProviderProps) {
  const contextValue = useMemo<GameContextType>(
    () => ({
      gameState: gameService.getCurrentState(),
      currentCard: gameService.getCurrentState().currentCard,
      isLoading: false,
      error: null,

      drawCard: async () => {
        try {
          const result = cardService.drawCard();
          if (result.success && result.card) {
            gameService.updateCurrentCard(result.card);
            return result.card;
          }
          return null;
        } catch (error) {
          console.error("Error drawing card:", error);
          return null;
        }
      },

      makeMove: async (from: Square, to: Square) => {
        try {
          const currentCard = gameService.getCurrentState().currentCard;
          if (!currentCard) {
            return false;
          }

          const result = gameService.makeMove(
            from,
            to,
            currentCard,
            gameService.getCurrentState().turn
          );

          if (result.success) {
            cardService.discardCard(currentCard);
            return true;
          }
          return false;
        } catch (error) {
          console.error("Error making move:", error);
          return false;
        }
      },
    }),
    [gameService, cardService]
  );

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  );
}

export function useGame(): GameContextType {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
