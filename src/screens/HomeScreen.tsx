import React, { useEffect, useState } from "react";
import {
  View,
  Pressable,
  SafeAreaView,
  useWindowDimensions,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";
import LinearGradient from "react-native-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SoundPlayer from "react-native-sound-player";
import GameBoard from "../components/game-board";
import GameButtons from "../components/game-buttons";
import HowToPlayModal from "../components/how-to-play";
import SettingsModal from "../components/settings";
import { generateRandomSectors } from "../lib/utils";
import { Options, Sector } from '../lib/types';
import { useSafeAreaInsets } from "react-native-safe-area-context";

const defaultOptions: Options = {
  bgMusic: true,
  sfx: true,
};

export default function HomeScreen() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState<boolean>(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState<boolean>(false);
  const [options, setOptions] = useState<Options>(defaultOptions);

  // 🎯 For animations: title drop (replaces CSS .title-anim)
  const titleTranslateY = useSharedValue(-28);
  const titleOpacity = useSharedValue(0);
  const titleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleTranslateY.value }],
    opacity: titleOpacity.value,
  }));

  // 1️⃣ Load options from AsyncStorage (replaces localStorage)
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const stored = await AsyncStorage.getItem("gameOptions");
        if (stored) {
          setOptions(JSON.parse(stored));
        } else {
          await AsyncStorage.setItem(
            "gameOptions",
            JSON.stringify(defaultOptions),
          );
          setOptions(defaultOptions);
        }
      } catch (error) {
        console.error("Failed to load options", error);
      }
    };
    loadOptions();
  }, []);

  //Control background music
  useEffect(() => {
    try {
      if (options.bgMusic) {
        // 1. Play the background audio file (do not include file extension)
        SoundPlayer.playSoundFile("home", "m4a");

        // 2. Enable infinite looping
        // iOS: -1 loops indefinitely. Android: non-zero integer loops indefinitely.
        SoundPlayer.setNumberOfLoops(Platform.OS === "ios" ? -1 : 1);
      }
    } catch (e) {
      console.log("Cannot play sound file", e);
    }
    // Clean up when the component unmounts
    return () => {
      SoundPlayer.stop();
    };
  }, [options.bgMusic]);

  // 3️⃣ Generate sectors on mount
  useEffect(() => {
    const newSectors = generateRandomSectors();
    setSectors(newSectors);
  }, []);

  // 4️⃣ Trigger title animation after mount
  useEffect(() => {
    titleTranslateY.value = withDelay(100, withTiming(0, { duration: 550 }));
    titleOpacity.value = withDelay(100, withTiming(1, { duration: 550 }));
  }, []);

  const safeAreaInsets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  // 5️⃣ Responsive text size (replaces @media queries)
  const isSmall = width < 600;
  const titleSize = isSmall ? "text-4xl" : "text-6xl";

  return (
    <SafeAreaView
      className="flex-1"
      style={{ paddingBottom: safeAreaInsets.bottom }}
    >
      {/* 🌈 Gradient background (replaces CSS linear-gradient) */}
      <LinearGradient
        colors={["#06b6d4", "#3b82f6", "#a855f7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1 items-center justify-center p-4 pt-0"
      >
        {/* 🎬 Animated Title (replaces .title-anim + inline styles) */}
        <Animated.Text
          className={`font-fredoka font-bold text-white mb-0 text-center ${titleSize}`}
          style={[
            titleAnimatedStyle,
            {
              textShadowColor: "rgba(0,0,0,0.28)",
              textShadowOffset: { width: 0, height: 4 },
              textShadowRadius: 14,
              letterSpacing: 2,
            },
          ]}
        >
          Disk Duel
        </Animated.Text>

        {/* 🎮 Game Board & Buttons */}
        {sectors && <GameBoard initialSectors={sectors} />}
        <GameButtons options={options} />
        {/* 🧭 Floating Buttons (replaces fixed + flex-col) */}
        <View className="absolute bottom-7 right-7 space-y-4">
          <Pressable
            onPress={() => setIsOptionsOpen(true)}
            className="bg-orange-500 p-4 rounded-full items-center justify-center mb-2"
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <SettingsIcon width={24} height={24} color="white" />
          </Pressable>

          <Pressable
            onPress={() => setIsHowToPlayOpen(true)}
            className="bg-orange-500 p-4 rounded-full items-center justify-center"
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <HelpIcon width={24} height={24} color="white" />
          </Pressable>
        </View>

        {/* 📦 Modals (You'll need to convert these to RN Modal components) */}
        <HowToPlayModal
          isHowToPlayOpen={isHowToPlayOpen}
          setIsHowToPlayOpen={setIsHowToPlayOpen}
        />
        <SettingsModal
          isOptionsOpen={isOptionsOpen}
          setIsOptionsOpen={setIsOptionsOpen}
          setOptions={setOptions}
          options={options}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

const SettingsIcon = ({
  width,
  height,
  color,
}: {
  width: number;
  height: number;
  color: string;
}) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
  >
    <Circle cx="12" cy="12" r="3" />
    <Path d="M12 2v2" />
    <Path d="M12 20v2" />
    <Path d="M4.93 4.93l1.41 1.41" />
    <Path d="M17.66 17.66l1.41 1.41" />
    <Path d="M2 12h2" />
    <Path d="M20 12h2" />
    <Path d="M4.93 19.07l1.41-1.41" />
    <Path d="M17.66 6.34l1.41-1.41" />
    <Circle cx="12" cy="12" r="7" />
  </Svg>
);

const HelpIcon = ({
  width,
  height,
  color,
}: {
  width: number;
  height: number;
  color: string;
}) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill={color}>
    <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
  </Svg>
);
