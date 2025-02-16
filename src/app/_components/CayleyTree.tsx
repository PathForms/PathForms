"use client";
import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import Edge from "./Edge";
import Vertex from "./Vertex";
import ButtonBar from "./ButtonBar";

/**
 * Directions for the 4-way expansion in a Cayley tree.
 * We skip the opposite direction to avoid immediate backtracking.
 */
const directions = {
  up: { dx: 0, dy: 1, opposite: "down" },
  down: { dx: 0, dy: -1, opposite: "up" },
  left: { dx: -1, dy: 0, opposite: "right" },
  right: { dx: 1, dy: 0, opposite: "left" },
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

interface CayleyTreeProps {
  path: string[]; // Array of coordinate objects
}

const CayleyTree: React.FC<CayleyTreeProps> = ({
  path, // Array of node IDs to highlight
}: {
  path: string[];
}) => {
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const [nodes, setNodes] = useState<LayoutNode[]>([]);
  const [links, setLinks] = useState<LayoutLink[]>([]);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    const rootData = buildCayleyTreeData(0, 0, 0, 6, null, 100);
    const root = d3.hierarchy<TreeNode>(rootData);

    const screenW = 1024;
    const screenH = 768;
    const outerRadius = Math.min(screenW, screenH) / 2;

    const clusterLayout = d3
      .cluster<TreeNode>()
      .size([2 * Math.PI, outerRadius - 50]);

    clusterLayout(root);

    const allNodes: LayoutNode[] = root.descendants().map((d) => {
      const angle = d.x - Math.PI / 2;
      const r = d.y;
      const xPos = r * Math.cos(angle);
      const yPos = r * Math.sin(angle);

      return {
        id: d.data.name,
        x: xPos,
        y: yPos,
      };
    });

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

    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on("zoom", (event) => {
        d3.select(gRef.current).attr("transform", event.transform.toString());
      });

    const svgSelection = d3.select(svgRef.current);
    svgSelection.call(zoomBehavior as any);

    d3.select(gRef.current).attr(
      "transform",
      `translate(${screenW / 2}, ${screenH / 2})`
    );
  }, []);

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
              onHover={(hover) => setHighlightedId(hover ? lk.id : null)}
            />
          ))}

          {/* Render nodes */}
          {nodes.map((nd) => (
            <Vertex
              key={nd.id}
              id={nd.id}
              x={nd.x}
              y={nd.y}
              onHover={(id, hovered) => setHighlightedId(hovered ? id : null)}
              onClick={() => setHighlightedId(null)} // You can add specific behavior for click
              isActive={path.includes(nd.id)} // Change color based on path
            />
          ))}
        </g>
      </svg>
    </div>
  );
};

export default CayleyTree;
