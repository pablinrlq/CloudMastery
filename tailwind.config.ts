import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

// Workspace tokens are CSS variables defined on `.cm-workspace` (app/globals.css)
// and flipped per theme, so `bg-ws-surface` & co. need no `dark:` variant.
const ws = (name: string) => `rgb(var(--ws-${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx,mdx}",
    "./src/components/**/*.{ts,tsx}",
    "./content/**/*.mdx",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Consolas", "monospace"],
      },
      colors: {
        ws: {
          canvas: ws("canvas"),
          surface: ws("surface"),
          raised: ws("raised"),
          sunken: ws("sunken"),
          ink: ws("ink"),
          text: ws("text"),
          muted: ws("muted"),
          subtle: ws("subtle"),
          line: ws("line"),
          accent: ws("accent"),
          "accent-ink": ws("accent-ink"),
          indigo: ws("indigo"),
          "indigo-ink": ws("indigo-ink"),
          success: ws("success"),
          "success-ink": ws("success-ink"),
          danger: ws("danger"),
          "danger-ink": ws("danger-ink"),
          warn: ws("warn"),
          "warn-ink": ws("warn-ink"),
        },
      },
    },
  },
  plugins: [typography],
};

export default config;
