// For rank 3: 6 directions
// Mapping: up=a, down=a^-1, right-up=b, left-down=b^-1, right-down=c, left-up=c^-1
type Direction3 = "up" | "down" | "left-up" | "right-down" | "left-down" | "right-up";

function buildNodesEdgesFromMoves3(moves: Direction3[], startNode: string = "0,0") {
  let newNodes: string[] = [startNode];
  let newEdges: string[] = [];
  const sqrt3over2 = 0.86602540378; // √3/2
  
  for (let i = 0; i < moves.length; i++) {
    const dir = moves[i];
    const [x, y] = newNodes[newNodes.length - 1].split(",").map(Number);
    let next: [number, number] = [x, y];
    const step = 100.0 / 2 ** (newNodes.length - 1);
    
    switch (dir) {
      case "up":
        next = [x, y - step]; // a
        break;
      case "down":
        next = [x, y + step]; // a^-1
        break;
      case "right-up":
        next = [x + sqrt3over2 * step, y - 0.5 * step]; // b
        break;
      case "left-down":
        next = [x - sqrt3over2 * step, y + 0.5 * step]; // b^-1
        break;
      case "right-down":
        next = [x + sqrt3over2 * step, y + 0.5 * step]; // c
        break;
      case "left-up":
        next = [x - sqrt3over2 * step, y - 0.5 * step]; // c^-1
        break;
    }
    const nextNode = `${next[0]},${next[1]}`;
    newNodes.push(nextNode);
    newEdges.push(`${x},${y}->${next[0]},${next[1]}`);
  }
  return { newNodes, newEdges };
}

export default buildNodesEdgesFromMoves3;
export type { Direction3 };

