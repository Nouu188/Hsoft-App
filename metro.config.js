const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true, // <-- Bật inline requires có thể tăng tốc độ khởi động
      },
    }),
  },
  server: {
    useGlobalHotkey: true,
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);