// src/utils/directions.ts

/**
 * DirectionDef holds a label, its opposite, and a shared color.
 * (a, a^-) => same color, (b, b^-) => same color, etc.
 */
export interface DirectionDef {
  label: string; // e.g. "a" or "a^-"
  opposite: string; // e.g. "a^-" is opposite of "a"
  color: string; // same color for a & a^-
}

export function buildDirections2(): DirectionDef[] {
  return [
    { label: "a", opposite: "a^-", color: "#1f77b4" },
    { label: "b", opposite: "b^-", color: "#ff7f0e" },
    { label: "a^-", opposite: "a", color: "#1f77b4" },
    { label: "b^-", opposite: "b", color: "#ff7f0e" },
  ];
}

export function buildDirections3(): DirectionDef[] {
  return [
    { label: "a", opposite: "a^-", color: "#ff0000" }, // red
    { label: "b", opposite: "b^-", color: "#00ff00" }, // green
    { label: "c", opposite: "c^-", color: "#800080" }, // purple
    { label: "a^-", opposite: "a", color: "#ff0000" }, // red
    { label: "b^-", opposite: "b", color: "#00ff00" }, // green
    { label: "c^-", opposite: "c", color: "#800080" }, // purple
  ];
}
