"use client";

import { CardPickModalProps } from "@/lib/types";
import { useState, useEffect } from "react";


const CARD_INFO: Record<
  string,
  { label: string; emoji: string; desc: string }
> = {
  double: {
    label: "High Stakes",
    emoji: "/assets/high-stakes.svg",
    desc: "Double effect: -2 lives if wrong, -2 dealer lives if right",
  },
  extraLife: {
    label: "Extra Life",
    emoji: "/assets/extra-life.svg",
    desc: "+1 life for the team, immediately",
  },
  fastTimer: {
    label: "Quickening",
    emoji: "/assets/quickening.svg",
    desc: "Timer runs faster this round",
  },
};

export default function CardPickModal({
  role,
  cardPicked,
  revealedCardIndex,
  revealedCardType="fastTimer",
  onPickCard,
}: CardPickModalProps) {
  const [flipping, setFlipping] = useState<number | null>(null);
  // NEW: locally selected (not yet confirmed) card index
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (revealedCardIndex !== null) {
      setFlipping(revealedCardIndex);
    }
  }, [revealedCardIndex]);

  // NEW: reset local selection whenever the modal resets for a new round
  useEffect(() => {
    if (!cardPicked) {
      setSelectedIndex(null);
    }
  }, [cardPicked]);

  const canPick = role === "player1" && !cardPicked;

  const handleCardClick = (idx: number) => {
    if (!canPick) return;
    setSelectedIndex(idx);
  };

  const handleConfirm = () => {
    if (selectedIndex === null) return;
    onPickCard(selectedIndex);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="card-modal-content text-center space-y-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">
          {role === "player1"
            ? cardPicked
              ? "Effect revealed!"
              : "Choose an effect"
            : "Player 1 is choosing an effect..."}
        </h2>

        <div className="flex justify-center gap-4 sm:gap-6">
          {[0, 1, 2].map((idx) => {
            const isRevealed = revealedCardIndex === idx;
            const isSelected = !cardPicked && selectedIndex === idx;
            const info =
              isRevealed && revealedCardType
                ? CARD_INFO[revealedCardType]
                : null;

            return (
              <button
                key={idx}
                disabled={!canPick}
                onClick={() => handleCardClick(idx)}
                className={`relative w-20 h-28 sm:w-28 sm:h-40 rounded-xl border-2 transition-all duration-300 flex items-center justify-center
                  ${
                    isRevealed
                      ? "border-yellow-400 bg-linear-to-br from-purple-700 to-indigo-800 scale-105"
                      : isSelected
                        ? "border-green-400 bg-linear-to-br from-blue-800 to-purple-800 scale-110 shadow-lg shadow-green-400/30"
                        : "border-white/30 bg-linear-to-br from-blue-900 to-purple-900"
                  }
                  ${canPick ? "hover:scale-110 hover:border-yellow-300 cursor-pointer" : "cursor-default"}
                  ${flipping === idx ? "animate-cardFlip" : ""}
                `}
              >
                {isRevealed && info ? (
                  <div className="flex flex-col items-center gap-1 px-1">
                    <img className="text-3xl sm:text-4xl" src={info.emoji}/>
                    <span className="text-white text-[10px] sm:text-xs font-bold uppercase">
                      {info.label}
                    </span>
                  </div>
                ) : (
                  <img className="text-3xl sm:text-4xl" src="/assets/hidden.svg"/>
                )}

                {isSelected && (
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* NEW: confirm button, only for player1 while a card is selected but not yet confirmed */}
        {canPick && selectedIndex !== null && (
          <div className="flex justify-center gap-3">
            <button
              onClick={handleConfirm}
              className="hover:cursor-pointer bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-black text-xl py-3 px-10 rounded-full shadow-xl transition duration-200 hover:scale-105 active:scale-95"
            >
              Confirm
            </button>
          </div>
        )}

        {revealedCardIndex !== null && revealedCardType && (
          <div className="bg-yellow-400/10 border border-yellow-400/40 rounded-xl p-3 text-yellow-200 text-sm font-semibold">
            {CARD_INFO[revealedCardType].desc}
          </div>
        )}

        {!cardPicked && role === "player2" && (
          <p className="text-white/60 text-sm">Waiting for Player 1...</p>
        )}
      </div>
    </div>
  );
}
