// src/utils/directions.ts
import { getRank2Color, getRank3Color } from "./colorConfig";

/**
 * DirectionDef holds a label, its opposite, and a shared color.
 * (a, a^-) => same color, (b, b^-) => same color, etc.
 */
export interface DirectionDef {
  label: string; // e.g. "a" or "a^-"
  opposite: string; // e.g. "a^-" is opposite of "a"
  color: string; // same color for a & a^-
}

/**
 * Build rank 2 directions - colors from centralized config
 */
export function buildDirections2(): DirectionDef[] {
  return [
    { label: "a", opposite: "a^-", color: getRank2Color("a") },
    { label: "b", opposite: "b^-", color: getRank2Color("b") },
    { label: "a^-", opposite: "a", color: getRank2Color("a^-") },
    { label: "b^-", opposite: "b", color: getRank2Color("b^-") },
  ];
}

/**
 * Build rank 3 directions - colors from centralized config
 */
export function buildDirections3(): DirectionDef[] {
  return [
    { label: "a", opposite: "a^-", color: getRank3Color("a") },
    { label: "b", opposite: "b^-", color: getRank3Color("b") },
    { label: "c", opposite: "c^-", color: getRank3Color("c") },
    { label: "a^-", opposite: "a", color: getRank3Color("a^-") },
    { label: "b^-", opposite: "b", color: getRank3Color("b^-") },
    { label: "c^-", opposite: "c", color: getRank3Color("c^-") },
  ];
}
