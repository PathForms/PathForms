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
const PATH_LABEL_SELECTOR = "[data-path-label-index]";
const COORD_TOLERANCE = 1e-3;

const parseNodeId = (nodeId: string): [number, number] | null => {
  const [x, y] = nodeId.split(",").map(Number);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return [x, y];
};

const nodeIdMatches = (a: string, b: string): boolean => {
  if (a === b) return true;
  const pa = parseNodeId(a);
  const pb = parseNodeId(b);
  if (!pa || !pb) return false;
  return (
    Math.abs(pa[0] - pb[0]) < COORD_TOLERANCE &&
    Math.abs(pa[1] - pb[1]) < COORD_TOLERANCE
  );
};

const parseEdgeId = (edgeId: string): [string, string] | null => {
  const parts = edgeId.split("->");
  if (parts.length !== 2) return null;
  return [parts[0], parts[1]];
};

const edgeIdMatches = (a: string, b: string): boolean => {
  if (a === b) return true;
  const ea = parseEdgeId(a);
  const eb = parseEdgeId(b);
  if (!ea || !eb) return false;
  return nodeIdMatches(ea[0], eb[0]) && nodeIdMatches(ea[1], eb[1]);
};

const pathContainsNode = (
  pathNodes: string[] | undefined,
  nodeId: string
): boolean => {
  if (!pathNodes || pathNodes.length === 0) return false;
  if (pathNodes.includes(nodeId)) return true;
  return pathNodes.some((id) => nodeIdMatches(id, nodeId));
};

const pathContainsEdge = (
  pathEdges: string[] | undefined,
  edgeId: string
): boolean => {
  if (!pathEdges || pathEdges.length === 0) return false;
  if (pathEdges.includes(edgeId)) return true;
  return pathEdges.some((id) => edgeIdMatches(id, edgeId));
};

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
  depth?: number;
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
  onPathDragStart?: (fromIndex: number) => void;
  onPathDragHover?: (toIndex: number) => void;
  onPathDragLeave?: () => void;
  onPathDragEnd?: () => void;
  onPathDropConcatenate?: (targetIndex: number, draggedIndex: number) => void;
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
  onPathDragStart,
  onPathDragHover,
  onPathDragLeave,
  onPathDragEnd,
  onPathDropConcatenate,
}) => {
  const [nodes, setNodes] = useState<LayoutNode[]>([]);
  const [links, setLinks] = useState<LayoutLink[]>([]);
  const [dragGhostPos, setDragGhostPos] = useState<{ x: number; y: number } | null>(
    null
  );

  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);
  const graphDragFromRef = useRef<number | null>(null);
  const graphDragPointerIdRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  useEffect(() => {
    const longestPathDepth = Math.max(
      1,
      ...nodePaths.map((path) => Math.max(0, path.length - 1))
    );
    // Ensure the graph is deep enough to represent all current path words.
    // Keep a small minimum depth for initial layout quality.
    const minDepth = shape === "hexagon" ? 5 : 7;
    const maxDepth = Math.max(minDepth, longestPathDepth);
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
          depth: d.depth,
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
            depth: d.depth,
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
            depth: d.depth,
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
      .filter((event) => {
        // Disable pan/zoom while dragging paths so the graph does not move.
        if (isDraggingRef.current || graphDragFromRef.current !== null) {
          return false;
        }
        const e = event as PointerEvent | WheelEvent | MouseEvent;
        if ("ctrlKey" in e && e.ctrlKey && e.type !== "wheel") return false;
        if ("button" in e && e.button) return false;
        return true;
      })
      .on("zoom", (event) => {
        d3.select(gRef.current).attr("transform", event.transform.toString());
      });

    const svgSelection = d3.select(svgRef.current);
    svgSelection.call(zoomBehavior as any);
    d3.select(gRef.current).attr(
      "transform",
      `translate(${screenW / 2}, ${screenH / 2})`
    );
  }, [shape, nodePaths]);

  const toGraphCoords = (
    clientX: number,
    clientY: number
  ): { x: number; y: number } | null => {
    const g = gRef.current;
    const svg = svgRef.current;
    if (!g || !svg) return null;
    const ctm = g.getScreenCTM();
    if (!ctm) return null;
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    const transformed = point.matrixTransform(ctm.inverse());
    return { x: transformed.x, y: transformed.y };
  };

  const getPathLabelIndexAtPoint = (clientX: number, clientY: number): number => {
    const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
    const hit = el?.closest(PATH_LABEL_SELECTOR) as HTMLElement | null;
    if (!hit) return -1;
    const index = Number(hit.dataset.pathLabelIndex);
    return Number.isFinite(index) ? index : -1;
  };

  const startGraphDrag = (idx: number, e: React.PointerEvent<SVGElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    graphDragFromRef.current = idx;
    graphDragPointerIdRef.current = e.pointerId;
    const graphPoint = toGraphCoords(e.clientX, e.clientY);
    setDragGhostPos(graphPoint);
    onPathDragStart?.(idx);
  };

  const findNodeById = (nodeId: string): LayoutNode | undefined => {
    const exact = nodes.find((n) => n.id === nodeId);
    if (exact) return exact;
    const [targetX, targetY] = nodeId.split(",").map(Number);
    if (!Number.isFinite(targetX) || !Number.isFinite(targetY)) return undefined;
    return nodes.find((n) => {
      const [x, y] = n.id.split(",").map(Number);
      return Math.abs(x - targetX) < 0.001 && Math.abs(y - targetY) < 0.001;
    });
  };

  const getPathLastVisibleNode = (pathIdx: number): LayoutNode | null => {
    const pathNodes = nodePaths[pathIdx];
    if (!pathNodes || pathNodes.length === 0) return null;
    for (let i = pathNodes.length - 1; i >= 0; i--) {
      const nd = findNodeById(pathNodes[i]);
      if (nd) return nd;
    }
    return null;
  };

  useEffect(() => {
    const handleWindowPointerMove = (e: PointerEvent) => {
      if (!isDragging || dragFromIndex < 0) return;
      const graphPoint = toGraphCoords(e.clientX, e.clientY);
      if (graphPoint) {
        setDragGhostPos(graphPoint);
      }
      const hoverIndex = getPathLabelIndexAtPoint(e.clientX, e.clientY);
      if (hoverIndex >= 0) {
        onPathDragHover?.(hoverIndex);
      } else {
        onPathDragLeave?.();
      }
    };

    const handleWindowPointerUp = (e: PointerEvent) => {
      if (
        graphDragFromRef.current === null ||
        graphDragPointerIdRef.current !== e.pointerId
      ) {
        return;
      }
      const from = graphDragFromRef.current;
      const target = getPathLabelIndexAtPoint(e.clientX, e.clientY);
      if (target >= 0 && from !== target) {
        onPathDropConcatenate?.(target, from);
      }
      graphDragFromRef.current = null;
      graphDragPointerIdRef.current = null;
      onPathDragLeave?.();
      onPathDragEnd?.();
      setDragGhostPos(null);
    };
    window.addEventListener("pointermove", handleWindowPointerMove, {
      passive: false,
    });
    window.addEventListener("pointerup", handleWindowPointerUp);
    window.addEventListener("pointercancel", handleWindowPointerUp);
    return () => {
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", handleWindowPointerUp);
      window.removeEventListener("pointercancel", handleWindowPointerUp);
    };
  }, [
    dragFromIndex,
    isDragging,
    onPathDragEnd,
    onPathDragHover,
    onPathDragLeave,
    onPathDropConcatenate,
  ]);

  const draggedPathPoints = (() => {
    if (!isDragging || dragFromIndex < 0) return [];
    return (nodePaths[dragFromIndex] || [])
      .map((nodeId) => findNodeById(nodeId))
      .filter((n): n is LayoutNode => Boolean(n))
      .map((n) => ({ x: n.x, y: n.y }));
  })();

  const draggedPathGhostPoints = (() => {
    if (!dragGhostPos || draggedPathPoints.length < 2) return [];
    const center = draggedPathPoints.reduce(
      (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
      { x: 0, y: 0 }
    );
    center.x /= draggedPathPoints.length;
    center.y /= draggedPathPoints.length;
    const dx = dragGhostPos.x - center.x;
    const dy = dragGhostPos.y - center.y;
    return draggedPathPoints.map((p) => ({ x: p.x + dx, y: p.y + dy }));
  })();

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
        style={{
          border: "none",
          display: "block",
          touchAction: isDragging ? "none" : "auto",
          userSelect: "none",
        }}
      >
        <g ref={gRef}>
          {pathIndex
            .map((idx) => {
              const pts = (nodePaths[idx] || [])
                .map((nodeId) => findNodeById(nodeId))
                .filter((n): n is LayoutNode => Boolean(n))
                .map((n) => `${n.x},${n.y}`);
              return { idx, pts };
            })
            .filter((entry) => entry.pts.length >= 2)
            .map(({ idx, pts }) => (
              <polyline
                key={`drag-hit-${idx}`}
                data-path-index={idx}
                points={pts.join(" ")}
                fill="none"
                stroke="transparent"
                strokeWidth={26}
                style={{ pointerEvents: "stroke", cursor: "grab" }}
                onPointerDown={(e) => startGraphDrag(idx, e)}
              />
            ))}

          {/* Use a path element so that we can place a marker at the midpoint */}
          {links.map((lk) => {
            // Determine if this edge should be highlighted
            let isActive = false;
            let isHoveredTarget = false;
            if (isDragging && dragFromIndex >= 0 && dragHoverIndex >= 0) {
              // When dragging, show both paths but highlight the dragged path
              const isFromPath = pathContainsEdge(edgePaths[dragFromIndex], lk.id);
              const isHoverPath = pathContainsEdge(edgePaths[dragHoverIndex], lk.id);
              isActive = isFromPath || isHoverPath;
              // Specifically mark the dragged path for special highlighting
              isHoveredTarget = isFromPath;
            } else {
              // Normal display: highlight all paths in pathIndex
              const isInPathIndex =
                pathIndex.length > 0 &&
                pathIndex.some((index) => pathContainsEdge(edgePaths[index], lk.id));

              // When hovering (not dragging), also highlight the hovered path
              const isInHoverPath =
                hoverPathIndex >= 0 &&
                pathContainsEdge(edgePaths[hoverPathIndex], lk.id);

              isActive = isInPathIndex || isInHoverPath;

              // Mark hover path with special highlighting (always, to make it stand out)
              if (isInHoverPath) {
                isHoveredTarget = true;
              }
            }

            const isFinalResult = Boolean(
              previewPath && pathContainsEdge(previewPath.finalResult.edges, lk.id)
            );
            const isCancelledPart = Boolean(
              previewPath && pathContainsEdge(previewPath.cancelledParts.edges, lk.id)
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
              const isFromPath = pathContainsNode(nodePaths[dragFromIndex], nd.id);
              const isHoverPath = pathContainsNode(nodePaths[dragHoverIndex], nd.id);
              isActive = isFromPath || isHoverPath;
              // Specifically mark the dragged path for special highlighting
              isHoveredTarget = isFromPath;
            } else {
              // Normal display: highlight all paths in pathIndex
              const isInPathIndex =
                pathIndex.length > 0 &&
                pathIndex.some((index) => pathContainsNode(nodePaths[index], nd.id));

              // When hovering (not dragging), also highlight the hovered path
              const isInHoverPath =
                hoverPathIndex >= 0 &&
                pathContainsNode(nodePaths[hoverPathIndex], nd.id);

              isActive = isInPathIndex || isInHoverPath;

              // Mark hover path with special highlighting (always, to make it stand out)
              if (isInHoverPath) {
                isHoveredTarget = true;
              }
            }

            const isFinalResult = Boolean(
              previewPath && pathContainsNode(previewPath.finalResult.nodes, nd.id)
            );
            const isCancelledPart = Boolean(
              previewPath && pathContainsNode(previewPath.cancelledParts.nodes, nd.id)
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
                depth={nd.depth}
                isHexagon={shape === "hexagon"}
              />
            );
          })}

          {draggedPathGhostPoints.length >= 2 && (
            <>
              <polyline
                points={draggedPathGhostPoints
                  .map((p) => `${p.x},${p.y}`)
                  .join(" ")}
                fill="none"
                stroke="rgba(255, 255, 0, 0.95)"
                strokeWidth={4}
                strokeDasharray="8,4"
                style={{ pointerEvents: "none" }}
              />
              {draggedPathGhostPoints.map((p, i) => (
                <circle
                  key={`drag-ghost-node-${i}`}
                  cx={p.x}
                  cy={p.y}
                  r={3}
                  fill="rgba(255, 255, 0, 0.95)"
                  style={{ pointerEvents: "none" }}
                />
              ))}
            </>
          )}

          {Array.from(new Set(pathIndex))
            .filter((idx) => idx >= 0 && idx < nodePaths.length)
            .map((idx) => {
              const lastNode = getPathLastVisibleNode(idx);
              if (!lastNode) return null;
              const isDragFrom = isDragging && dragFromIndex === idx;
              const isDropHover = isDragging && dragHoverIndex === idx;
              const label = `p${idx + 1}`;
              return (
                <g key={`path-label-${idx}`}>
                  <rect
                    data-path-label-index={idx}
                    x={lastNode.x - 22}
                    y={lastNode.y - 30}
                    width={44}
                    height={22}
                    rx={8}
                    ry={8}
                    fill="transparent"
                    style={{
                      pointerEvents: "all",
                      cursor: isDragging ? "grabbing" : "grab",
                    }}
                    onPointerDown={(e) => startGraphDrag(idx, e)}
                  />
                  <text
                    data-path-label-index={idx}
                    x={lastNode.x}
                    y={lastNode.y - 15}
                    textAnchor="middle"
                    fill={
                      isDragFrom ? "#ffe066" : isDropHover ? "#ffffff" : "#d9f99d"
                    }
                    fontSize="16"
                    fontWeight="bold"
                    stroke="#000000"
                    strokeWidth="0.6"
                    style={{
                      pointerEvents: "auto",
                      cursor: isDragging ? "grabbing" : "grab",
                      textShadow: "0 0 4px rgba(0,0,0,0.85)",
                      userSelect: "none",
                    }}
                    onPointerDown={(e) => startGraphDrag(idx, e)}
                  >
                    {label}
                  </text>
                </g>
              );
            })}
        </g>
      </svg>
    </div>
  );
};

export default CayleyTree;
