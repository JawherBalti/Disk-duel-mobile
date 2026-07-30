// module.exports = {
//   presets: ["module:@react-native/babel-preset"],
//   plugins: ["nativewind/babel"],
// };


// module.exports = function (api) {
//   api.cache(true);
//   return {
//     presets: ["module:@react-native/babel-preset"],
//     plugins: ["nativewind/babel"],
//   };
// };

module.exports = {
  presets: [
    ["module:@react-native/babel-preset", { jsxImportSource: "nativewind" }],
    "nativewind/babel",
  ],
};
