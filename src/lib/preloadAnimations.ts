// preloadAnimations.ts
import { Image } from 'react-native';
import { animations } from './animations';

// If you want to return the same type as before (map of key → asset),
// you can keep the same signature. The "LoadedAnimations" type would then
// be Record<AnimationState, any> (or the resolved asset object).
export async function preloadAnimations(): Promise<Record<string, any>> {
  const entries = await Promise.all(
    Object.entries(animations).map(async ([key, config]) => {
      const resolved = Image.resolveAssetSource(config.src);
      if (resolved) {
        // Prefetch the image into the native cache
        await Image.prefetch(resolved.uri);
      }
      // Return the original asset reference (or you could return resolved)
      return [key, config.src] as const;
    })
  );
  return Object.fromEntries(entries);
}