type Direction = "up" | "down" | "left" | "right";

function buildNodesEdgesFromMoves(moves: Direction[], startNode: string = "0,0") {
  let newNodes: string[] = [startNode];
  let newEdges: string[] = [];
  for (let i = 0; i < moves.length; i++) {
    const dir = moves[i];
    const [x, y] = newNodes[newNodes.length - 1].split(",").map(Number);
    let next: [number, number] = [x, y];
    switch (dir) {
      case "up":
        next = [x, y + 100.0 / 2 ** (newNodes.length - 1)];
        break;
      case "down":
        next = [x, y - 100.0 / 2 ** (newNodes.length - 1)];
        break;
      case "left":
        next = [x - 100.0 / 2 ** (newNodes.length - 1), y];
        break;
      case "right":
        next = [x + 100.0 / 2 ** (newNodes.length - 1), y];
        break;
    }
    const nextNode = `${next[0]},${next[1]}`;
    newNodes.push(nextNode);
    newEdges.push(`${x},${y}->${next[0]},${next[1]}`);
  }
  return { newNodes, newEdges };
}

export default buildNodesEdgesFromMoves;
