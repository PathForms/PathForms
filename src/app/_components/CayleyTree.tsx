"use client";
import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import Edge from "./Edge";
import Vertex from "./Vertex";
import { buildCayleyTreeData3 } from "../utils/buildCayleyData";

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
  edgeColor?: string;
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
    { dx: number; dy: number; opposite: string },
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
  edgeColor?: string;
}

interface CayleyTreeProps {
  pathIndex: number[];
  nodePaths: string[][];
  edgePaths: string[][];
  edgeThickness: number;
  shape: string;
  previewPath?: {
    finalResult: {
      nodes: string[];
      edges: string[];
      moves: string[];
    };
    cancelledParts: {
      nodes: string[];
      edges: string[];
      moves: string[];
    };
  } | null;
  isDragging?: boolean;
  dragFromIndex?: number;
  dragHoverIndex?: number;
  hoverPathIndex?: number;
}

const CayleyTree: React.FC<CayleyTreeProps> = ({
  pathIndex,
  nodePaths,
  edgePaths,
  edgeThickness,
  shape,
  previewPath,
  isDragging = false,
  dragFromIndex = -1,
  dragHoverIndex = -1,
  hoverPathIndex = -1,
}) => {
  const [nodes, setNodes] = useState<LayoutNode[]>([]);
  const [links, setLinks] = useState<LayoutLink[]>([]);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    // Use smaller depth for hexagon (rank 3) to avoid performance issues
    // Rank 3 has 6 directions, so the tree grows much faster
    const maxDepth = shape === "hexagon" ? 5 : 7;
    const rootData =
      shape === "hexagon"
        ? buildCayleyTreeData3(0, 0, 0, maxDepth, null, 100)
        : buildCayleyTreeData(0, 0, 0, maxDepth, null, 100);
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

      // Use a Map to ensure unique nodes
      const nodeMap = new Map<string, LayoutNode>();
      root.descendants().forEach((d) => {
        const [x_, y_] = d.data.name.split(",").map(Number) || [0, 0];
        if (!nodeMap.has(d.data.name)) {
          nodeMap.set(d.data.name, {
            id: d.data.name,
            x: 2.5 * x_,
            y: 2.5 * y_,
          });
        }
      });
      const allNodes: LayoutNode[] = Array.from(nodeMap.values());

      // Use a Set to ensure unique links
      const linkSet = new Set<string>();
      const allLinks: LayoutLink[] = [];
      root.descendants().forEach((d) => {
        if (d.parent) {
          // Extract coordinates for the parent node
          const [parentX, parentY] = d.parent.data.name
            .split(",")
            .map(Number) || [0, 0];
          // Extract coordinates for the child node
          const [childX, childY] = d.data.name.split(",").map(Number) || [0, 0];

          const linkId = `${d.parent.data.name}->${d.data.name}`;
          // Only add if not already present
          if (!linkSet.has(linkId)) {
            linkSet.add(linkId);
            allLinks.push({
              id: linkId,
              source: d.parent.data.name,
              target: d.data.name,
              sourceX: 2.5 * parentX,
              sourceY: 2.5 * parentY,
              targetX: 2.5 * childX,
              targetY: 2.5 * childY,
              edgeColor: d.data.edgeColor, // Store edge color for rect layout
            });
          }
        }
      });

      setNodes(allNodes);
      setLinks(allLinks);
    } else if (shape === "hexagon") {
      // Hexagon layout: use the coordinates directly from node names
      // Similar to rect but with hexagon coordinate system
      // Use a Map to ensure unique nodes (same coordinates = same node)
      const nodeMap = new Map<string, LayoutNode>();
      root.descendants().forEach((d) => {
        const [x_, y_] = d.data.name.split(",").map(Number) || [0, 0];
        if (!nodeMap.has(d.data.name)) {
          nodeMap.set(d.data.name, {
            id: d.data.name,
            x: 2.5 * x_,
            y: 2.5 * y_,
          });
        }
      });
      const allNodes: LayoutNode[] = Array.from(nodeMap.values());

      // Use a Set to ensure unique links
      const linkSet = new Set<string>();
      const allLinks: LayoutLink[] = [];
      root.descendants().forEach((d) => {
        if (d.parent) {
          // Extract coordinates for the parent node
          const [parentX, parentY] = d.parent.data.name
            .split(",")
            .map(Number) || [0, 0];
          // Extract coordinates for the child node
          const [childX, childY] = d.data.name.split(",").map(Number) || [0, 0];

          const linkId = `${d.parent.data.name}->${d.data.name}`;
          // Only add if not already present
          if (!linkSet.has(linkId)) {
            linkSet.add(linkId);
            allLinks.push({
              id: linkId,
              source: d.parent.data.name,
              target: d.data.name,
              sourceX: 2.5 * parentX,
              sourceY: 2.5 * parentY,
              targetX: 2.5 * childX,
              targetY: 2.5 * childY,
              edgeColor: d.data.edgeColor, // Store edge color for hexagon layout
            });
          }
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
          {links.map((lk) => {
            // Determine if this edge should be highlighted
            let isActive = false;
            let isHoveredTarget = false;
            if (isDragging && dragFromIndex >= 0 && dragHoverIndex >= 0) {
              // When dragging, show both paths but highlight the dragged path
              const isFromPath = edgePaths[dragFromIndex]?.includes(lk.id);
              const isHoverPath = edgePaths[dragHoverIndex]?.includes(lk.id);
              isActive = isFromPath || isHoverPath;
              // Specifically mark the dragged path for special highlighting
              isHoveredTarget = isFromPath;
            } else {
              // Normal display: highlight all paths in pathIndex
              const isInPathIndex =
                pathIndex.length > 0 &&
                pathIndex.some((index) => edgePaths[index]?.includes(lk.id));

              // When hovering (not dragging), also highlight the hovered path
              const isInHoverPath =
                hoverPathIndex >= 0 &&
                edgePaths[hoverPathIndex]?.includes(lk.id);

              isActive = isInPathIndex || isInHoverPath;

              // Mark hover path with special highlighting (always, to make it stand out)
              if (isInHoverPath) {
                isHoveredTarget = true;
              }
            }

            const isFinalResult = Boolean(
              previewPath && previewPath.finalResult.edges.includes(lk.id)
            );
            const isCancelledPart = Boolean(
              previewPath && previewPath.cancelledParts.edges.includes(lk.id)
            );

            return (
              <Edge
                key={lk.id}
                source={lk.source}
                target={lk.target}
                sourceX={lk.sourceX}
                sourceY={lk.sourceY}
                targetX={lk.targetX}
                targetY={lk.targetY}
                isActive={isActive}
                isFinalResult={isFinalResult}
                isCancelledPart={isCancelledPart}
                isHoveredTarget={isHoveredTarget}
                edgeThickness={edgeThickness}
                edgeColor={lk.edgeColor}
                shape={shape}
              />
            );
          })}

          {nodes.map((nd) => {
            // Determine if this node should be highlighted
            let isActive = false;
            let isHoveredTarget = false;
            if (isDragging && dragFromIndex >= 0 && dragHoverIndex >= 0) {
              // When dragging, show both paths but highlight the dragged path
              const isFromPath = nodePaths[dragFromIndex]?.includes(nd.id);
              const isHoverPath = nodePaths[dragHoverIndex]?.includes(nd.id);
              isActive = isFromPath || isHoverPath;
              // Specifically mark the dragged path for special highlighting
              isHoveredTarget = isFromPath;
            } else {
              // Normal display: highlight all paths in pathIndex
              const isInPathIndex =
                pathIndex.length > 0 &&
                pathIndex.some((index) => nodePaths[index]?.includes(nd.id));

              // When hovering (not dragging), also highlight the hovered path
              const isInHoverPath =
                hoverPathIndex >= 0 &&
                nodePaths[hoverPathIndex]?.includes(nd.id);

              isActive = isInPathIndex || isInHoverPath;

              // Mark hover path with special highlighting (always, to make it stand out)
              if (isInHoverPath) {
                isHoveredTarget = true;
              }
            }

            const isFinalResult = Boolean(
              previewPath && previewPath.finalResult.nodes.includes(nd.id)
            );
            const isCancelledPart = Boolean(
              previewPath && previewPath.cancelledParts.nodes.includes(nd.id)
            );

            return (
              <Vertex
                key={nd.id}
                id={nd.id}
                x={nd.x}
                y={nd.y}
                isActive={isActive}
                isFinalResult={isFinalResult}
                isCancelledPart={isCancelledPart}
                isHoveredTarget={isHoveredTarget}
              />
            );
          })}

          {/* Show label at the end of hovered path */}
          {hoverPathIndex >= 0 &&
            nodePaths[hoverPathIndex] &&
            (() => {
              // Get the last node of the hovered path
              const pathNodes = nodePaths[hoverPathIndex];
              if (pathNodes && pathNodes.length > 0) {
                // Try to find a node from the end of the path backwards
                // (in case the path is longer than the tree depth)
                let lastNode = null;
                for (let i = pathNodes.length - 1; i >= 0 && !lastNode; i--) {
                  const nodeId = pathNodes[i];
                  const [targetX, targetY] = nodeId.split(",").map(Number);

                  // Find the node by approximate coordinate matching (to handle floating point precision)
                  lastNode = nodes.find((n) => {
                    const [nodeX, nodeY] = n.id.split(",").map(Number);
                    // Use a small epsilon for floating point comparison
                    return (
                      Math.abs(nodeX - targetX) < 0.001 &&
                      Math.abs(nodeY - targetY) < 0.001
                    );
                  });
                }

                if (lastNode) {
                  return (
                    <text
                      x={lastNode.x}
                      y={lastNode.y - 15}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="16"
                      fontWeight="bold"
                      stroke="#000000"
                      strokeWidth="0.5"
                      style={{
                        pointerEvents: "none",
                        textShadow: "0 0 4px rgba(0,0,0,0.8)",
                      }}
                    >
                      P{hoverPathIndex + 1}
                    </text>
                  );
                }
              }
              return null;
            })()}
        </g>
      </svg>
    </div>
  );
};

export default CayleyTree;
