/**
 * Centralized color configuration for all directions across Rank 2 and Rank 3
 * This is the SINGLE SOURCE OF TRUTH for all direction colors
 */

// ============= RANK 2 COLORS =============
export const RANK2_COLORS = {
  a: "#008cff", // Blue - rgb(0, 140, 255) - vertical (up/down)
  b: "#fb0047", // Red - rgb(251, 0, 71) - horizontal (left/right)
} as const;

// ============= RANK 3 COLORS =============
export const RANK3_COLORS = {
  a: "#008cff", // Blue - same as rank2 for consistency
  b: "#fb0047", // Red - same as rank2 for consistency
  c: "#00ff00", // Green
} as const;

// ============= HELPER FUNCTIONS =============

/**
 * Get color for a rank 2 direction label
 */
export function getRank2Color(label: string): string {
  if (label === "a" || label === "a^-") return RANK2_COLORS.a;
  if (label === "b" || label === "b^-") return RANK2_COLORS.b;
  return "#666666"; // fallback
}

/**
 * Get color for a rank 3 direction label
 */
export function getRank3Color(
  label: string,
  theme: "dark" | "light" = "dark"
): string {
  if (label === "a" || label === "a^-") return RANK3_COLORS.a;
  if (label === "b" || label === "b^-") return RANK3_COLORS.b;
  if (label === "c" || label === "c^-") return RANK3_COLORS.c;
  return "#666666"; // fallback
}

/**
 * Convert hex color to rgba with opacity
 */
export function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
