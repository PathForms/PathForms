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
