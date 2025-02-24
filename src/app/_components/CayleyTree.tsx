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
  source: string;
  target: string;
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
  path: string[]; // Array of nodes
  edgePath: string[]; //array of edges
}

const CayleyTree: React.FC<CayleyTreeProps> = ({
  path, // Array of node IDs to highlight
  edgePath,
}: {
  path: string[];
  edgePath: string[];
}) => {
  const [nodes, setNodes] = useState<LayoutNode[]>([]);
  const [links, setLinks] = useState<LayoutLink[]>([]);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    const rootData = buildCayleyTreeData(0, 0, 0, 7, null, 100);
    const root = d3.hierarchy<TreeNode>(rootData);

    const screenW = 1024;
    const screenH = 768;
    const outerRadius = Math.min(screenW, screenH) / 2;

    // Create an elliptical cluster layout
    const clusterLayout = d3
      .cluster<TreeNode>()
      .size([2 * Math.PI, outerRadius - 50]);

    clusterLayout(root);

    const allNodes: LayoutNode[] = root.descendants().map((d) => {
      const angle = d.x - Math.PI / 4;
      // Apply different scaling to x and y to create an ellipse shape
      const rX = d.y * (1 + 0.2 * d.depth); // X scaling factor
      const rY = d.y * (1 + 0.1 * d.depth); // Y scaling factor
      const xPos = rX * Math.cos(angle); // Apply rX to the x position
      const yPos = rY * Math.sin(angle); // Apply rY to the y position

      return {
        id: d.data.name,
        x: xPos,
        y: yPos,
      };
    });

    const allLinks: LayoutLink[] = [];
    root.descendants().forEach((d) => {
      if (d.parent) {
        const getPosition = (node: d3.HierarchyPointNode<TreeNode>) => {
          const angle = node.x - Math.PI / 4;
          const rX = node.y * (1 + 0.2 * node.depth); // Elliptical scaling for X
          const rY = node.y * (1 + 0.1 * node.depth); // Elliptical scaling for Y
          return {
            x: rX * Math.cos(angle), // Apply rX scaling
            y: rY * Math.sin(angle), // Apply rY scaling
          };
        };

        const parentPos = getPosition(d.parent);
        const childPos = getPosition(d);

        allLinks.push({
          id: `${d.parent.data.name}->${d.data.name}`,
          source: d.parent.data.name,
          target: d.data.name,
          sourceX: parentPos.x,
          sourceY: parentPos.y,
          targetX: childPos.x,
          targetY: childPos.y,
        });
      }
    });

    setNodes(allNodes);
    setLinks(allLinks);

    // Set up zoom behavior
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
              source={lk.source}
              target={lk.target}
              sourceX={lk.sourceX}
              sourceY={lk.sourceY}
              targetX={lk.targetX}
              targetY={lk.targetY}
              isActive={edgePath.includes(lk.id)}
            />
          ))}

          {/* Render nodes */}
          {nodes.map((nd) => (
            <Vertex
              key={nd.id}
              id={nd.id}
              x={nd.x}
              y={nd.y}
              isActive={path.includes(nd.id)} // Change color based on path
            />
          ))}
        </g>
      </svg>
    </div>
  );
};

export default CayleyTree;
