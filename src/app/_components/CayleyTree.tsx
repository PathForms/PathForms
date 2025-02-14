"use client";
import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import Edge from "./Edge";
import Vertex from "./Vertex";

/**
 * Directions for the 4-way expansion in a Cayley tree.
 * We skip the opposite direction to avoid immediate backtracking.
 */
const directions = {
  up:    { dx: 0,  dy: -1, opposite: "down"  },
  down:  { dx: 0,  dy:  1, opposite: "up"    },
  left:  { dx: -1, dy:  0, opposite: "right" },
  right: { dx:  1, dy:  0, opposite: "left"  },
};
type DirKey = keyof typeof directions;

/**
 * TreeNode interface for hierarchical data used by d3.hierarchy.
 */
interface TreeNode {
  name: string;
  children?: TreeNode[];
}

/**
 * Recursively builds a nested data structure for a Cayley tree:
 * - Each node is { name: "x,y", children: [...] }.
 * - Skips the opposite direction to prevent backtracking.
 */
function buildCayleyTreeData(
  x: number,
  y: number,
  depth: number,
  maxDepth: number,
  fromDir: DirKey | null,
  step: number
): TreeNode {
  const node: TreeNode = {
    name: `${x},${y}`,
    children: [],
  };

  if (depth >= maxDepth) return node;

  for (const [dirName, info] of Object.entries(directions) as [
    DirKey,
    { dx: number; dy: number; opposite: string }
  ][]) {
    if (fromDir && info.opposite === fromDir) continue;

    const nx = x + info.dx * step;
    const ny = y + info.dy * step;

    node.children!.push(
      buildCayleyTreeData(nx, ny, depth + 1, maxDepth, dirName, step * 0.5)
    );
  }

  return node;
}

/**
 * LayoutNode holds the final Cartesian position (x, y) after
 * converting from polar coordinates (angle, radius).
 */
interface LayoutNode {
  id: string;
  x: number;
  y: number;
}

/**
 * LayoutLink holds the Cartesian coordinates for an edge
 * from (sourceX, sourceY) to (targetX, targetY).
 */
interface LayoutLink {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
}

/**
 * CayleyTree component:
 * - Builds a hierarchical Cayley tree
 * - Uses d3.cluster for a radial layout
 * - Renders the result as edges and vertices
 * - Supports basic zoom/pan and hover/click events
 */
const CayleyTree: React.FC = () => {
  // States for highlighting (hover) and shining (click).
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [shinedId, setShinedId] = useState<string | null>(null);

  // Arrays of nodes and links after layout is computed.
  const [nodes, setNodes] = useState<LayoutNode[]>([]);
  const [links, setLinks] = useState<LayoutLink[]>([]);

  // Refs for the <svg> and <g> elements, used by D3 zoom.
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    // 1) Build hierarchical Cayley tree data up to depth=4.
    const rootData = buildCayleyTreeData(0, 0, 0, 4, null, 100);

    // 2) Create a d3 hierarchy from the nested data.
    const root = d3.hierarchy<TreeNode>(rootData);

    // 3) Determine the screen dimensions and a suitable radius.
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const outerRadius = Math.min(screenW, screenH) / 2;

    // 4) Create a radial cluster layout:
    //    - x in [0..2π] for the angle
    //    - y in [0..outerRadius] for the radius
    const clusterLayout = d3
      .cluster<TreeNode>()
      .size([2 * Math.PI, outerRadius - 50]);

    // 5) Apply the cluster layout to compute polar coordinates (d.x, d.y).
    clusterLayout(root);

    // 6) Convert each node from polar to Cartesian.
    const allNodes: LayoutNode[] = root.descendants().map((d) => {
      const angle = d.x - Math.PI / 2; // shift so 0 angle is "up"
      const r = d.y;
      const xPos = r * Math.cos(angle);
      const yPos = r * Math.sin(angle);

      return {
        id: d.data.name,
        x: xPos,
        y: yPos,
      };
    });

    // 7) Build edges from parent to child in Cartesian coordinates.
    const allLinks: LayoutLink[] = [];
    root.descendants().forEach((d) => {
      if (d.parent) {
        const pAngle = d.parent.x - Math.PI / 2;
        const pR = d.parent.y;
        const px = pR * Math.cos(pAngle);
        const py = pR * Math.sin(pAngle);

        const cAngle = d.x - Math.PI / 2;
        const cR = d.y;
        const cx = cR * Math.cos(cAngle);
        const cy = cR * Math.sin(cAngle);

        allLinks.push({
          id: `${d.parent.data.name}->${d.data.name}`,
          sourceX: px,
          sourceY: py,
          targetX: cx,
          targetY: cy,
        });
      }
    });

    setNodes(allNodes);
    setLinks(allLinks);

    // 8) Set up D3 zoom behavior.
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on("zoom", (event) => {
        d3.select(gRef.current).attr("transform", event.transform.toString());
      });

    // 9) Attach zoom to the SVG.
    const svgSelection = d3.select(svgRef.current);
    svgSelection.call(zoomBehavior as any);

    // 10) Translate the <g> so that (0,0) is centered on the screen.
    d3.select(gRef.current)
      .attr("transform", `translate(${screenW / 2}, ${screenH / 2})`);

  }, []);

  // Hover handler (triggered by Edge/Vertex on mouse enter/leave).
  const handleHover = (id: string, hovered: boolean) => {
    setHighlightedId(hovered ? id : null);
  };

  // Click handler (triggered by Vertex on click).
  const handleClick = (id: string) => {
    setShinedId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{ border: "none", display: "block" }}
      >
        {/* A <g> that is manipulated by zoom/pan and holds all edges/nodes */}
        <g ref={gRef}>
          {/* Render edges */}
          {links.map((lk) => (
            <Edge
              key={lk.id}
              sourceX={lk.sourceX}
              sourceY={lk.sourceY}
              targetX={lk.targetX}
              targetY={lk.targetY}
              isHighlighted={highlightedId === lk.id}
              onHover={(hover) => handleHover(lk.id, hover)}
            />
          ))}

          {/* Render nodes */}
          {nodes.map((nd) => (
            <Vertex
              key={nd.id}
              id={nd.id}
              x={nd.x}
              y={nd.y}
              isHighlighted={highlightedId === nd.id}
              isShined={shinedId === nd.id}
              onHover={handleHover}
              onClick={handleClick}
            />
          ))}
        </g>
      </svg>
    </div>
  );
};

export default CayleyTree;
