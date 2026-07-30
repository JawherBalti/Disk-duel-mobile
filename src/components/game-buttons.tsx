import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import CustomButton from "./button";
import Modal from "./modal";

type RootStackParamList = {
  Play: {
    gameCode: string;
  };
};

export default function GameButtons() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [joinCode, setJoinCode] = useState("");

  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: undefined as (() => void) | undefined,
    confirmText: "OK",
  });

  const generateGameCode = () =>
    Math.random().toString(36).substring(2, 8).toUpperCase();

  const showModal = (
    title: string,
    message: string,
    onConfirm?: () => void,
    confirmText = "OK"
  ) => {
    setModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      confirmText,
    });
  };

  const closeModal = () => {
    setModal({
      isOpen: false,
      title: "",
      message: "",
      onConfirm: undefined,
      confirmText: "OK",
    });
  };

  const handleCreate = () => {
    navigation.navigate("Play", {
      gameCode: generateGameCode(),
    });
  };

  const handleJoin = () => {
    if (joinCode.trim().length === 6) {
      navigation.navigate("Play", {
        gameCode: joinCode.toUpperCase(),
      });
    } else {
      showModal(
        "Join Failed",
        "Please enter a valid 6-character game code"
      );
    }
  };

  return (
    <>
      <View
        className="items-center w-full px-8"
        style={{
          marginTop: -8,
          rowGap: 16,
        }}
      >
        <CustomButton
          variant="green"
          onPress={handleCreate}
        >
          Create Game
        </CustomButton>

        {/* OR Divider */}
        <View className="flex-row items-center w-full">
          <View className="flex-1 h-[1px] bg-white/30" />

          <Text
            className="mx-4 text-white/70 text-sm"
            style={{
              fontFamily: "FredokaOne-Regular",
            }}
          >
            OR
          </Text>

          <View className="flex-1 h-[1px] bg-white/30" />
        </View>

        {/* Game Code Input */}
        <TextInput
          value={joinCode}
          onChangeText={(text) =>
            setJoinCode(
              text
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, "")
            )
          }
          placeholder="6-character code"
          placeholderTextColor="rgba(255,255,255,0.45)"
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={6}
          textAlign="center"
          className="w-full rounded-full border border-white/30 bg-slate-900/60 px-6 py-4 text-xl text-white"
          style={{
            fontFamily: "monospace",
            letterSpacing: 6,
          }}
        />

        <CustomButton
          variant="blue"
          onPress={handleJoin}
        >
          Join Game
        </CustomButton>
      </View>

      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
        confirmText={modal.confirmText}
      />
    </>
  );
}