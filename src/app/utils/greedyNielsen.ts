import { reduceMoves, concatenate, invert } from "./NielsenTrans";
export type Direction = "up" | "down" | "left" | "right";

/**
 * Computes the greedy Nielsen reduction step count for a set of already reduced paths.
 * Each step chooses the concatenation (with optional inversion of either path) that
 * yields the largest reduction in the length of the first path, applies it, and repeats
 * until no further reduction is possible. Only concatenation counts as a step;
 * inversion is free.
 *
 * @param initialPaths Array of free-reduced paths (words) to reduce
 * @returns Number of concatenation steps taken by the greedy algorithm
 */
export function greedyNielsenSteps(initialPaths: Direction[][]): number {
  // Copy inputs to avoid mutating original arrays
  let paths = initialPaths.map(path => [...path]);
  let steps = 0;

  while (true) {
    let bestDelta = 0;
    let bestIndex = -1;
    let bestConcatPath: Direction[] = [];

    // Try all ordered pairs (i, j) with i != j
    for (let i = 0; i < paths.length; i++) {
      for (let j = 0; j < paths.length; j++) {
        if (i === j) continue;

        // Generate all four variants:
        // 1) path_i + path_j
        // 2) invert(path_i) + path_j
        // 3) path_i + invert(path_j)
        // 4) invert(path_i) + invert(path_j)
        const variants: Direction[][] = [
          concatenate(paths[i], paths[j]),
          concatenate(invert(paths[i]), paths[j]),
          concatenate(paths[i], invert(paths[j])),
          concatenate(invert(paths[i]), invert(paths[j]))
        ];

        // Choose the shortest result among variants
        let candidate = variants.reduce((a, b) => a.length <= b.length ? a : b);
        const delta = paths[i].length - candidate.length;

        if (delta > bestDelta) {
          bestDelta = delta;
          bestIndex = i;
          bestConcatPath = candidate;
        }
      }
    }

    // No positive reduction found => we're done
    if (bestDelta <= 0) break;

    // Apply the best concatenation and count a step
    paths[bestIndex] = bestConcatPath;
    steps++;
  }

  return steps;
}
