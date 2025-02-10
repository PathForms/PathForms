"use client";
import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import Vertex from "./Vertex"; // Please ensure the file name/path is correct
import Edge from "./Edge";     // Please ensure the file name/path is correct

/**
 * NodeSim: Node data structure for D3 forceSimulation
 */
interface NodeSim extends d3.SimulationNodeDatum {
  id: string;
  initX: number;
  initY: number;
}

/**
 * LinkSim: Link data structure for D3 forceSimulation
 * Adds a "direction" field to store "up" | "down" | "left" | "right"
 */
interface LinkSim extends d3.SimulationLinkDatum<NodeSim> {
  id: string;
  source: NodeSim;
  target: NodeSim;
  direction: string;
}

// Define the four directions and their opposite information
const directions = {
  up:    { dx: 0,  dy: -1, opposite: "down"  },
  down:  { dx: 0,  dy:  1, opposite: "up"    },
  left:  { dx: -1, dy:  0, opposite: "right" },
  right: { dx:  1, dy:  0, opposite: "left"  },
};
type DirKey = keyof typeof directions;

/**
 * Recursively builds a fractal cross tree:
 * - Create a node at (x, y);
 * - If the depth has not reached maxDepth, grow in the directions: up, down, left, and right,
 *   but skip the opposite of the incoming direction (to avoid backtracking);
 * - Use nodeMap and linkMap to deduplicate (ensuring that only one NodeSim is generated for the same coordinate),
 *   and record the link direction (using the variable dirName) when creating a link.
 */
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
    nodeMap.set(nodeId, { id: nodeId, initX: x, initY: y });
  }
  const parentNode = nodeMap.get(nodeId)!;

  if (depth >= maxDepth) return;

  for (const [dirName, info] of Object.entries(directions) as [
    DirKey,
    { dx: number; dy: number; opposite: string }
  ][]) {
    // Skip the direction that is opposite to the incoming direction
    if (fromDir && info.opposite === fromDir) continue;

    const nx = x + info.dx * step;
    const ny = y + info.dy * step;
    const childId = `${nx},${ny}`;

    if (!nodeMap.has(childId)) {
      nodeMap.set(childId, { id: childId, initX: nx, initY: ny });
    }
    const childNode = nodeMap.get(childId)!;

    // Record the direction (dirName) when creating the link
    const edgeId = parentNode.id + "->" + childNode.id;
    if (!linkMap.has(edgeId)) {
      linkMap.set(edgeId, {
        id: edgeId,
        source: parentNode,
        target: childNode,
        direction: dirName,
      });
    }

    // Recursively build the next level; decay the step by 0.5 (adjust as needed)
    buildCayleyTree(nodeMap, linkMap, nx, ny, depth + 1, maxDepth, dirName, step * 0.5);
  }
}

const CayleyTree: React.FC = () => {
  const [nodes, setNodes] = useState<NodeSim[]>([]);
  const [links, setLinks] = useState<LinkSim[]>([]);
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);
  const [shinedNode, setShinedNode] = useState<string | null>(null);

  // References for SVG and the <g> element
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    // 1) Build the fractal cross tree data
    const nodeMap = new Map<string, NodeSim>();
    const linkMap = new Map<string, LinkSim>();
    // Here, maxDepth is set to 4 (you can adjust the number of layers as needed)
    buildCayleyTree(nodeMap, linkMap, 0, 0, 0, 4, null, 100);

    const nodeArray = Array.from(nodeMap.values());
    const linkArray = Array.from(linkMap.values());

    // Translate all nodes' initial layout to (400, 300)
    nodeArray.forEach((nd) => {
      nd.x = nd.initX + 400;
      nd.y = nd.initY + 300;
    });

    // 2) Create the D3 forceSimulation
    const simulation = d3
      .forceSimulation<NodeSim>(nodeArray)
      .force(
        "link",
        d3
          .forceLink<NodeSim, LinkSim>(linkArray)
          .id((d) => d.id)
          .distance(15)
          .strength(1.0)
      )
      // Here we do not use (or comment out) the charge force
      //.force("charge", d3.forceManyBody<NodeSim>().strength(-5))
      // Force the nodes to pull back to their initial (x, y)
      .force("fx", d3.forceX<NodeSim>((d) => d.x!).strength(0.5))
      .force("fy", d3.forceY<NodeSim>((d) => d.y!).strength(0.5))
      // Accelerate decay to let the simulation stabilize faster
      .alphaDecay(0.1)
      .on("tick", () => {
        // Update the node and link states on each tick
        setNodes([...nodeArray]);
        setLinks([...linkArray]);
      });

    // 3) Enable zoom and pan
    const svgSelection = d3.select(svgRef.current);
    const gSelection = d3.select(gRef.current);
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 5])
      .on("zoom", (event) => {
        gSelection.attr("transform", event.transform.toString());
      });
    svgSelection.call(zoomBehavior as any);

    // Stop the simulation when the component is unmounted
    return () => {
      simulation.stop();
    };
  }, []);

  // Hover event: highlight effect
  const handleHover = (id: string, hovered: boolean) => {
    setHighlightedNode(hovered ? id : null);
  };
  // Click event: shine effect
  const handleClick = (id: string) => {
    setShinedNode((prev) => (prev === id ? null : id));
  };

  return (
    <div style={{ width: "800px", height: "600px", margin: "0 auto" }}>
      <svg ref={svgRef} width={800} height={600} style={{ border: "1px solid #ccc" }}>
        <g ref={gRef}>
          {/* Render links: pass in the direction field */}
          {links.map((lk) => (
            <Edge
              key={lk.id}
              sourceX={lk.source.x ?? 0}
              sourceY={lk.source.y ?? 0}
              targetX={lk.target.x ?? 0}
              targetY={lk.target.y ?? 0}
              onHover={(hover) => handleHover(lk.id, hover)}
              isHighlighted={highlightedNode === lk.id}
              direction={lk.direction}
            />
          ))}
          {/* Render nodes */}
          {nodes.map((nd) => (
            <Vertex
              key={nd.id}
              id={nd.id}
              x={nd.x ?? 0}
              y={nd.y ?? 0}
              onClick={handleClick}
              onHover={handleHover}
              isHighlighted={highlightedNode === nd.id}
              isShined={shinedNode === nd.id}
            />
          ))}
        </g>
      </svg>
    </div>
  );
};

export default CayleyTree;
