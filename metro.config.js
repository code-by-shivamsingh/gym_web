const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    blockList: [
      /.*\.gradle.*/,
      /.*android\/app\/build.*/,
      /.*ios\/build.*/
    ]
  }
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
