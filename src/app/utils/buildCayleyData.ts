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
 * Returns the dimension=3 direction array for hexagon layout: [a, b, c, a^-, b^-, c^-].
 * (a, a^-) => color red #ff0000
 * (b, b^-) => color green #00ff00
 * (c, c^-) => color purple #800080
 */
function getDirList3(): DirSpec[] {
  return [
    { label: "a", opposite: "a^-", color: "#ff0000" }, // red
    { label: "b", opposite: "b^-", color: "#00ff00" }, // green
    { label: "c", opposite: "c^-", color: "#800080" }, // purple
    { label: "a^-", opposite: "a", color: "#ff0000" }, // red
    { label: "b^-", opposite: "b", color: "#00ff00" }, // green
    { label: "c^-", opposite: "c", color: "#800080" }, // purple
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

/**
 * Recursively builds a Cayley tree for rank 3 (hexagon layout).
 * - Uses 6 directions: a, b, c, a^-, b^-, c^-
 * - Hexagon layout: a/a^- (up/down), b/b^- (right-up/left-down), c/c^- (right-down/left-up)
 * - Colors: a/a^- red, b/b^- green, c/c^- purple
 */
export function buildCayleyTreeData3(
  x: number,
  y: number,
  depth: number,
  maxDepth: number,
  fromDir: string | null,
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

  const dirList = getDirList3(); // [a, b, c, a^-, b^-, c^-]

  for (const dir of dirList) {
    if (dir.opposite === fromDir) {
      // skip going back the same way
      continue;
    }

    // Hexagon layout: 6 directions
    // a => up (0, -1)
    // a^- => down (0, 1)
    // b => right-up (√3/2, -1/2) ≈ (0.866, -0.5)
    // b^- => left-down (-√3/2, 1/2) ≈ (-0.866, 0.5)
    // c => right-down (√3/2, 1/2) ≈ (0.866, 0.5)
    // c^- => left-up (-√3/2, -1/2) ≈ (-0.866, -0.5)
    let dx = 0,
      dy = 0;
    const sqrt3over2 = 0.86602540378; // √3/2
    
    if (dir.label === "a") {
      dx = 0;
      dy = -1;
    } else if (dir.label === "a^-") {
      dx = 0;
      dy = 1;
    } else if (dir.label === "b") {
      dx = sqrt3over2;
      dy = -0.5;
    } else if (dir.label === "b^-") {
      dx = -sqrt3over2;
      dy = 0.5;
    } else if (dir.label === "c") {
      dx = sqrt3over2;
      dy = 0.5;
    } else if (dir.label === "c^-") {
      dx = -sqrt3over2;
      dy = -0.5;
    }

    const nx = x + dx * step;
    const ny = y + dy * step;

    // build child
    const child = buildCayleyTreeData3(
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
