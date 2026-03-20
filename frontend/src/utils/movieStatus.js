export const getMovieVerdict = (boxOffice) => {
  if (!boxOffice || boxOffice === "N/A") return "Unknown";

  const amount = parseInt(boxOffice.replace(/[^0-9]/g, ""));

  if (amount > 500000000) return "Blockbuster 🔥";
  if (amount > 200000000) return "Hit ✅";
  if (amount > 50000000) return "Average ⚖️";
  return "Flop ❌";
};