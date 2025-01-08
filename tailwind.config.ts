import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    'text-green-400',
    'text-red-400',
    // Add any additional dynamic classes here
  ],
  theme: {
    extend: {
      colors: {
        neonGreen: '#4af626', // Custom color if needed
      },
    },
  },
  plugins: [
    // Add Tailwind CSS plugins here if desired
  ],
}

export default config
