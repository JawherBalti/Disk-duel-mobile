const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

// 1. Get the default config
const defaultConfig = getDefaultConfig(__dirname);

// 2. Ensure .webp and .mp3 are added to asset extensions
const extraAssetExts = ['webp', 'mp3'];

extraAssetExts.forEach((ext) => {
  if (!defaultConfig.resolver.assetExts.includes(ext)) {
    defaultConfig.resolver.assetExts.push(ext);
  }
});

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {};

// 3. Merge custom config with default config and apply NativeWind wrapper
module.exports = withNativeWind(
  mergeConfig(defaultConfig, config),
  { input: './global.css' }
);