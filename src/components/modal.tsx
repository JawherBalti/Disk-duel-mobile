import React from "react";
import { View, Text, Modal as RNModal } from "react-native";
import { ModalProps } from "../lib/types";
import CustomButton from "./button";

export default function Modal({
  isOpen,
  title,
  message,
  onClose,
  onConfirm,
  confirmText = "OK",
}: ModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onClose();
    if (onConfirm) onConfirm();
  };

  return (
    <RNModal
      transparent
      visible={isOpen}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <View className="flex-1 items-center justify-center bg-black/60 px-4">
        {/* Modal Card */}
        <View className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
          {/* Header */}
          <View className="border-b-4 border-yellow-400 p-5 bg-purple-600">
            <Text className="text-2xl font-bold text-white text-center">
              {title}
            </Text>
          </View>

          {/* Body */}
          <View className="p-6">
            <Text className="text-gray-800 text-lg text-center">
              {message}
            </Text>
          </View>

          {/* Action Button */}
          <View className="p-4 items-center justify-center">
            <CustomButton
              variant="orange"
              onPress={handleConfirm} // Changed onClick -> onPress
              style={{ width: "50%" }}
            >
              {confirmText}
            </CustomButton>
          </View>
        </View>
      </View>
    </RNModal>
  );
}