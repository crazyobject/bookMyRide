// utils/colorUtils.js

/**
 * Generates a random hex color code.
 * @returns {string} A hex color code in the format '#RRGGBB'.
 */
export const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};
