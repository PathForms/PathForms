"use client";
import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";

/** Define four directions along with their opposites and symbols */
const directions = {
  up:    { dx:  0, dy: -1, opposite: "down",  symbol: "a"  },
  down:  { dx:  0, dy:  1, opposite: "up",    symbol: "a-" },
  left:  { dx: -1, dy:  0, opposite: "right", symbol: "b-" },
  right: { dx:  1, dy:  0, opposite: "left",  symbol: "b"  },
};
type DirKey = keyof typeof directions;

/** Determine if two symbols are opposites (used for backtracking) */
function isOppositeSymbol(newSymbol: string, lastSymbol: string) {
  return (
    (newSymbol === "a-" && lastSymbol === "a") ||
    (newSymbol === "a" && lastSymbol === "a-") ||
    (newSymbol === "b-" && lastSymbol === "b") ||
    (newSymbol === "b" && lastSymbol === "b-")
  );
}

/** Flip a single symbol, e.g., a -> a-, a- -> a, b -> b-, b- -> b */
function flipSymbol(sym: string): string {
  switch (sym) {
    case "a":  return "a-";
    case "a-": return "a";
    case "b":  return "b-";
    case "b-": return "b";
    default:   return sym; // fallback
  }
}

/** Flip every symbol in the entire path (symbol string) */
function flipPathString(pathStr: string): string {
  // Use regex to split "a", "a-", "b", "b-" and then map to flip
  const parts = pathStr.match(/(a-|a|b-|b)/g) || [];
  const flippedParts = parts.map(flipSymbol);
  return flippedParts.join("");
}

/** Node structure */
interface NodeSim {
  id: string;
  initX: number;
  initY: number;
  x: number;
  y: number;
  depth: number;
  step: number;
}

/** Edge structure */
interface LinkSim {
  id: string;
  source: NodeSim;
  target: NodeSim;
  direction: DirKey;
}

/** Each saved path */
interface SavedPath {
  pathStr: string;
  nodeIds: string[];
  edgeIds: string[];
}

function parsePathBySymbols(
  pathStr: string,
  nodeMap: Map<string, NodeSim>,
  linkMap: Map<string, LinkSim>
): { nodeIds: string[]; edgeIds: string[] } {
  // 1) Use regex to split a, a-, b, b-
  const parts = pathStr.match(/(a-|a|b-|b)/g) || [];
  const nodeIds: string[] = [];
  const edgeIds: string[] = [];

  // 2) Find the origin
  const origin = nodeMap.get("0,0");
  if (!origin) {
    return { nodeIds, edgeIds };
  }
  let current = origin;
  nodeIds.push(current.id);

  // 3) Process each symbol sequentially
  for (let i = 0; i < parts.length; i++) {
    const sym = parts[i];
    let dirKey: DirKey | null = null;
    if (sym === "a")  dirKey = "up";
    if (sym === "a-") dirKey = "down";
    if (sym === "b")  dirKey = "right";
    if (sym === "b-") dirKey = "left";

    if (!dirKey) continue;
    const { dx, dy } = directions[dirKey];
    // Use current node's step
    const nx = current.initX + dx * current.step;
    const ny = current.initY + dy * current.step;
    const neighborId = `${nx},${ny}`;
    const edgeId = `${current.id}->${neighborId}`;

    // Check if exists in nodeMap / linkMap
    if (nodeMap.has(neighborId) && linkMap.has(edgeId)) {
      edgeIds.push(edgeId);
      nodeIds.push(neighborId);
      current = nodeMap.get(neighborId)!;
    } else {
      // If not matched, break
      break;
    }
  }
  return { nodeIds, edgeIds };
}

/** Recursively generate Cayley Tree */
function buildCayleyTree(
  nodeMap: Map<string, NodeSim>,
  linkMap: Map<string, LinkSim>,
  x: number,
  y: number,
  depth: number,
  maxDepth: number,
  fromDir: DirKey | null,
  step: number
) {
  const nodeId = `${x},${y}`;
  if (!nodeMap.has(nodeId)) {
    nodeMap.set(nodeId, {
      id: nodeId,
      initX: x,
      initY: y,
      x: 0,
      y: 0,
      depth,
      step,
    });
  }
  const parent = nodeMap.get(nodeId)!;

  if (depth >= maxDepth) return;

  // Generate in four directions
  for (const [dirName, info] of Object.entries(directions) as [
    DirKey,
    { dx: number; dy: number; opposite: DirKey; symbol: string }
  ][]) {
    if (fromDir && info.opposite === fromDir) continue;
    const nx = x + info.dx * step;
    const ny = y + info.dy * step;
    const childId = `${nx},${ny}`;

    if (!nodeMap.has(childId)) {
      nodeMap.set(childId, {
        id: childId,
        initX: nx,
        initY: ny,
        x: 0,
        y: 0,
        depth: depth + 1,
        step: step * 0.5,
      });
    }
    const child = nodeMap.get(childId)!;

    const edgeId = `${nodeId}->${childId}`;
    if (!linkMap.has(edgeId)) {
      linkMap.set(edgeId, {
        id: edgeId,
        source: parent,
        target: child,
        direction: dirName,
      });
    }

    buildCayleyTree(
      nodeMap,
      linkMap,
      nx,
      ny,
      depth + 1,
      maxDepth,
      dirName,
      step * 0.5
    );
  }
}

/** Vertex component */
function Vertex(props: {
  id: string;
  x: number; 
  y: number;
  isHighlighted: boolean; // mouse hover
  isShined: boolean;      // click highlight
  inProgress: boolean;    // part of the current path
  savedPathIndex: number | null; // if belongs to a saved path
  onHover: (id: string, hover: boolean) => void;
  onClick: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const {
    id, x, y,
    isHighlighted, isShined,
    inProgress, savedPathIndex,
    onHover, onClick
  } = props;

  const handleMouseEnter = () => {
    setHovered(true);
    onHover(id, true);
  };
  const handleMouseLeave = () => {
    setHovered(false);
    onHover(id, false);
  };
  const handleClick = () => onClick(id);

  let fillColor = "lightblue";
  let dashStyle: React.CSSProperties = {};

  // 1) If part of the current path -> black color + dashed line
  if (inProgress) {
    fillColor = "black";
    dashStyle = {
      strokeDasharray: "2,2",
      animation: "dash 1s linear infinite",
    };
  }
  // 2) Otherwise, if part of a saved path -> assign color + dashed line
  else if (savedPathIndex !== null) {
    const colorPalette = ["red", "blue", "green", "orange", "purple", "tomato"];
    fillColor = colorPalette[savedPathIndex % colorPalette.length];
    dashStyle = {
      strokeDasharray: "2,2",
      animation: "dash 1s linear infinite",
    };
  }

  // 3) Mouse hover / click override
  if (hovered) {
    fillColor = "orange";
  } else if (isShined) {
    fillColor = "gold";
  } else if (isHighlighted) {
    fillColor = "#007acc";
  }

  return (
    <circle
      cx={x}
      cy={y}
      r={0.7}
      fill={fillColor}
      style={{ cursor: "pointer", ...dashStyle }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    />
  );
}

/** Edge component */
function Edge(props: {
  id: string;
  direction: DirKey;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  isHighlighted: boolean; // hover
  inProgress: boolean;    // current path
  savedPathIndex: number | null;
  onHover?: (hovered: boolean) => void;
}) {
  const {
    id, direction,
    sourceX, sourceY,
    targetX, targetY,
    isHighlighted, inProgress,
    savedPathIndex, onHover
  } = props;

  let strokeColor = "#999";
  let dashStyle: React.CSSProperties = {};

  // 1) Current path -> black dashed line
  if (inProgress) {
    strokeColor = "black";
    dashStyle = {
      strokeDasharray: "2,2",
      animation: "dash 1s linear infinite",
    };
  }
  // 2) Saved path -> assign color + dashed line
  else if (savedPathIndex !== null) {
    const colorPalette = ["red", "blue", "green", "orange", "purple", "tomato"];
    strokeColor = colorPalette[savedPathIndex % colorPalette.length];
    dashStyle = {
      strokeDasharray: "2,2",
      animation: "dash 1s linear infinite",
    };
  }
  // 3) Otherwise -> assign default color based on direction
  else {
    if (direction === "up" || direction === "down") {
      strokeColor = "pink";
    } else if (direction === "left" || direction === "right") {
      strokeColor = "yellow";
    }
  }

  // Hover override
  if (isHighlighted) {
    strokeColor = "orange";
  }

  const handleMouseEnter = () => onHover?.(true);
  const handleMouseLeave = () => onHover?.(false);

  return (
    <line
      x1={sourceX}
      y1={sourceY}
      x2={targetX}
      y2={targetY}
      stroke={strokeColor}
      strokeWidth={0.5}
      style={dashStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
}

/** Main component */
export default function CayleyTree() {
  // Full screen dimensions
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Node and link data
  const [nodes, setNodes] = useState<NodeSim[]>([]);
  const [links, setLinks] = useState<LinkSim[]>([]);

  // **Adjacency list**: used for BFS
  const adjListRef = useRef<Record<string, { neighborId: string; direction: DirKey }[]>>({});

  // Hover, highlight, selected
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [shinedId, setShinedId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeSim | null>(null);

  // The path currently being drawn
  const [pathNodes, setPathNodes] = useState<string[]>([]);
  const [pathEdges, setPathEdges] = useState<string[]>([]);
  const [pathSymbols, setPathSymbols] = useState<string[]>([]);

  // All saved paths
  const [savedPaths, setSavedPaths] = useState<SavedPath[]>([]);
  const [highlightedNodesMap, setHighlightedNodesMap] = useState<Record<string, number>>({});
  const [highlightedEdgesMap, setHighlightedEdgesMap] = useState<Record<string, number>>({});

  // Index of the selected path (for inverse operation)
  const [selectedPathIndex, setSelectedPathIndex] = useState<number | null>(null);

  // d3 references
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);

  // Store Maps
  const nodeMapRef = useRef(new Map<string, NodeSim>());
  const linkMapRef = useRef(new Map<string, LinkSim>());

  //---------------------------------------------------
  // 1) Initialization: Build Cayley Tree + Adjacency list
  //---------------------------------------------------
  useEffect(() => {
    const nodeMap = new Map<string, NodeSim>();
    const linkMap = new Map<string, LinkSim>();

    buildCayleyTree(nodeMap, linkMap, 0, 0, 0, 5, null, 50);

    // Center (0,0)
    const cx = size.width / 2;
    const cy = size.height / 2;
    for (let nd of nodeMap.values()) {
      nd.x = nd.initX + cx;
      nd.y = nd.initY + cy;
    }
    nodeMapRef.current = nodeMap;
    linkMapRef.current = linkMap;
    setNodes([...nodeMap.values()]);
    setLinks([...linkMap.values()]);

    // **Adjacency list**: prepare for BFS
    const adjList: Record<string, { neighborId: string; direction: DirKey }[]> = {};
    for (let lk of linkMap.values()) {
      const sId = lk.source.id;
      const tId = lk.target.id;
      const dir = lk.direction;
      // Forward
      if (!adjList[sId]) adjList[sId] = [];
      adjList[sId].push({ neighborId: tId, direction: dir });
      // Reverse
      const oppDir = directions[dir].opposite;
      if (!adjList[tId]) adjList[tId] = [];
      adjList[tId].push({ neighborId: sId, direction: oppDir });
    }
    adjListRef.current = adjList;

    // Select the origin by default
    const origin = nodeMap.get("0,0") || null;
    setSelectedNode(origin);
    setPathNodes(origin ? [origin.id] : []);
    setPathEdges([]);
    setPathSymbols([]);
  }, [size]);

  //---------------------------------------------------
  // 2) d3-zoom
  //---------------------------------------------------
  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;
    const svgSelection = d3.select(svgRef.current);
    const gSelection = d3.select(gRef.current);

    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on("zoom", (event) => {
        gSelection.attr("transform", event.transform);
      });

    svgSelection.call(zoomBehavior as any);
    fitToScreen();
  }, [nodes, links]);

  //---------------------------------------------------
  // 3) fitToScreen
  //---------------------------------------------------
  const fitToScreen = () => {
    if (!gRef.current || nodes.length === 0) return;
    const selection = d3.select(gRef.current);
    selection.attr("transform", null);

    const bbox = gRef.current.getBBox();
    const { x, y, width, height } = bbox;
    if (width === 0 || height === 0) return;

    const margin = 20;
    const w = size.width;
    const h = size.height;

    const scale = Math.min(
      w / (width + 2 * margin),
      h / (height + 2 * margin)
    );
    const translateX = w / 2 - scale * (x + width / 2);
    const translateY = h / 2 - scale * (y + height / 2);

    selection.attr("transform", `translate(${translateX}, ${translateY}) scale(${scale})`);
  };

  //---------------------------------------------------
  // 4) Hover and click
  //---------------------------------------------------
  const handleHover = (id: string, hover: boolean) => {
    setHighlightedId(hover ? id : null);
  };
  const handleClick = (id: string) => {
    setShinedId(prev => (prev === id ? null : id));
    setSelectedNode(nodeMapRef.current.get(id) || null);
  };

  //---------------------------------------------------
  // 5) Manually click direction buttons
  //---------------------------------------------------
  const handleDirection = (dirKey: DirKey) => {
    if (!selectedNode) return;
    const newSymbol = directions[dirKey].symbol;
    // Check for backtracking
    if (pathSymbols.length > 0) {
      const lastSymbol = pathSymbols[pathSymbols.length - 1];
      if (isOppositeSymbol(newSymbol, lastSymbol)) {
        // Backtracking
        setPathSymbols(prev => prev.slice(0, -1));
        setPathEdges(prev => prev.slice(0, -1));
        setPathNodes(prev => {
          const newPath = prev.slice(0, -1);
          const backId = newPath[newPath.length - 1];
          setSelectedNode(nodeMapRef.current.get(backId) || null);
          return newPath;
        });
        return;
      }
    }

    // Otherwise, proceed normally
    const { initX, initY, step } = selectedNode;
    const { dx, dy } = directions[dirKey];
    const nx = initX + dx * step;
    const ny = initY + dy * step;
    const neighborId = `${nx},${ny}`;
    const edgeId = `${selectedNode.id}->${neighborId}`;
    if (nodeMapRef.current.has(neighborId) && linkMapRef.current.has(edgeId)) {
      setPathNodes(prev => [...prev, neighborId]);
      setPathEdges(prev => [...prev, edgeId]);
      setPathSymbols(prev => [...prev, newSymbol]);
      setSelectedNode(nodeMapRef.current.get(neighborId) || null);
    }
  };

  //---------------------------------------------------
  // 6) Save the current manual path
  //---------------------------------------------------
  const handleSavePath = () => {
    const pathStr = pathSymbols.join("");
    if (!pathStr) {
      alert("No path drawn currently.");
      return;
    }
    const newPath: SavedPath = {
      pathStr,
      nodeIds: [...pathNodes],
      edgeIds: [...pathEdges],
    };
    const updated = [...savedPaths, newPath];
    setSavedPaths(updated);
    buildHighlightMaps(updated);

    // Clear and return to the origin
    const origin = nodeMapRef.current.get("0,0") || null;
    setSelectedNode(origin);
    setPathNodes(origin ? [origin.id] : []);
    setPathEdges([]);
    setPathSymbols([]);

    alert(`Saved manual path: ${pathStr}`);
  };

  //---------------------------------------------------
  // 7) One-click draw path from (0,0) to current selected node
  //---------------------------------------------------
  const handleDrawPath = () => {
    if (!selectedNode) {
      alert("Please select a target node on the canvas first!");
      return;
    }
    if (selectedNode.id === "0,0") {
      alert("The node is the origin; no need to auto-draw.");
      return;
    }

    const originId = "0,0";
    const targetId = selectedNode.id;
    const adj = adjListRef.current;

    // BFS
    const queue: string[] = [originId];
    const visited = new Set<string>([originId]);
    // prevMap: record (node -> [parent node, direction DirKey])
    const prevMap = new Map<string, [string, DirKey]>();

    let found = false;
    while (queue.length) {
      const cur = queue.shift()!;
      if (cur === targetId) {
        found = true;
        break;
      }
      const neighbors = adj[cur] || [];
      for (let { neighborId, direction } of neighbors) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push(neighborId);
          prevMap.set(neighborId, [cur, direction]);
        }
      }
    }

    if (!found) {
      alert("The node cannot be reached (theoretically should not happen).");
      return;
    }

    // Backtrack to get node sequence, edge sequence, symbol sequence
    const nodeIds: string[] = [];
    const edgeIds: string[] = [];
    const symbols: string[] = [];

    let curId = targetId;
    nodeIds.push(curId);

    while (curId !== originId) {
      const [parentId, dirKey] = prevMap.get(curId)!;
      // direction -> symbol
      const symbol = directions[dirKey].symbol;
      symbols.push(symbol);

      edgeIds.push(`${parentId}->${curId}`);
      curId = parentId;
      nodeIds.push(curId);
    }
    // Currently, nodeIds is from target to origin; need to reverse
    nodeIds.reverse();
    edgeIds.reverse();
    symbols.reverse();

    const pathStr = symbols.join("");
    // Save to savedPaths
    const newPath: SavedPath = { pathStr, nodeIds, edgeIds };
    const updated = [...savedPaths, newPath];
    setSavedPaths(updated);
    buildHighlightMaps(updated);

    alert(`Automatically drawn path: ${pathStr}`);
  };

  //---------------------------------------------------
  // 8) Inverse the selected path
  //---------------------------------------------------
  const handleInverseSelected = () => {
    if (selectedPathIndex === null) {
      alert("Please select a path to inverse first!");
      return;
    }
    if (selectedPathIndex < 0 || selectedPathIndex >= savedPaths.length) {
      alert("Invalid path index!");
      return;
    }

    const newPaths = [...savedPaths];
    const targetPath = newPaths[selectedPathIndex];

    // Flip the symbol string
    const flippedStr = flipPathString(targetPath.pathStr);
    // Recalculate nodes/edges
    const { nodeIds, edgeIds } = parsePathBySymbols(flippedStr, nodeMapRef.current, linkMapRef.current);

    targetPath.pathStr = flippedStr;
    targetPath.nodeIds = nodeIds;
    targetPath.edgeIds = edgeIds;

    setSavedPaths(newPaths);
    buildHighlightMaps(newPaths);
  };

  //---------------------------------------------------
  // 9) Generate highlight mapping
  //---------------------------------------------------
  const buildHighlightMaps = (paths: SavedPath[]) => {
    const nMap: Record<string, number> = {};
    const eMap: Record<string, number> = {};

    paths.forEach((p, i) => {
      p.nodeIds.forEach(nd => {
        if (nMap[nd] === undefined) {
          nMap[nd] = i;
        }
      });
      p.edgeIds.forEach(ed => {
        if (eMap[ed] === undefined) {
          eMap[ed] = i;
        }
      });
    });

    setHighlightedNodesMap(nMap);
    setHighlightedEdgesMap(eMap);
  };

  //---------------------------------------------------
  // Render
  //---------------------------------------------------
  return (
    <div style={{ width: "100vw", height: "100vh", margin: 0, padding: 0 }}>
      {/* Dashed line animation */}
      <style jsx global>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -10;
          }
        }
      `}</style>

      {/* Control Panel */}
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 999, background: "#eee", padding: "10px" }}>
        <div>
          <strong>Current Node</strong>: {selectedNode ? `(${selectedNode.initX},${selectedNode.initY})` : "None"}
        </div>
        <div style={{ marginTop: "6px" }}>
          <button onClick={() => handleDirection("up")}>Up (a)</button>
          <button onClick={() => handleDirection("down")}>Down (a-)</button>
          <button onClick={() => handleDirection("left")}>Left (b-)</button>
          <button onClick={() => handleDirection("right")}>Right (b)</button>
        </div>
        <div style={{ marginTop: "6px" }}>
          <strong>Current manual path</strong>: {pathSymbols.join("")}
        </div>
        <div style={{ marginTop: "6px" }}>
          <button onClick={handleSavePath}>Save manual path</button>
        </div>

        <hr style={{ margin: "8px 0" }}/>

        {/* New: One-click draw path */}
        <div>
          <button onClick={handleDrawPath}>Draw path from (0,0) to current node</button>
        </div>

        {/* Saved paths */}
        <div style={{ marginTop: "10px" }}>
          <strong>Saved paths (select to inverse)</strong>:
          <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
            {savedPaths.map((p, i) => (
              <li key={i}>
                <label style={{ cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="savedPath"
                    checked={selectedPathIndex === i}
                    onChange={() => setSelectedPathIndex(i)}
                    style={{ marginRight: "6px" }}
                  />
                  Path{i + 1}: {p.pathStr}
                </label>
              </li>
            ))}
          </ul>
          <button style={{ marginTop: "6px" }} onClick={handleInverseSelected}>
            Inverse selected path
          </button>
        </div>
      </div>

      {/* Main SVG canvas */}
      <svg
        ref={svgRef}
        width={size.width}
        height={size.height}
        style={{ display: "block", background: "#fff" }}
      >
        <g ref={gRef}>
          {/* Draw edges */}
          {links.map(lk => {
            const edgeId = lk.id;
            const inProgress = pathEdges.includes(edgeId);
            const savedIndex = highlightedEdgesMap[edgeId] !== undefined
              ? highlightedEdgesMap[edgeId]
              : null;

            return (
              <Edge
                key={edgeId}
                id={edgeId}
                direction={lk.direction}
                sourceX={lk.source.x}
                sourceY={lk.source.y}
                targetX={lk.target.x}
                targetY={lk.target.y}
                isHighlighted={highlightedId === edgeId}
                inProgress={inProgress}
                savedPathIndex={savedIndex}
                onHover={(hover) => handleHover(edgeId, hover)}
              />
            );
          })}

          {/* Draw nodes */}
          {nodes.map(nd => {
            const nodeId = nd.id;
            const inProgress = pathNodes.includes(nodeId);
            const savedIndex = highlightedNodesMap[nodeId] !== undefined
              ? highlightedNodesMap[nodeId]
              : null;

            return (
              <Vertex
                key={nodeId}
                id={nodeId}
                x={nd.x}
                y={nd.y}
                isHighlighted={highlightedId === nodeId}
                isShined={shinedId === nodeId}
                inProgress={inProgress}
                savedPathIndex={savedIndex}
                onHover={handleHover}
                onClick={handleClick}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
