"use client";

import { useState } from "react";

import CharacterAnimation from "./character-animation";
import { SceneModalProps } from "@/lib/types";

export default function SceneModal({
  isOpen,
  onClose,
  pose,
  messages,
  setSceneModal,
  sprites,
  gamePhase,
  lastResultMessage,
}: SceneModalProps) {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const currentMessage = messages[step];
  const isLast = step === messages.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
      setStep(0); // reset for next opening
    } else {
      setStep(step + 1);
      step === 0
        ? setSceneModal((prev) => ({ ...prev, pose: "welcome2" }))
        : step === 1
          ? setSceneModal((prev) => ({ ...prev, pose: "welcome1" }))
          : step === 2
            ? setSceneModal((prev) => ({ ...prev, pose: "welcome2" }))
            : step === 3
              ? setSceneModal((prev) => ({ ...prev, pose: "welcome3" }))
              : setSceneModal((prev) => ({ ...prev, pose: "welcome3" }));
    }
  };

  const handleSkip = () => {
    onClose();
    setStep(0);
  };

  return (
    <div className="card-modal-overlay">
      <div className="card-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="card-modal-close" onClick={handleSkip}>
          ✕
        </button>

        {/* Dealer character */}
        <div className="flex justify-center ">
          <CharacterAnimation
            state={pose}
            caption={currentMessage}
            width={600}
            height={800}
            sprites={sprites}
            showBubble={true}
          />
        </div>
        {/* NEW: round-complete / round-transition result banner */}
        {(gamePhase === "roundComplete" || gamePhase === "roundTransition") &&
          lastResultMessage && (
            <div className="text-white font-bold text-xl mb-6 text-center uppercase tracking-widest opacity-70">
              {lastResultMessage}
            </div>
          )}
        <div className="text-center mt-8">
          <button
            onClick={handleNext}
            className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-black text-xl py-3 px-10 rounded-full shadow-xl transition duration-200 hover:scale-105 active:scale-95"
          >
            {isLast ? "Close" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
