// For rank 3: 6 directions
// Mapping: up=a, down=a^-1, right-up=b, left-down=b^-1, right-down=c, left-up=c^-1
export type Direction3 = "up" | "down" | "left-up" | "right-down" | "left-down" | "right-up";

const oppositeMoves: Record<Direction3, Direction3> = {
  up: "down",
  down: "up",
  "right-up": "left-down",
  "left-down": "right-up",
  "right-down": "left-up",
  "left-up": "right-down",
};

export function reduceMoves(moves: Direction3[]): Direction3[] {
  const stack: Direction3[] = [];
  for (const move of moves) {
    if (stack.length > 0 && oppositeMoves[stack[stack.length - 1]] === move) {
      stack.pop();
    } else {
      stack.push(move);
    }
  }
  return stack;
}

export function concatenate(path1: Direction3[], path2: Direction3[]): Direction3[] {
  return reduceMoves([...path1, ...path2]);
}

export function invert(path: Direction3[]): Direction3[] {
  return path.slice().reverse().map((move) => oppositeMoves[move]);
}

