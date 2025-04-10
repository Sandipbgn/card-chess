import React, { useState, useEffect } from "react";

// Define card suits - using const assertion for type safety
const suits = ["Hearts", "Diamonds", "Clubs", "Spades"] as const;

// Define card values - using const assertion for type safety
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

// Type definition for a card using template literal type
type Card = `${(typeof values)[number]} of ${(typeof suits)[number]}`;

// Props interface for RandomCard component
interface RandomCardProps {
  onCardDrawn: (card: Card | null) => void; // Callback when card is drawn
  currentTurn: "white" | "black"; // Current player's turn
}

// Main RandomCard component
const RandomCard: React.FC<RandomCardProps> = ({
  onCardDrawn,
  currentTurn,
}) => {
  // State for currently drawn card
  const [card, setCard] = useState<Card | null>(null);
  // State for remaining cards in deck
  const [deck, setDeck] = useState<Card[]>([]);

  // Initialize deck on component mount
  useEffect(() => {
    const newDeck: Card[] = [];
    // Generate all possible card combinations
    suits.forEach((suit) => {
      values.forEach((value) => {
        newDeck.push(`${value} of ${suit}` as Card);
      });
    });
    setDeck(newDeck);
  }, []);

  // Function to draw a random card
  const generateRandomCard = () => {
    if (deck.length === 0) return;

    // Determine valid suits based on current turn
    // White player can only draw Hearts/Diamonds
    // Black player can only draw Clubs/Spades
    const validSuits =
      currentTurn === "white" ? ["Hearts", "Diamonds"] : ["Clubs", "Spades"];

    // Filter deck for cards of valid suits
    const validCards = deck.filter((card) =>
      validSuits.some((suit) => card.includes(suit))
    );

    if (validCards.length === 0) return;

    // Select random card from valid cards
    const randomIndex = Math.floor(Math.random() * validCards.length);
    const newCard = validCards[randomIndex];

    // Update state and notify parent component
    setCard(newCard);
    setDeck(deck.filter((c) => c !== newCard));
    onCardDrawn(newCard);
  };

  // Render card drawer UI
  return (
    <div className="text-center m-5">
      <h2 className="text-xl mb-4">Card Drawer</h2>
      {/* Draw card button - disabled when deck is empty */}
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={generateRandomCard}
        disabled={!deck.length}
      >
        Draw a Card
      </button>
      {/* Display drawn card if exists */}
      {card && (
        <div className="mt-4 p-4 border rounded">
          <h3 className="text-lg">{card}</h3>
        </div>
      )}
      {/* Display remaining cards count */}
      <div className="mt-2 text-sm">Cards remaining: {deck.length}</div>
    </div>
  );
};

export default RandomCard;
