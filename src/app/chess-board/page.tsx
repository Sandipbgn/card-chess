"use client";

import React, { useState } from "react";
import ChessboardComponent from "@/components/temp/ChessBoard";
import RandomCard from "@/components/temp/RandomCard";

export default function HomePage() {
  const [drawnCard, setDrawnCard] = useState<string | null>(null);
  const [currentTurn, setCurrentTurn] = useState<"white" | "black">("white");

  const handleCardUsed = () => {
    setDrawnCard(null);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="flex flex-grow max-w-4xl p-4 space-x-4">
        <div
          className="flex-grow p-4 bg-gray-800 rounded shadow-lg"
          style={{ flex: "1 1 60%" }}
        >
          <h1 className="text-center text-3xl font-semibold mb-4 text-white">
            Card Chess
          </h1>
          <ChessboardComponent
            drawnCard={drawnCard}
            onCardUsed={handleCardUsed}
            onTurnChange={setCurrentTurn}
          />
        </div>
        <div className="w-1/3 p-4 bg-gray-800 rounded shadow-lg text-white">
          <RandomCard onCardDrawn={setDrawnCard} currentTurn={currentTurn} />
          {!drawnCard && (
            <p className="text-center mt-4">
              {currentTurn}'s turn to draw a card
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
