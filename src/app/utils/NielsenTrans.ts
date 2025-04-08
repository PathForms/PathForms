export type Direction = "up" | "down" | "left" | "right";

const oppositeMoves: Record<Direction, Direction> = {
    up: "down",
    down: "up",
    left: "right",
    right: "left",
  };
  
  export function reduceMoves(moves: Direction[]): Direction[] {
      const stack: Direction[] = [];
      for (const move of moves) {
        if (stack.length > 0 && oppositeMoves[stack[stack.length - 1]] === move) {
          stack.pop();
        } else {
          stack.push(move);
        }
      }
      return stack;
  }
  
  export function concatenate(path1: Direction[], path2: Direction[]): Direction[] {
      return reduceMoves([...path1, ...path2]);
  }
  
  export function invert(path: Direction[]): Direction[] {
      return path.slice().reverse().map((move) => oppositeMoves[move]);
  }