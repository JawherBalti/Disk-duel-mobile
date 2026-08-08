import React, { useEffect, useRef, useState } from "react";
import { View, Animated, Easing, StyleSheet, Text } from "react-native";
import { animations } from "../lib/animations";
import { AnimationConfig, SpriteAnimationProps } from "../lib/types";

export default function SpriteAnimation({
  state,
  duration,
  loop,
  caption="",
  showBubble = true,
  onComplete,
}: SpriteAnimationProps) {
  const config = animations[state];
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayedCaption, setDisplayedCaption] = useState("");

  // Use props if provided, otherwise fall back to state config defaults
  const isLooping = loop ?? config.loop;
  const animDuration = duration ?? (config.frames / config.fps) * 1000;
  const totalFrames = config.frames;
  const cols = config.cols;
  const rows = config.rows;

  /*
   * ---------------------------------------
   * Typewriter caption animation
   * ---------------------------------------
   */
  useEffect(() => {
    setDisplayedCaption("");

    if (!caption) return;

    let index = 0;

    const interval = setInterval(() => {
      index++;

      setDisplayedCaption(caption.slice(0, index));

      if (index >= caption.length) {
        clearInterval(interval);
      }
    }, 40);

    return () => {
      clearInterval(interval);
    };
  }, [caption]);

  useEffect(() => {
    // Reset animation when state changes
    animatedValue.setValue(0);

    const timingAnim = Animated.timing(animatedValue, {
      toValue: totalFrames,
      duration: animDuration,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    const animation = isLooping ? Animated.loop(timingAnim) : timingAnim;

    animation.start(({ finished }) => {
      if (finished && !isLooping && onComplete) {
        onComplete();
      }
    });

    return () => animation.stop();
  }, [animatedValue, animDuration, isLooping, totalFrames, state, onComplete]);

  // Build step keyframes
  const inputRange: number[] = [];
  const translateXOutput: number[] = [];
  const translateYOutput: number[] = [];

  for (let i = 0; i < totalFrames; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);

    const xOffset = -col * config.width;
    const yOffset = -row * config.height; // Fixed typo here (height, not heignt)

    inputRange.push(i);
    translateXOutput.push(xOffset);
    translateYOutput.push(yOffset);

    if (i < totalFrames - 1) {
      inputRange.push(i + 0.9999);
      translateXOutput.push(xOffset);
      translateYOutput.push(yOffset);
    }
  }

  const translateX = animatedValue.interpolate({
    inputRange,
    outputRange: translateXOutput,
    extrapolate: "clamp",
  });

  const translateY = animatedValue.interpolate({
    inputRange,
    outputRange: translateYOutput,
    extrapolate: "clamp",
  });

  return (
    <View
      style={{
        width: config.width * 0.5,
        height: config.height * 0.5,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {showBubble && caption ? (
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>{displayedCaption}</Text>
        </View>
      ) : null}
      <View
        style={[
          styles.cropWindow,
          {
            width: config.width,
            height: config.height,
            transform: [{ scale: 0.5 }], // Scale down the inner crop window
          },
        ]}
      >
        <Animated.Image
          source={config.src}
          style={[
            {
              width: config.width * cols,
              height: config.height * rows,
              transform: [{ translateX }, { translateY }],
            },
          ]}
          resizeMode="stretch"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cropWindow: {
    overflow: "hidden",
  },
  bubble: {
    backgroundColor: "white",
    borderRadius: 20,

    paddingHorizontal: 18,
    paddingVertical: 12,

    marginBottom: 12,

    maxWidth: 320,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,

    elevation: 5,
  },

  bubbleText: {
    color: "#111",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
});
