"use client";
import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import Vertex from "./Vertex";
import Edge from "./Edge";

// -------------------------------------
// NodeSim & LinkSim definitions
// -------------------------------------
interface NodeSim extends d3.SimulationNodeDatum {
  id: string;
  initX: number;
  initY: number;
  x?: number;
  y?: number;
}

interface LinkSim extends d3.SimulationLinkDatum<NodeSim> {
  id: string;
  source: NodeSim;
  target: NodeSim;
  direction: string;
}

// -------------------------------------
// Directions object
// -------------------------------------
const directions = {
  up:    { dx: 0,  dy: -1, opposite: "down"  },
  down:  { dx: 0,  dy:  1, opposite: "up"    },
  left:  { dx: -1, dy:  0, opposite: "right" },
  right: { dx:  1, dy:  0, opposite: "left"  },
};
type DirKey = keyof typeof directions;

// -------------------------------------
// buildCayleyTree (recursive)
// -------------------------------------
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
    // Skip the opposite direction (avoid backtracking)
    if (fromDir && info.opposite === fromDir) continue;

    const nx = x + info.dx * step;
    const ny = y + info.dy * step;
    const childId = `${nx},${ny}`;

    if (!nodeMap.has(childId)) {
      nodeMap.set(childId, { id: childId, initX: nx, initY: ny });
    }
    const childNode = nodeMap.get(childId)!;

    const edgeId = parentNode.id + "->" + childNode.id;
    if (!linkMap.has(edgeId)) {
      linkMap.set(edgeId, {
        id: edgeId,
        source: parentNode,
        target: childNode,
        direction: dirName,
      });
    }

    buildCayleyTree(
      nodeMap, linkMap,
      nx, ny,
      depth + 1,
      maxDepth,
      dirName,
      step * 0.5
    );
  }
}

// -------------------------------------
// Main CayleyTree component
// -------------------------------------
const CayleyTree: React.FC = () => {
  // React states
  const [nodes, setNodes] = useState<NodeSim[]>([]);
  const [links, setLinks] = useState<LinkSim[]>([]);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [shinedId, setShinedId] = useState<string | null>(null);

  // refs for <svg> and <g>
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    // 1) Build the fractal tree data
    const nodeMap = new Map<string, NodeSim>();
    const linkMap = new Map<string, LinkSim>();
    buildCayleyTree(nodeMap, linkMap, 0, 0, 0, 4, null, 100);

    const nodeArray = Array.from(nodeMap.values());
    const linkArray = Array.from(linkMap.values());

    // Give nodes some initial positions
    nodeArray.forEach((nd) => {
      nd.x = nd.initX + window.innerWidth / 2;
      nd.y = nd.initY + window.innerHeight / 2;
    });

    // 2) Create force simulation
    const simulation = d3
      .forceSimulation<NodeSim>(nodeArray)
      .force(
        "link",
        d3
          .forceLink<NodeSim, LinkSim>(linkArray)
          .id(d => d.id)
          .distance(15)
          .strength(1.0)
      )
      // repel nodes so they don't overlap
      .force("charge", d3.forceManyBody().strength((node) => -60))
      // small pulls toward center
      .force("centerX", d3.forceX(window.innerWidth / 2).strength(0.01))
      .force("centerY", d3.forceY(window.innerHeight / 2).strength(0.01))
      // faster decay
      .alphaDecay(0.07)
      // update React state on every tick
      .on("tick", () => {
        setNodes([...nodeArray]);
        setLinks([...linkArray]);
      })
      // when simulation ends, do the bounding-box + smooth transform
      .on("end", () => {
        // Compute bounding box
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        nodeArray.forEach(nd => {
          if (nd.x! < minX) minX = nd.x!;
          if (nd.x! > maxX) maxX = nd.x!;
          if (nd.y! < minY) minY = nd.y!;
          if (nd.y! > maxY) maxY = nd.y!;
        });

        const finalWidth = Math.max(maxX - minX, 1);
        const finalHeight = Math.max(maxY - minY, 1);

        const screenW = window.innerWidth;
        const screenH = window.innerHeight;
        const marginFactor = 0.9;

        const scale = marginFactor * Math.min(
          screenW / finalWidth,
          screenH / finalHeight
        );

        // Identify the root node (assume it's at "0,0")
        const rootNode = nodeArray.find(nd => nd.id === "0,0");
        if (!rootNode) {
          console.error("Root node (id=0,0) not found.");
          return;
        }

        // We'll translate root to the screen center, then scale
        const rootX = rootNode.x!;
        const rootY = rootNode.y!;
        const targetTransform = d3.zoomIdentity
          .translate(screenW / 2, screenH / 2)
          .scale(scale)
          .translate(-rootX, -rootY);

        // Smooth transition over 1 second
        const svgSelection = d3.select(svgRef.current);
        svgSelection
          .transition()
          .duration(800) // 1s, adjust as needed
          .call(zoomBehavior.transform, targetTransform);
      });

    // 3) Setup D3 zoom/pan
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on("zoom", (event) => {
        d3.select(gRef.current).attr("transform", event.transform.toString());
      });

    const svgSelection = d3.select(svgRef.current);
    svgSelection.call(zoomBehavior as any);

    // Save arrays in state
    setNodes(nodeArray);
    setLinks(linkArray);

    // Cleanup: stop the simulation on unmount
    return () => {
      simulation.stop();
    };
  }, []);

  // Mouse events
  const handleHover = (id: string, hover: boolean) => {
    setHighlightedId(hover ? id : null);
  };
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
        <g ref={gRef}>
          {links.map((lk) => (
            <Edge
              key={lk.id}
              sourceX={lk.source.x ?? 0}
              sourceY={lk.source.y ?? 0}
              targetX={lk.target.x ?? 0}
              targetY={lk.target.y ?? 0}
              onHover={(hover) => handleHover(lk.id, hover)}
              isHighlighted={highlightedId === lk.id}
              direction={lk.direction}
            />
          ))}
          {nodes.map((nd) => (
            <Vertex
              key={nd.id}
              id={nd.id}
              x={nd.x ?? 0}
              y={nd.y ?? 0}
              onClick={handleClick}
              onHover={handleHover}
              isHighlighted={highlightedId === nd.id}
              isShined={shinedId === nd.id}
            />
          ))}
        </g>
      </svg>
    </div>
  );
};

export default CayleyTree;
