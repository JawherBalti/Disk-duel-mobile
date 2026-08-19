import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  Animated,
  Dimensions,
  Image,
  Easing,
  ImageSourcePropType,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import SoundPlayer from "react-native-sound-player";
import { CardPickModalProps } from "../lib/types";

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const CARD_INFO: Record<
  string,
  { label: string; icon: ImageSourcePropType; desc: string }
> = {
  double: {
    label: "High Stakes",
    icon: require("../assets/icons/high-stakes.png"),
    desc: "Double effect: -2 lives if wrong, -2 dealer lives if right",
  },
  extraLife: {
    label: "Extra Life",
    icon: require("../assets/icons/extra-life.png"),
    desc: "+1 life for the team, immediately",
  },
  fastTimer: {
    label: "Quickening",
    icon: require("../assets/icons/quickening.png"),
    desc: "Timer runs faster this round",
  },
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.22;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

export default function CardPickModal({
  options,
  role,
  cardPicked,
  revealedCardIndex,
  revealedCardType = "fastTimer",
  onPickCard,
}: CardPickModalProps) {
  const [flipping, setFlipping] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const flipAnims = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;

  // When a card is revealed, trigger the spin+zoom animation
  useEffect(() => {
    if (revealedCardIndex !== null) {
      setFlipping(revealedCardIndex);
      const anim = flipAnims[revealedCardIndex];
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [revealedCardIndex]);

  // Reset everything when modal closes
  useEffect(() => {
    if (!cardPicked) {
      setSelectedIndex(null);
      flipAnims.forEach((anim) => anim.setValue(1));
      setFlipping(null);
    }
  }, [cardPicked]);

  const canPick = role === "player1" && !cardPicked;

  const handleCardClick = (idx: number) => {
    if (!canPick) return;
    setSelectedIndex(idx);
    if (options.sfx) SoundPlayer.playSoundFile("pick", "m4a");
  };

  const handleConfirm = () => {
    if (selectedIndex === null) return;
    onPickCard(selectedIndex);
  };

  const renderCard = (idx: number) => {
    const isRevealed = revealedCardIndex === idx;
    const isSelected = !cardPicked && selectedIndex === idx;
    const info =
      isRevealed && revealedCardType ? CARD_INFO[revealedCardType] : null;
    const flipValue = flipAnims[idx];

    // Interpolations – applied only when revealed
    const scale = isRevealed
      ? flipValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 1],
        })
      : 1;
    const rotateY = isRevealed
      ? flipValue.interpolate({
          inputRange: [0, 1],
          outputRange: ["-360deg", "0deg"],
        })
      : "0deg";
    const opacity = isRevealed
      ? flipValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        })
      : 1;

    // Gradient colors based on state
    let gradientColors: string[];
    if (isRevealed) {
      gradientColors = ["#7e22ce", "#4338ca"]; // purple-700 to indigo-800
    } else if (isSelected) {
      gradientColors = ["#1e40af", "#6b21a8"]; // blue-800 to purple-800
    } else {
      gradientColors = ["#1e3a8a", "#4c1d95"]; // blue-900 to purple-900
    }

    // Border color
    let borderColor = "rgba(255,255,255,0.3)";
    if (isRevealed)
      borderColor = "#facc15"; // yellow-400
    else if (isSelected) borderColor = "#4ade80"; // green-400

    return (
      <AnimatedLinearGradient
        key={idx}
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: borderColor,
          transform: [{ scale }, { rotateY }],
          opacity: opacity,
          // Shadow for selected state (optional)
          ...(isSelected && {
            shadowColor: "#4ade80",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 6,
          }),
        }}
      >
        <Pressable
          disabled={!canPick}
          onPress={() => handleCardClick(idx)}
          className="items-center justify-center w-full h-full"
        >
          {/* Card content: hidden icon or revealed info */}
          {isRevealed && info ? (
            <View className="items-center justify-center">
              <Image
                source={info.icon}
                resizeMode="contain"
                style={{
                  width: 60,
                  height: 60,
                }}
              />
            </View>
          ) : (
            <View className="items-center justify-center">
              {/* <HiddenIcon width={60} height={60} /> */}
              <Text className="text-white/30 text-4xl font-bold">?</Text>
            </View>
          )}

          {isSelected && (
            <View className="absolute -top-2 -right-2 bg-green-500 rounded-full w-6 h-6 items-center justify-center border-2 border-white">
              <Text className="text-white text-xs font-bold">✓</Text>
            </View>
          )}
        </Pressable>
      </AnimatedLinearGradient>
    );
  };

  return (
    <Modal transparent animationType="fade" visible>
      <View className="flex-1 items-center justify-center bg-black/60 p-4">
        <View className="items-center gap-10 w-full rounded-[28px] border-4 border-yellow-400 px-6 py-7 bg-[rgba(15,15,40,0.92)]">
          <Text className="text-2xl sm:text-3xl font-bold text-white text-center">
            {role === "player1"
              ? cardPicked
                ? "Effect revealed!"
                : "Choose an effect"
              : "Player 1 is choosing an effect..."}
          </Text>

          <View className="flex-row justify-center gap-4 sm:gap-6">
            {[0, 1, 2].map((idx) => renderCard(idx))}
          </View>

          {canPick && selectedIndex !== null && (
            <Pressable
              className="bg-yellow-400 hover:bg-yellow-300 py-3 px-10 rounded-full shadow-xl active:scale-105"
              onPress={handleConfirm}
            >
              <Text className="text-gray-900 font-black text-xl">Confirm</Text>
            </Pressable>
          )}

          {revealedCardIndex !== null && revealedCardType && (
            <View className="bg-yellow-400/10 border border-yellow-400/40 rounded-xl p-3">
              <Text className="text-yellow-200 text-sm font-semibold text-center">
                {CARD_INFO[revealedCardType].desc}
              </Text>
            </View>
          )}

          {!cardPicked && role === "player2" && (
            <Text className="text-white/60 text-sm">
              Waiting for Player 1...
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}
