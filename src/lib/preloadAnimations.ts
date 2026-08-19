import { Image, ImageSourcePropType } from "react-native";
import { animations } from "./animations";
import { AnimationState } from "./types";

export type LoadedAnimations = Record<
  AnimationState,
  ImageSourcePropType
>;

export async function preloadAnimations(): Promise<LoadedAnimations> {
  const entries = await Promise.all(
    Object.entries(animations).map(async ([key, config]) => {
      const resolved = Image.resolveAssetSource(config.src);

      if (resolved?.uri) {
        await Image.prefetch(resolved.uri);
      }

      return [key as AnimationState, config.src] as const;
    })
  );

  return Object.fromEntries(entries) as LoadedAnimations;
}