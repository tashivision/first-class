// Shared Tailwind CDN config for every page.
tailwind.config = {
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#ff7300",
          amber: "#ff8800",
          gold: "#e5a14c",
          subtitle: "#ff7300",
          dark: "#08080a",
          card: "#111116",
          border: "#23232c",
        },
      },
      fontFamily: {
        sans: ['"Open Sauce One"', "sans-serif"],
        glacial: ['"Glacial Indifference"', "sans-serif"],
        cy: ['"Cy Grotesk V3 Wide"', "sans-serif"],
        mono: ['"Space Mono"', "monospace"],
      },
      boxShadow: {
        "neon-orange": "0 0 35px -5px rgba(255, 115, 0, 0.45)",
        "neon-sm": "0 0 15px -3px rgba(255, 115, 0, 0.3)",
      },
    },
  },
};
