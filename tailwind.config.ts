// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
  // Ensure we don't conflict with host site
  corePlugins: {
    preflight: false,
  },
  // Use important to avoid conflicts with host styles
  important: "#feedback-widget-root",
};
