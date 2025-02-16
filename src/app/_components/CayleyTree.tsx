"use client"; // 若在 Next.js App Router 中需加

import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";

/** 定义四个方向及其反向 */
const directions = {
  up:    { dx:  0, dy: -1, opposite: "down"  },
  down:  { dx:  0, dy:  1, opposite: "up"    },
  left:  { dx: -1, dy:  0, opposite: "right" },
  right: { dx:  1, dy:  0, opposite: "left"  },
};
type DirKey = keyof typeof directions;

/** 节点结构 */
interface NodeSim {
  id: string;    
  initX: number; // 逻辑坐标
  initY: number;
  x: number;     // 在画布中的绘制坐标
  y: number;
  depth: number;
  step: number;
}

/** 边结构 */
interface LinkSim {
  id: string;
  source: NodeSim;
  target: NodeSim;
  direction: DirKey;
}

/** 递归生成初始 Cayley Tree，避免重复创建 */
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
    nodeMap.set(nodeId, {
      id: nodeId,
      initX: x,
      initY: y,
      x: 0,
      y: 0,
      depth,
      step,
    });
  }
  const parent = nodeMap.get(nodeId)!;

  if (depth >= maxDepth) return;

  // 向四个方向继续递归
  for (const [dirName, info] of Object.entries(directions) as [
    DirKey,
    { dx: number; dy: number; opposite: DirKey }
  ][]) {
    // 不走来路反向
    if (fromDir && info.opposite === fromDir) continue;

    const nx = x + info.dx * step;
    const ny = y + info.dy * step;
    const childId = `${nx},${ny}`;

    if (!nodeMap.has(childId)) {
      nodeMap.set(childId, {
        id: childId,
        initX: nx,
        initY: ny,
        x: 0,
        y: 0,
        depth: depth + 1,
        step: step * 0.5,
      });
    }
    const child = nodeMap.get(childId)!;

    const edgeId = `${nodeId}->${childId}`;
    if (!linkMap.has(edgeId)) {
      linkMap.set(edgeId, {
        id: edgeId,
        source: parent,
        target: child,
        direction: dirName,
      });
    }

    buildCayleyTree(
      nodeMap,
      linkMap,
      nx,
      ny,
      depth + 1,
      maxDepth,
      dirName,
      step * 0.5
    );
  }
}

/** 节点组件：可改 r=2,5,...  */
function Vertex(props: {
  x: number; 
  y: number;
  id: string;
  isHighlighted: boolean;
  isShined: boolean;
  onHover: (id: string, hover: boolean) => void;
  onClick: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const { x, y, id, onHover, onClick, isHighlighted, isShined } = props;

  const handleMouseEnter = () => {
    setHovered(true);
    onHover(id, true);
  };
  const handleMouseLeave = () => {
    setHovered(false);
    onHover(id, false);
  };
  const handleClick = () => onClick(id);

  let fillColor = "lightblue";
  if (hovered) {
    fillColor = "orange";
  } else if (isShined) {
    fillColor = "gold";
  } else if (isHighlighted) {
    fillColor = "#007acc";
  }

  return (
    <circle
      cx={x}
      cy={y}
      r={0.7}              // 节点半径，改大或改小
      fill={fillColor}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    />
  );
}

/** 边组件：可改 strokeWidth=1,2,... */
function Edge(props: {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  direction: DirKey;
  isHighlighted: boolean;
  onHover?: (hovered: boolean) => void;
}) {
  const { sourceX, sourceY, targetX, targetY, direction, isHighlighted, onHover } = props;
  let strokeColor = "#999";
  if (direction === "up" || direction === "down") {
    strokeColor = "pink";
  } else if (direction === "left" || direction === "right") {
    strokeColor = "yellow";
  }
  if (isHighlighted) {
    strokeColor = "orange";
  }
  const handleMouseEnter = () => onHover?.(true);
  const handleMouseLeave = () => onHover?.(false);

  return (
    <line
      x1={sourceX}
      y1={sourceY}
      x2={targetX}
      y2={targetY}
      stroke={strokeColor}
      strokeWidth={0.7}   // 边的粗细
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
}

/** 主组件：全屏+fitToScreen+zoom+防重添加节点 */
export default function CayleyTree() {
  // 全屏
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 节点、边
  const [nodes, setNodes] = useState<NodeSim[]>([]);
  const [links, setLinks] = useState<LinkSim[]>([]);

  // 悬浮、闪耀、选中
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [shinedId, setShinedId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeSim | null>(null);

  // 用于存储数据 Map
  const nodeMapRef = useRef(new Map<string, NodeSim>());
  const linkMapRef = useRef(new Map<string, LinkSim>());

  // 引用
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);

  //--------------------------------------------------------------------------

  // 1) 初始化：递归构建 -> 深度=3, step=50 (比之前的 20 更大, so edges are longer)
  //--------------------------------------------------------------------------

  useEffect(() => {
    const nodeMap = new Map<string, NodeSim>();
    const linkMap = new Map<string, LinkSim>();

    // 设定深度=3，步长=50
    const maxDepth = 4;   
    const step = 50;      

    buildCayleyTree(nodeMap, linkMap, 0, 0, 0, maxDepth, null, step);

    // 设置在屏幕中心
    const cx = size.width / 2;
    const cy = size.height / 2;
    for (let nd of nodeMap.values()) {
      nd.x = nd.initX + cx;
      nd.y = nd.initY + cy;
    }

    nodeMapRef.current = nodeMap;
    linkMapRef.current = linkMap;
    setNodes([...nodeMap.values()]);
    setLinks([...linkMap.values()]);
  }, [size]);

  //--------------------------------------------------------------------------

  // 2) d3-zoom
  //--------------------------------------------------------------------------

  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;
    const svgSelection = d3.select(svgRef.current);
    const gSelection = d3.select(gRef.current);

    // 定义缩放行为
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on("zoom", (event) => {
        gSelection.attr("transform", event.transform);
      });

    svgSelection.call(zoomBehavior as any);

    // 初次渲染后自动fit
    fitToScreen();
  }, [nodes, links]);

  //--------------------------------------------------------------------------

  // 3) fitToScreen：让图形自动适应视口
  //--------------------------------------------------------------------------

  const fitToScreen = () => {
    if (!gRef.current || nodes.length === 0) return;
    const selection = d3.select(gRef.current);

    // 先重置 transform
    selection.attr("transform", null);

    const bbox = gRef.current.getBBox();
    const { x, y, width, height } = bbox;
    if (width === 0 || height === 0) return;

    const margin = 20;
    const w = size.width;
    const h = size.height;

    const scale = Math.min(
      w / (width + 2 * margin),
      h / (height + 2 * margin)
    );
    const translateX = w / 2 - scale * (x + width / 2);
    const translateY = h / 2 - scale * (y + height / 2);

    selection.attr(
      "transform",
      `translate(${translateX}, ${translateY}) scale(${scale})`
    );
  };

  //--------------------------------------------------------------------------

  // 4) 悬浮、点击事件
  //--------------------------------------------------------------------------

  const handleHover = (id: string, hover: boolean) => {
    setHighlightedId(hover ? id : null);
  };
  const handleClick = (id: string) => {
    // 点击切换闪耀
    setShinedId(prev => (prev === id ? null : id));
    // 同时将节点设为selectedNode
    const nd = nodeMapRef.current.get(id) ?? null;
    setSelectedNode(nd);
  };

  //--------------------------------------------------------------------------

  // 5) 添加节点：防止重复
  //--------------------------------------------------------------------------

  const addEdgeInDirection = (dirKey: DirKey) => {
    if (!selectedNode) return;

    const nodeMap = nodeMapRef.current;
    const linkMap = linkMapRef.current;
    const { initX, initY, depth, step } = selectedNode;
    const { dx, dy } = directions[dirKey];

    const nx = initX + dx * step;
    const ny = initY + dy * step;
    const newNodeId = `${nx},${ny}`;

    // 如果节点不存在才创建
    if (!nodeMap.has(newNodeId)) {
      nodeMap.set(newNodeId, {
        id: newNodeId,
        initX: nx,
        initY: ny,
        x: nx + size.width / 2,
        y: ny + size.height / 2,
        depth: depth + 1,
        step: step * 0.5,
      });
    }
    const newNode = nodeMap.get(newNodeId)!;

    // 同理，若边不存在才创建
    const edgeId = `${selectedNode.id}->${newNodeId}`;
    if (!linkMap.has(edgeId)) {
      linkMap.set(edgeId, {
        id: edgeId,
        source: selectedNode,
        target: newNode,
        direction: dirKey,
      });
    }

    // 更新状态
    setNodes([...nodeMap.values()]);
    setLinks([...linkMap.values()]);

    // 新增后可再次fit
    setTimeout(() => {
      fitToScreen();
    }, 0);
  };

  //--------------------------------------------------------------------------

  // 6) JSX渲染
  //--------------------------------------------------------------------------

  return (
    <div style={{ width: "100vw", height: "100vh", margin: 0, padding: 0 }}>
      {/* 操作面板 */}
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 999 }}>
        <div>
          当前选中节点：
          {selectedNode ? `${selectedNode.initX},${selectedNode.initY}` : "无"}
        </div>
        <button onClick={() => addEdgeInDirection("up")}>up</button>
        <button onClick={() => addEdgeInDirection("down")}>down</button>
        <button onClick={() => addEdgeInDirection("left")}>left</button>
        <button onClick={() => addEdgeInDirection("right")}>right</button>
      </div>

      <svg
        ref={svgRef}
        width={size.width}
        height={size.height}
        style={{ display: "block", background: "#fff" }}
      >
        <g ref={gRef}>
          {/* 画边 */}
          {links.map(lk => (
            <Edge
              key={lk.id}
              sourceX={lk.source.x}
              sourceY={lk.source.y}
              targetX={lk.target.x}
              targetY={lk.target.y}
              direction={lk.direction}
              isHighlighted={highlightedId === lk.id}
              onHover={(hover) => handleHover(lk.id, hover)}
            />
          ))}
          {/* 画节点 */}
          {nodes.map(nd => (
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
}
