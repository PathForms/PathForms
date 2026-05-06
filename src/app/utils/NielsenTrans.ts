export type Direction = "up" | "down" | "left" | "right";
export type Direction3 =
  | "up"
  | "down"
  | "left-up"
  | "right-down"
  | "left-down"
  | "right-up";

type DirectionUnion = Direction | Direction3;

const oppositeMoves: Record<DirectionUnion, DirectionUnion> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
  "right-up": "left-down",
  "left-down": "right-up",
  "right-down": "left-up",
  "left-up": "right-down",
};

export function reduceMoves<T extends DirectionUnion>(moves: T[]): T[] {
  const stack: DirectionUnion[] = [];
  for (const move of moves) {
    if (stack.length > 0 && oppositeMoves[stack[stack.length - 1]] === move) {
      stack.pop();
    } else {
      stack.push(move);
    }
  }
  return stack as T[];
}

export function concatenate<T extends DirectionUnion>(
  path1: T[],
  path2: T[]
): T[] {
  return reduceMoves<T>([...path1, ...path2]);
}

export function invert<T extends DirectionUnion>(path: T[]): T[] {
  return path
    .slice()
    .reverse()
    .map((move) => oppositeMoves[move]) as T[];
}

export function checkNielsenReduced<T extends DirectionUnion>(
  paths: T[][]
): boolean[] {
  const reducedPaths = paths.map((p) => reduceMoves(p));
  const result: boolean[] = [true, true, true];

  // N0: No path is empty
  if (reducedPaths.some((path) => path.length === 0)) {
    result[0] = false;
  }

  // N1: Pairwise minimality
  if (result[1]) {
    outerN1: for (let i = 0; i < reducedPaths.length; i++) {
      for (let j = 0; j < reducedPaths.length; j++) {
        if (i === j) continue;
        const variants = [reducedPaths[i], invert(reducedPaths[i])];
        const variantsJ = [reducedPaths[j], invert(reducedPaths[j])];

        for (const v1 of variants) {
          const lenV1 = v1.length;
          for (const v2 of variantsJ) {
            const lenV2 = v2.length;
            const product = concatenate(v1, v2);
            if (product.length === 0) continue;
            if (product.length < lenV1 || product.length < lenV2) {
              result[1] = false;
              break outerN1;
            }
          }
        }
      }
    }
  }

  // N2: Triple commutation constraint
  if (result[2]) {
    outerN2: for (let i = 0; i < reducedPaths.length; i++) {
      for (let j = 0; j < reducedPaths.length; j++) {
        if (i === j) continue;
        for (let k = 0; k < reducedPaths.length; k++) {
          if (k === i || k === j) continue;

          const variantsI = [reducedPaths[i], invert(reducedPaths[i])];
          const variantsJ = [reducedPaths[j], invert(reducedPaths[j])];
          const variantsK = [reducedPaths[k], invert(reducedPaths[k])];

          for (const v1 of variantsI) {
            const lenV1 = v1.length;
            for (const v2 of variantsJ) {
              const lenV2 = v2.length;
              const v1v2 = concatenate(v1, v2);
              if (v1v2.length === 0) continue;

              for (const v3 of variantsK) {
                const lenV3 = v3.length;
                const v2v3 = concatenate(v2, v3);
                if (v2v3.length === 0) continue;

                const v1v2v3 = concatenate(v1v2, v3);
                if (v1v2v3.length <= lenV1 - lenV2 + lenV3) {
                  result[2] = false;
                  break outerN2;
                }
              }
            }
          }
        }
      }
    }
  }

  return result;
}
