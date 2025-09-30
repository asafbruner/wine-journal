let tailwindConfig;
try {
  tailwindConfig = await import("./tailwind.config.ts");
} catch {
  // Fallback for test environment
  tailwindConfig = {};
}

const config = {
  plugins: {
    tailwindcss: { config: tailwindConfig.default || tailwindConfig },
    autoprefixer: {},
  },
};

export default config;
