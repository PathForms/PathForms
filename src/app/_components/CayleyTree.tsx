"use client";
import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import Vertex from "./Vertex";
import Edge from "./Edge";
import styles from "./components.module.css";

interface TreeNode {
  id: string;
  children: TreeNode[];
}

// generate treedata
const generateTree = (depth: number, parentId = "root"): TreeNode => {
  if (depth === 0) return { id: parentId, children: [] };

  return {
    id: parentId,
    children: Array.from({ length: 3 }, (_, i) =>
      generateTree(depth - 1, `${parentId}-${i}`)
    ),
  };
};

const treeData: TreeNode = generateTree(3);

interface NodePosition {
  id: string;
  x: number;
  y: number;
}

interface LinkPosition {
  id: string;
  source: NodePosition;
  target: NodePosition;
}

const CayleyTree: React.FC = () => {
  const [nodes, setNodes] = useState<NodePosition[]>([]);
  const [links, setLinks] = useState<LinkPosition[]>([]);
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);
  const [shinedNode, setShinedNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);

  // d3 anime effect
  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;

    const width = 800;
    const height = 600;

    const root = d3.hierarchy<TreeNode>(treeData);
    const linksData = root.links();
    const nodesData = root.descendants();

    //force directed
    const simulation = d3
      .forceSimulation(nodesData)
      .force(
        "link",
        d3
          .forceLink(linksData)
          .id((d: any) => d.data.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", ticked);

    function ticked() {
      setNodes(
        nodesData.map((d) => ({
          id: d.data.id,
          x: d.x!,
          y: d.y!,
        }))
      );

      setLinks(
        linksData.map((link) => ({
          id: `${link.source.data.id}->${link.target.data.id}`,
          source: {
            id: link.source.data.id,
            x: link.source.x!,
            y: link.source.y!,
          },
          target: {
            id: link.target.data.id,
            x: link.target.x!,
            y: link.target.y!,
          },
        }))
      );
    }

    simulation.alpha(1).restart();

    //zoom and panning
    // Fix: Explicitly define D3 selection types
    const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);
    const g = d3.select<SVGGElement, unknown>(gRef.current);

    // Fix: Correctly define zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3]) // Zoom between 50% and 300%
      .on("zoom", (event) => {
        g.attr("transform", event.transform.toString()); // Apply zoom & pan
      });

    // Fix: Ensure zoom is applied safely
    svg.call(
      zoom as unknown as (
        selection: d3.Selection<SVGSVGElement, unknown, null, undefined>
      ) => void
    );
  }, []);

  const handleHover = (id: string, isHovered: boolean) => {
    setHighlightedNode(isHovered ? id : null);
  };

  const handleClick = (id: string) => {
    setShinedNode(id === shinedNode ? null : id);
  };

  return (
    <div className={styles.cayleyContainer}>
      <svg ref={svgRef} width="100vw" height="100vh" className={styles.cayley}>
        <g ref={gRef}>
          {links.map((link) => (
            <Edge
              key={link.id}
              sourceX={link.source.x}
              sourceY={link.source.y}
              targetX={link.target.x}
              targetY={link.target.y}
              onHover={(hovered) => handleHover(link.id, hovered)}
              isHighlighted={highlightedNode === link.id}
            />
          ))}
          {nodes.map((node) => (
            <Vertex
              key={node.id}
              id={node.id}
              x={node.x}
              y={node.y}
              onClick={handleClick}
              onHover={handleHover}
              isHighlighted={highlightedNode === node.id}
              isShined={shinedNode === node.id}
            />
          ))}
        </g>
      </svg>
    </div>
  );
};

export default CayleyTree;
