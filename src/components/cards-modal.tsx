import React, { useEffect, useRef } from "react";
import { View, Text, Pressable, Animated, Easing } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { CardsModalProps } from "../lib/types";

// Animated version of LinearGradient for transform support
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function CardsModal({
  handleCloseCardModal,
  cardsZoomingOut,
  oppositePair,
}: CardsModalProps) {
  // Card animations
  const leftScale = useRef(new Animated.Value(0.3)).current;
  const leftRotate = useRef(new Animated.Value(-360)).current; // start at -360°
  const rightScale = useRef(new Animated.Value(0.3)).current;
  const rightRotate = useRef(new Animated.Value(-360)).current;
  // Interpolated rotateY strings for each card
  const leftRotateInterp = leftRotate.interpolate({
    inputRange: [-360, 0],
    outputRange: ["-360deg", "0deg"],
  });
  const rightRotateInterp = rightRotate.interpolate({
    inputRange: [-360, 0],
    outputRange: ["-360deg", "0deg"],
  });
  // Modal animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (cardsZoomingOut) {
      // Closing: reset quickly (unchanged)
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.5,
          duration: 180,
          easing: Easing.in(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(leftScale, {
            toValue: 0.3,
            duration: 180,
            useNativeDriver: true,
          }),
          Animated.timing(leftRotate, {
            toValue: -360,
            duration: 180,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(rightScale, {
            toValue: 0.3,
            duration: 180,
            useNativeDriver: true,
          }),
          Animated.timing(rightRotate, {
            toValue: -360,
            duration: 180,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      // Opening: all animations run in parallel with the same 2000ms pace
      Animated.parallel([
        // Modal zoom – slowed down to match the spin
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 2000, // now matches card spin duration
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        // Modal fade – can also be slower if you like, but 200ms is fine
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        // Left card – scale + spin, no delay
        Animated.parallel([
          Animated.timing(leftScale, {
            toValue: 1,
            duration: 2000, // scale also matches spin
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          }),
          Animated.timing(leftRotate, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        // Right card – same, but slightly staggered if you want (optional)
        Animated.parallel([
          Animated.timing(rightScale, {
            toValue: 1,
            duration: 2000,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          }),
          Animated.timing(rightRotate, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [cardsZoomingOut]);

  return (
    <View className="absolute inset-0 flex items-center justify-center bg-black/50 p-4">
      <Animated.View
        style={{
          width: "100%",
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        {/* Modal content */}
        <View
          className="w-full rounded-[28px] border-4 border-yellow-400 px-6 py-7 bg-[rgba(15,15,40,0.92)]"
          onStartShouldSetResponder={() => true}
        >
          {/* Title */}
          <Text className="text-white font-bold text-xl mb-6 text-center uppercase tracking-widest opacity-70">
            This Round's Cards
          </Text>

          {/* Cards */}
          <View className="flex-col gap-4 justify-center">
            {/* Left card */}
            <AnimatedLinearGradient
              colors={["#b91c1c", "#ef4444"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                transform: [
                  { perspective: 1000 },
                  { scale: leftScale },
                  { rotateY: leftRotateInterp },
                ],
                padding: 24, // p-6
                borderRadius: 16, // rounded-2xl
                borderWidth: 2,
                borderColor: "#facc15", // yellow-400
                overflow: "hidden",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <View>
                <Text className="text-yellow-300 text-base font-bold uppercase tracking-wide text-center">
                  {oppositePair?.left || "Expensive Car"}
                </Text>
              </View>
            </AnimatedLinearGradient>

            {/* Right card */}
            <AnimatedLinearGradient
              colors={["#1d4ed8", "#3b82f6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                transform: [
                  { perspective: 1000 },
                  { scale: rightScale },
                  { rotateY: rightRotateInterp },
                ],
                padding: 24,
                borderRadius: 16,
                borderWidth: 2,
                borderColor: "#facc15",
                overflow: "hidden",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <View>
                <Text className="text-yellow-300 text-base font-bold uppercase tracking-wide text-center">
                  {oppositePair?.right || "Cheap Car"}
                </Text>
              </View>
            </AnimatedLinearGradient>
          </View>

          {/* Action button */}
          <View className="items-center mt-8">
            <Pressable
              onPress={handleCloseCardModal}
              className="bg-yellow-400 py-3 px-10 rounded-full shadow-xl"
            >
              <Text className="text-gray-900 font-black text-xl">Got it!</Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
