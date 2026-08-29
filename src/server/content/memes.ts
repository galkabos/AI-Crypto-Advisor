import type { CryptoMeme } from "./types.js";

const memes: CryptoMeme[] = [
  {
    id: "zoom-out",
    headline: "When the 5-minute chart looks scary",
    punchline: "The HODLer quietly opens the weekly chart."
  },
  {
    id: "gas-fees",
    headline: "Me: this swap is basically free",
    punchline: "Network fees: let me introduce myself."
  },
  {
    id: "portfolio-refresh",
    headline: "Refreshing the portfolio every 12 seconds",
    punchline: "For research purposes, obviously."
  },
  {
    id: "dip-dip",
    headline: "Bought the dip",
    punchline: "Then the dip opened a basement."
  },
  {
    id: "whitepaper",
    headline: "I read the whitepaper",
    punchline: "Translation: I skimmed the tokenomics chart."
  }
];

export function getRandomMeme() {
  return memes[Math.floor(Math.random() * memes.length)];
}
