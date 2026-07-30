import React from "react";
import {
  Pressable,
  Text,
  ViewStyle,
  StyleProp,
} from "react-native";

// import { click } from "@/lib/audio";

type ButtonVariant =
  | "green"
  | "blue"
  | "orange"
  | "transparent";

interface CommonButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export default function CustomButton({
  children,
  onPress,
  disabled = false,
  variant = "blue",
  className = "",
  style,
}: CommonButtonProps) {
  const variants = {
    green: "bg-green-500",
    blue: "bg-blue-500",
    orange: "bg-orange-500",
    transparent:
      "bg-white/20 border border-white/40",
  };

  return (
    <Pressable
      disabled={disabled}
      style={style}
      className={`
        w-full
        rounded-full
        px-10
        py-3
        items-center
        justify-center
        shadow-xl
        active:scale-95
        ${disabled ? "opacity-50" : ""}
        ${variants[variant]}
        ${className}
      `}
      android_ripple={{
        color: "rgba(255,255,255,0.2)",
        borderless: false,
      }}
      onPress={() => {
        onPress?.();
        // click.play();
      }}
    >
      <Text
        className="text-xl text-white font-black"
        style={{
          fontFamily: "FredokaOne-Regular",
          textShadowColor: "rgba(0,0,0,0.35)",
          textShadowRadius: 4,
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}