import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  Switch,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SettingsProps, Options } from "../lib/types";

const STORAGE_KEY = "gameOptions";

export default function SettingsModal({
  isOptionsOpen,
  setIsOptionsOpen,
  options,
  setOptions,
}: SettingsProps) {
  const handleToggle = (key: keyof Options) => {
    setOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(options)
      );
    } catch (e) {
      console.log(e);
    }

    setIsOptionsOpen(false);
  };

  return (
    <Modal
      visible={isOptionsOpen}
      transparent
      animationType="fade"
      onRequestClose={() => setIsOptionsOpen(false)}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-black/70 px-6"
        onPress={() => setIsOptionsOpen(false)}
      >
        <Pressable
          className="w-full rounded-[28px] border-4 border-yellow-400 bg-[#13254B] px-6 py-7"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Title */}
          <Text
            className="text-center text-3xl font-bold text-yellow-400"
            style={{
              fontFamily: "FredokaOne-Regular",
              textShadowColor: "rgba(0,0,0,0.4)",
              textShadowRadius: 8,
            }}
          >
            Settings
          </Text>

          {/* Close Button */}
          <Pressable
            onPress={() => setIsOptionsOpen(false)}
            className="absolute right-4 top-4 h-10 w-10 items-center justify-center rounded-full bg-red-500"
          >
            <Text className="text-xl font-bold text-white">✕</Text>
          </Pressable>

          {/* Options */}
          <View className="mt-8 gap-6">
            <View className="flex-row items-center justify-between rounded-2xl bg-[#1A3568] px-5 py-4">
              <Text
                className="text-xl font-bold text-white"
                style={{
                  fontFamily: "FredokaOne-Regular",
                }}
              >
                Background Music
              </Text>

              <Switch
                value={options.bgMusic}
                onValueChange={() => handleToggle("bgMusic")}
                thumbColor={
                  options.bgMusic ? "#FCD34D" : "#E5E7EB"
                }
                trackColor={{
                  false: "#5B6475",
                  true: "#FFD54A",
                }}
              />
            </View>

            <View className="flex-row items-center justify-between rounded-2xl bg-[#1A3568] px-5 py-4">
              <Text
                className="text-xl font-bold text-white"
                style={{
                  fontFamily: "FredokaOne-Regular",
                }}
              >
                Sound Effects
              </Text>

              <Switch
                value={options.sfx}
                onValueChange={() => handleToggle("sfx")}
                thumbColor={
                  options.sfx ? "#FCD34D" : "#E5E7EB"
                }
                trackColor={{
                  false: "#5B6475",
                  true: "#FFD54A",
                }}
              />
            </View>
          </View>

          {/* Save Button */}
          <View className="mt-8 items-end">
            <Pressable
              onPress={handleSave}
              className="rounded-full bg-yellow-400 px-10 py-3 active:scale-95"
            >
              <Text
                className="text-xl font-black text-gray-900"
                style={{
                  fontFamily: "FredokaOne-Regular",
                }}
              >
                Save
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}