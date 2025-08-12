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
  resolver: {
    // Thêm 'ts' và 'tsx' vào danh sách các đuôi file nguồn.
    sourceExts: process.env.RN_SRC_EXT
      ? [...process.env.RN_SRC_EXT.split(','), 'ts', 'tsx']
      : ['js', 'json', 'ts', 'tsx'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);