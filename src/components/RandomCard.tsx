import React, { useState } from "react";

// Define the suits and values
const suits = ["Hearts", "Diamonds", "Clubs", "Spades"] as const;
const values = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
] as const;

type Card = `${(typeof values)[number]} of ${(typeof suits)[number]}`;

interface RandomCardProps {
  onCardDrawn: (card: Card) => void;
}

const RandomCard: React.FC<RandomCardProps> = ({ onCardDrawn }) => {
  const [card, setCard] = useState<Card | null>(null);

  const generateRandomCard = () => {
    const randomSuit = suits[Math.floor(Math.random() * suits.length)];
    const randomValue = values[Math.floor(Math.random() * values.length)];
    const newCard = `${randomValue} of ${randomSuit}` as Card;
    setCard(newCard);
    onCardDrawn(newCard); // Notify Chessboard of the drawn card
  };

  return (
    <div style={{ textAlign: "center", margin: "20px" }}>
      <h1>Random Card Generator</h1>
      <button onClick={generateRandomCard}>Draw a Card</button>
      {card && <h2 style={{ marginTop: "20px" }}>{card}</h2>}
    </div>
  );
};

export default RandomCard;
