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
