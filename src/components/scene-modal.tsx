import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { AnimationState } from "../lib/types";
import SpriteAnimation from "./sprite-animation";

interface SceneModalProps {
  isOpen: boolean;

  onClose: () => void;

  pose: AnimationState;

  messages: string[];

  setSceneModal: React.Dispatch<
    React.SetStateAction<{
      isOpen: boolean;
      pose: AnimationState;
      messages: string[];
    }>
  >;

  sprites: Record<AnimationState, any>;

  gamePhase: string;

  lastResultMessage?: string;
}

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

  const currentMessage = messages[step];

  const isLast = step === messages.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();

      setStep(0);

      return;
    }

    setStep((prev) => prev + 1);

    /*
     * Keep exactly the same pose logic
     * as your Next.js version.
     */
    if (step === 0) {
      setSceneModal((prev) => ({
        ...prev,
        pose: "welcome2",
      }));
    } else if (step === 1) {
      setSceneModal((prev) => ({
        ...prev,
        pose: "welcome1",
      }));
    } else if (step === 2) {
      setSceneModal((prev) => ({
        ...prev,
        pose: "welcome2",
      }));
    } else if (step === 3) {
      setSceneModal((prev) => ({
        ...prev,
        pose: "welcome3",
      }));
    } else {
      setSceneModal((prev) => ({
        ...prev,
        pose: "welcome3",
      }));
    }
  };

  const handleSkip = () => {
    onClose();
    setStep(0);
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={handleSkip}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleSkip} />

        <View className="w-full rounded-[28px] border-4 border-yellow-400 px-6 py-7 bg-[rgba(15,15,40,0.92)]">
          {/* Close button */}
          <Pressable
            onPress={handleSkip}
            className="absolute right-5 top-5 h-10 w-10 items-center justify-center rounded-full bg-red-500"
          >
            <Text className="text-xl font-bold text-white">✕</Text>
          </Pressable>

          {/* Character */}
          <View className="flex items-center justify-center">
            <SpriteAnimation
              state={pose}
              onComplete={() => console.log("Pose finished!")}
              caption={currentMessage}
              showBubble={true}
            />
          </View>

          {/* Round result */}
          {(gamePhase === "roundComplete" || gamePhase === "roundTransition") &&
          lastResultMessage ? (
            <Text style={styles.resultText}>{lastResultMessage}</Text>
          ) : null}

          {/* Next button */}
          <View className="items-center mt-10">
            <Pressable
              onPress={handleNext}
              className="bg-yellow-400 py-3 px-10 rounded-full shadow-xl"
            >
              <Text className="text-gray-900 font-black text-xl">
                {isLast ? "Close" : "Next"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,

    backgroundColor: "rgba(0,0,0,0.75)",

    justifyContent: "center",
    alignItems: "center",

    padding: 20,
  },

  resultText: {
    color: "white",

    fontSize: 20,
    fontWeight: "900",

    textAlign: "center",

    marginBottom: 20,

    opacity: 0.7,

    textTransform: "uppercase",

    letterSpacing: 2,
  },
});
