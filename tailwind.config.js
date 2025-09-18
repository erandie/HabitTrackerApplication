module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",           // ✅ New: now supports multiple extensions (js, jsx, ts, tsx)
    "./app/**/*.{js,jsx,ts,tsx}",      // ✅ New: added Expo Router "app" folder (was missing before)
    "./components/**/*.{js,jsx,ts,tsx}" // ⚡ Same as before, scans shared components
  ],
  presets: [require("nativewind/preset")], // ⚡ Same, still using NativeWind preset
  theme: {
    extend: {}, // ⚡ No changes, still extend here for custom colors/fonts/etc.
  },
  plugins: [], // ⚡ Same, no plugins added yet
}