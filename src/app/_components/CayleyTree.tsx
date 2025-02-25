"use client";
import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import Edge from "./Edge";
import Vertex from "./Vertex";

// Directions for the 4-way expansion in a Cayley tree.
const directions = {
  up: { dx: 0, dy: 1, opposite: "down" },
  right: { dx: 1, dy: 0, opposite: "left" },
  down: { dx: 0, dy: -1, opposite: "up" },
  left: { dx: -1, dy: 0, opposite: "right" },
};
type DirKey = keyof typeof directions;

interface TreeNode {
  name: string;
  children?: TreeNode[];
}

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
    console.log(dirName, info);
    if (fromDir && info.opposite === fromDir) continue;

    const nx = x + info.dx * step;
    const ny = y + info.dy * step;
    console.log(nx, ny);

    node.children!.push(
      buildCayleyTreeData(nx, ny, depth + 1, maxDepth, dirName, step * 0.5)
    );
  }

  return node;
}

interface LayoutNode {
  id: string;
  x: number;
  y: number;
}

interface LayoutLink {
  id: string;
  source: string;
  target: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
}

// Extend the props interface to include edgeThickness and vertexSize.
interface CayleyTreeProps {
  path: string[]; // Array of node IDs to highlight
  edgePath: string[]; // Array of edge IDs to highlight
  edgeThickness: number;
  vertexSize: number;
}

const CayleyTree: React.FC<CayleyTreeProps> = ({
  path,
  edgePath,
  edgeThickness,
  vertexSize,
}) => {
  const [nodes, setNodes] = useState<LayoutNode[]>([]);
  const [links, setLinks] = useState<LayoutLink[]>([]);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    const rootData = buildCayleyTreeData(0, 0, 0, 5, null, 100);
    console.log(rootData);
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
      // Apply different scaling to create an ellipse shape
      const rX = d.y * (1 + 0.2 * d.depth);
      const rY = d.y * (1 + 0.1 * d.depth);
      return {
        id: d.data.name,
        x: rX * Math.cos(angle),
        y: rY * Math.sin(angle),
      };
    });

    const allLinks: LayoutLink[] = [];
    root.descendants().forEach((d) => {
      if (d.parent) {
        const getPosition = (node: d3.HierarchyPointNode<TreeNode>) => {
          const angle = node.x - Math.PI / 4;
          const rX = node.y * (1 + 0.2 * node.depth);
          const rY = node.y * (1 + 0.1 * node.depth);
          return {
            x: rX * Math.cos(angle),
            y: rY * Math.sin(angle),
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

    // Setup zoom behavior
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
    <div style={{ width: "100vw", height: "100vh", margin: 0, padding: 0, overflow: "hidden" }}>
      <svg ref={svgRef} width="100%" height="100%" style={{ border: "none", display: "block" }}>
        <g ref={gRef}>
          {/* Render edges with edgeThickness prop */}
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
              edgeThickness={edgeThickness}
            />
          ))}
          {/* Render nodes with vertexSize prop */}
          {nodes.map((nd) => (
            <Vertex
              key={nd.id}
              id={nd.id}
              x={nd.x}
              y={nd.y}
              isActive={path.includes(nd.id)}
              vertexSize={vertexSize}
            />
          ))}
        </g>
      </svg>
    </div>
  );
};

export default CayleyTree;
