export interface TreeNode {
  name: string;
  edgeColor?: string;
  children?: TreeNode[];
}

/**
 * For dimension=2 => directions = [a, b, a^-, b^-].
 * (a,a^-) share color1, (b,b^-) share color2.
 */
interface DirSpec {
  label: string; // e.g. "a" or "a^-"
  opposite: string; // e.g. a^- is opposite a
  color: string; // pairs share the same color
}

/**
 * Returns the dimension=2 direction array in order: [a, b, a^-, b^-].
 * (a, a^-) => color #1f77b4
 * (b, b^-) => color #ff7f0e
 */
function getDirList(): DirSpec[] {
  return [
    { label: "a", opposite: "a^-", color: "#1f77b4" },
    { label: "b", opposite: "b^-", color: "#ff7f0e" },
    { label: "a^-", opposite: "a", color: "#1f77b4" },
    { label: "b^-", opposite: "b", color: "#ff7f0e" },
  ];
}

/**
 * Recursively builds a Cayley tree (hierarchical data).
 * - We skip if dir.opposite === fromDir (avoid immediate backtracking).
 * - We store dir.color in the child's edgeColor.
 * - 'step' shrinks each depth so branches get smaller outward.
 */
export function buildCayleyTreeData(
  x: number,
  y: number,
  depth: number,
  maxDepth: number,
  fromDir: string | null, // which direction we used to arrive here
  step: number
): TreeNode {
  const node: TreeNode = {
    name: `${x},${y}`,
    children: [],
  };

  if (depth >= maxDepth) {
    delete node.children;
    return node;
  }

  const dirList = getDirList(); // [a, b, a^-, b^-]

  for (const dir of dirList) {
    if (dir.opposite === fromDir) {
      // skip going back the same way
      continue;
    }

    // define how each label moves in (x,y):
    // a => up => dy = -1
    // a^- => down => dy=+1
    // b => right => dx=+1
    // b^- => left => dx=-1
    let dx = 0,
      dy = 0;
    if (dir.label === "a") {
      dx = 0;
      dy = -1;
    }
    if (dir.label === "a^-") {
      dx = 0;
      dy = +1;
    }
    if (dir.label === "b") {
      dx = +1;
      dy = 0;
    }
    if (dir.label === "b^-") {
      dx = -1;
      dy = 0;
    }

    const nx = x + dx * step;
    const ny = y + dy * step;

    // build child
    const child = buildCayleyTreeData(
      nx,
      ny,
      depth + 1,
      maxDepth,
      dir.label,
      step * 0.5
    );
    // store color => child's edge color
    child.edgeColor = dir.color;

    node.children!.push(child);
  }

  return node;
}
