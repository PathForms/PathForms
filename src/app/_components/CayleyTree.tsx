"use client";
import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import Edge from "./Edge";
import Vertex from "./Vertex";

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
    if (fromDir && info.opposite === fromDir) continue;

    const nx = x + info.dx * step;
    const ny = y + info.dy * step;
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

interface CayleyTreeProps {
  pathIndex: number[];
  nodePaths: string[][];
  edgePaths: string[][];
  edgeThickness: number;
  shape: string;
  showArrows: boolean
}

const CayleyTree: React.FC<CayleyTreeProps> = ({
  pathIndex,
  nodePaths,
  edgePaths,
  edgeThickness,
  shape,
  showArrows,
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
    if (shape === "circle") {
      const outerRadius = Math.min(screenW, screenH) / 2;
      const clusterLayout = d3
        .cluster<TreeNode>()
        .size([2 * Math.PI, outerRadius - 50]);
      clusterLayout(root);

      const allNodes: LayoutNode[] = root.descendants().map((d) => {
        const angle = (d.x ?? 0) - Math.PI / 4;
        const rX = (d.y ?? 0) * (1 + 0.2 * d.depth);
        const rY = (d.y ?? 0) * (1 + 0.1 * d.depth);
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
            return { x: rX * Math.cos(angle), y: rY * Math.sin(angle) };
          };
          const parentPos = getPosition(
            d.parent as d3.HierarchyPointNode<TreeNode>
          );
          const childPos = getPosition(d as d3.HierarchyPointNode<TreeNode>);
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
    } else if (shape === "rect") {
      const treeLayout = d3
        .tree<TreeNode>()
        .size([screenW - 200, screenH - 200]);
      treeLayout(root);

      const allNodes: LayoutNode[] = root.descendants().map((d) => {
        // Extract coordinates from the name field of the node
        const [x_, y_] = d.data.name.split(",").map(Number) || [0, 0];
        const node = { id: d.data.name, x: 2.5 * x_, y: 2.5 * y_ };
        console.log("Rect Node:", node);
        return node;
      });

      const allLinks: LayoutLink[] = [];
      root.descendants().forEach((d) => {
        if (d.parent) {
          // Extract coordinates for the parent node
          const [parentX, parentY] = d.parent.data.name
            .split(",")
            .map(Number) || [0, 0];
          // Extract coordinates for the child node
          const [childX, childY] = d.data.name.split(",").map(Number) || [0, 0];

          // Create the link with proper coordinates
          allLinks.push({
            id: `${d.parent.data.name}->${d.data.name}`,
            source: d.parent.data.name,
            target: d.data.name,
            sourceX: 2.5 * parentX,
            sourceY: 2.5 * parentY,
            targetX: 2.5 * childX,
            targetY: 2.5 * childY,
          });
        }
      });

      setNodes(allNodes);
      setLinks(allLinks);
    }
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
  }, [shape]);

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
          {/* Use a path element so that we can place a marker at the midpoint */}
          {links.map((lk) => (
            <Edge
              key={lk.id}
              source={lk.source}
              target={lk.target}
              sourceX={lk.sourceX}
              sourceY={lk.sourceY}
              targetX={lk.targetX}
              targetY={lk.targetY}
              isActive={
                pathIndex.length > 0 &&
                pathIndex.some((index) => edgePaths[index]?.includes(lk.id))
              }
              edgeThickness={edgeThickness}
              showArrow={showArrows}  
            />
          ))}

          {nodes.map((nd) => (
            <Vertex
              key={nd.id}
              id={nd.id}
              x={nd.x}
              y={nd.y}
              isActive={
                pathIndex.length > 0 &&
                pathIndex.some((index) => nodePaths[index]?.includes(nd.id))
              }
            />
          ))}
        </g>
      </svg>
    </div>
  );
};

export default CayleyTree;
