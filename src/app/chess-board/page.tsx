"use client";

import React, { useState } from "react";
import ChessboardComponent from "@/components/ChessBoard";
import RandomCard from "@/components/RandomCard";

export default function HomePage() {
  const [drawnCard, setDrawnCard] = useState<string | null>(null);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="flex flex-grow max-w-4xl p-4 space-x-4">
        <div
          className="flex-grow p-4 bg-gray-800 rounded shadow-lg"
          style={{ flex: "1 1 60%" }}
        >
          <h1 className="text-center text-3xl font-semibold mb-4">
            Chess Game
          </h1>
          <ChessboardComponent drawnCard={drawnCard} />
        </div>
        <div className="w-1/3 p-4 bg-gray-800 rounded shadow-lg">
          <RandomCard onCardDrawn={setDrawnCard} />
        </div>
      </div>
    </div>
  );
}
