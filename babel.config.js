module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['expo'],
    plugins: [
      'react-native-worklets/plugin',
    ],
  };
};
