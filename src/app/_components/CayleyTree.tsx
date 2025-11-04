"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
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
 direction?: string;
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
 onPathMouseDown?: (pathIndex: number) => void;
 onPathMouseMove?: (e: React.MouseEvent<SVGSVGElement>) => void;
 onPathMouseUp?: (pathIndex: number) => void;
 onDragHover?: (pathIndex: number) => void;
 onDragEnd?: () => void;
 concatenate?: (toIndex: number, fromIndex: number) => void;
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
 onPathMouseDown,
 onPathMouseMove,
 onPathMouseUp,
 onDragHover,
 onDragEnd,
 concatenate,
}) => {
 const [nodes, setNodes] = useState<LayoutNode[]>([]);
 const [links, setLinks] = useState<LayoutLink[]>([]);
 const [localDragStart, setLocalDragStart] = useState<number | null>(null);
 const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
 const [hoveredPathIndex, setHoveredPathIndex] = useState<number | null>(null);


 const svgRef = useRef<SVGSVGElement | null>(null);
 const gRef = useRef<SVGGElement | null>(null);
 const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
 const captureHandlerRef = useRef<((e: MouseEvent) => void) | null>(null);
 // Refs to store latest values for capture handler
 const pathIndexRef = useRef<number[]>(pathIndex);
 const edgePathsRef = useRef<string[][]>(edgePaths);
 const linksRef = useRef<LayoutLink[]>([]);

 // Update refs when state changes
 useEffect(() => {
   pathIndexRef.current = pathIndex;
   edgePathsRef.current = edgePaths;
 }, [pathIndex, edgePaths]);

 useEffect(() => {
   linksRef.current = links;
 }, [links]);


 // Helper function to find which path (edge) is at the mouse position
 const getPathAtPosition = useCallback((x: number, y: number): number | null => {
   if (!gRef.current || pathIndex.length === 0) return null;


   // Get transform of the g element
   const transform = gRef.current.getCTM();
   if (!transform) return null;


   // Invert the transform to get coordinates in the graph's space
   const point = svgRef.current?.createSVGPoint();
   if (!point) return null;
   point.x = x;
   point.y = y;
   const transformedPoint = point.matrixTransform(transform.inverse());


   // Check each visible path
   for (let i = 0; i < pathIndex.length; i++) {
     const idx = pathIndex[i];
     const pathEdges = edgePaths[idx] || [];
     
     // Check if the mouse is near any edge of this path
     for (const edgeId of pathEdges) {
       const link = links.find(l => l.id === edgeId);
       if (!link) continue;
       
       // Calculate distance from point to line segment
       const dx = link.targetX - link.sourceX;
       const dy = link.targetY - link.sourceY;
       const lengthSquared = dx * dx + dy * dy;
       
       if (lengthSquared === 0) continue;
       
       const t = Math.max(0, Math.min(1, 
         ((transformedPoint.x - link.sourceX) * dx + (transformedPoint.y - link.sourceY) * dy) / lengthSquared
       ));
       
       const projX = link.sourceX + t * dx;
       const projY = link.sourceY + t * dy;
       const distance = Math.sqrt(
         Math.pow(transformedPoint.x - projX, 2) + Math.pow(transformedPoint.y - projY, 2)
       );
       
       // Hit detection within threshold
       if (distance < 5) {
         return idx;
       }
     }
   }
   
   return null;
 }, [pathIndex, edgePaths, links]);


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
     linksRef.current = allLinks;
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

         // Determine direction based on coordinate differences
         let direction = "";
         if (childY > parentY) direction = "up";
         else if (childY < parentY) direction = "down";
         else if (childX < parentX) direction = "left";
         else if (childX > parentX) direction = "right";

         // Create the link with proper coordinates
         allLinks.push({
           id: `${d.parent.data.name}->${d.data.name}`,
           source: d.parent.data.name,
           target: d.data.name,
           sourceX: 2.5 * parentX,
           sourceY: 2.5 * parentY,
           targetX: 2.5 * childX,
           targetY: 2.5 * childY,
           direction: direction,
         });
       }
     });


     setNodes(allNodes);
     setLinks(allLinks);
   }
   
   // Enable zoom for circle shape, disable for rect to allow dragging
   if (shape === "circle") {
     const zoomBehavior = d3
       .zoom<SVGSVGElement, unknown>()
       .scaleExtent([0.1, 10])
       .filter((event) => {
         // Disable zoom if clicking on a path
         if (event.type === 'mousedown' || event.type === 'mousemove') {
           const rect = svgRef.current?.getBoundingClientRect();
           if (rect && gRef.current) {
             const x = (event as MouseEvent).clientX - rect.left;
             const y = (event as MouseEvent).clientY - rect.top;
             
             // Quick check using refs
             const currentPathIndex = pathIndexRef.current;
             if (currentPathIndex.length === 0) return true;
             
             const currentEdgePaths = edgePathsRef.current;
             const currentLinks = linksRef.current;
             
             // Get transform
             const transform = gRef.current.getCTM();
             if (!transform) return true;
             
             // Transform coordinates
             const point = svgRef.current?.createSVGPoint();
             if (!point) return true;
             point.x = x;
             point.y = y;
             const transformedPoint = point.matrixTransform(transform.inverse());
             
             // Check paths
             for (let i = 0; i < currentPathIndex.length; i++) {
               const idx = currentPathIndex[i];
               const pathEdges = currentEdgePaths[idx] || [];
               
               for (const edgeId of pathEdges) {
                 const link = currentLinks.find(l => l.id === edgeId);
                 if (!link) continue;
                 
                 const dx = link.targetX - link.sourceX;
                 const dy = link.targetY - link.sourceY;
                 const lengthSquared = dx * dx + dy * dy;
                 
                 if (lengthSquared === 0) continue;
                 
                 const t = Math.max(0, Math.min(1, 
                   ((transformedPoint.x - link.sourceX) * dx + (transformedPoint.y - link.sourceY) * dy) / lengthSquared
                 ));
                 
                 const projX = link.sourceX + t * dx;
                 const projY = link.sourceY + t * dy;
                 const distance = Math.sqrt(
                   Math.pow(transformedPoint.x - projX, 2) + Math.pow(transformedPoint.y - projY, 2)
                 );
                 
                 if (distance < 8) {
                   return false; // Disable zoom
                 }
               }
             }
           }
         }
         return true; // Allow zoom for other interactions
       })
       .on("zoom", (event) => {
         d3.select(gRef.current).attr("transform", event.transform.toString());
       });
     
     zoomBehaviorRef.current = zoomBehavior;
     const svgSelection = d3.select(svgRef.current);
     svgSelection.call(zoomBehavior as any);
     
     // Add a capture-phase listener to intercept path clicks before zoom
     if (svgRef.current) {
       const svgElement = svgRef.current;
       
       // Remove old handler if it exists
       if (captureHandlerRef.current) {
         svgElement.removeEventListener('mousedown', captureHandlerRef.current, true);
       }
       
       const captureHandler = (e: MouseEvent) => {
         const rect = svgElement.getBoundingClientRect();
         const x = e.clientX - rect.left;
         const y = e.clientY - rect.top;
         // Use refs to access latest values
         const currentPathIndex = pathIndexRef.current;
         const currentEdgePaths = edgePathsRef.current;
         const currentLinks = linksRef.current;
         
         if (!gRef.current || currentPathIndex.length === 0) return;
         
         // Get transform of the g element
         const transform = gRef.current.getCTM();
         if (!transform) return;
         
         // Invert the transform to get coordinates in the graph's space
         const point = svgElement.createSVGPoint();
         point.x = x;
         point.y = y;
         const transformedPoint = point.matrixTransform(transform.inverse());
         
         // Check each visible path
         for (let i = 0; i < currentPathIndex.length; i++) {
           const idx = currentPathIndex[i];
           const pathEdges = currentEdgePaths[idx] || [];
           
           // Check if the mouse is near any edge of this path
           for (const edgeId of pathEdges) {
             const link = currentLinks.find(l => l.id === edgeId);
             if (!link) continue;
             
             // Calculate distance from point to line segment
             const dx = link.targetX - link.sourceX;
             const dy = link.targetY - link.sourceY;
             const lengthSquared = dx * dx + dy * dy;
             
             if (lengthSquared === 0) continue;
             
             const t = Math.max(0, Math.min(1, 
               ((transformedPoint.x - link.sourceX) * dx + (transformedPoint.y - link.sourceY) * dy) / lengthSquared
             ));
             
             const projX = link.sourceX + t * dx;
             const projY = link.sourceY + t * dy;
             const distance = Math.sqrt(
               Math.pow(transformedPoint.x - projX, 2) + Math.pow(transformedPoint.y - projY, 2)
             );
             
             // Hit detection within threshold
             if (distance < 8) {
               // Completely disable zoom behavior when clicking on a path
               e.stopPropagation();
               e.stopImmediatePropagation();
               // Remove all zoom-related event listeners
               const svgSelection = d3.select(svgElement);
               svgSelection.on(".zoom", null);
               svgSelection.on("mousedown.zoom", null);
               svgSelection.on("mousemove.zoom", null);
               svgSelection.on("mouseup.zoom", null);
               svgSelection.on("touchstart.zoom", null);
               svgSelection.on("touchmove.zoom", null);
               svgSelection.on("touchend.zoom", null);
               // Also disable wheel zoom
               svgSelection.on("wheel.zoom", null);
               svgSelection.on("dblclick.zoom", null);
               return;
             }
           }
         }
       };
       
       captureHandlerRef.current = captureHandler;
       svgElement.addEventListener('mousedown', captureHandler, true);
     }
   } else {
     zoomBehaviorRef.current = null;
     // Remove capture handler if switching away from circle
     if (captureHandlerRef.current && svgRef.current) {
       svgRef.current.removeEventListener('mousedown', captureHandlerRef.current, true);
       captureHandlerRef.current = null;
     }
   }
   
   // Cleanup function
   return () => {
     if (captureHandlerRef.current && svgRef.current) {
       svgRef.current.removeEventListener('mousedown', captureHandlerRef.current, true);
       captureHandlerRef.current = null;
     }
   };
   
   d3.select(gRef.current).attr(
     "transform",
     `translate(${screenW / 2}, ${screenH / 2})`
   );
 }, [shape]);


 // Handle mouse events for dragging paths
 const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
   // Skip if this is not the primary button (left click)
   if (e.button !== 0) return;
   
   const rect = svgRef.current?.getBoundingClientRect();
   if (!rect) return;
   
   const x = e.clientX - rect.left;
   const y = e.clientY - rect.top;
   const pathIdx = getPathAtPosition(x, y);
   
   if (pathIdx !== null) {
     // Completely disable zoom when starting to drag a path (for circle shape)
     if (shape === "circle" && svgRef.current) {
       const svgSelection = d3.select(svgRef.current);
       // Remove all zoom-related event listeners
       svgSelection.on(".zoom", null);
       svgSelection.on("mousedown.zoom", null);
       svgSelection.on("mousemove.zoom", null);
       svgSelection.on("mouseup.zoom", null);
       svgSelection.on("touchstart.zoom", null);
       svgSelection.on("touchmove.zoom", null);
       svgSelection.on("touchend.zoom", null);
       svgSelection.on("wheel.zoom", null);
       svgSelection.on("dblclick.zoom", null);
     }
     
     setLocalDragStart(pathIdx);
     onPathMouseDown?.(pathIdx);
     e.preventDefault(); // Prevent default behavior
     e.stopPropagation(); // Stop event from reaching zoom behavior
     
     // Set cursor to grabbing
     if (svgRef.current) {
       svgRef.current.style.cursor = 'grabbing';
     }
   }
 };


 const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
   const rect = svgRef.current?.getBoundingClientRect();
   if (!rect) return;
   
   const x = e.clientX - rect.left;
   const y = e.clientY - rect.top;
   
   // Update mouse position for drag feedback
   setMousePosition({ x, y });
   
   // Update cursor when hovering over paths (when not dragging)
   if (localDragStart === null) {
     const pathIdx = getPathAtPosition(x, y);
     if (svgRef.current) {
       svgRef.current.style.cursor = pathIdx !== null ? 'grab' : '';
     }
   }
   
   if (localDragStart !== null) {
     // Prevent zoom during drag (for circle shape)
     if (shape === "circle" && svgRef.current) {
       e.preventDefault();
       e.stopPropagation();
     }
     
     const targetPathIdx = getPathAtPosition(x, y);
     
     // Keep track of hovered path to ensure it stays visible
     setHoveredPathIndex(targetPathIdx);
     
     if (targetPathIdx !== null && onDragHover) {
       onDragHover(targetPathIdx);
     }
     
     onPathMouseMove?.(e);
   } else {
     setHoveredPathIndex(null);
   }
 };


 const handleMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
   // Reset cursor
   if (svgRef.current) {
     svgRef.current.style.cursor = '';
   }
   
   if (localDragStart !== null) {
     const dragStart = localDragStart;
     const rect = svgRef.current?.getBoundingClientRect();
     if (!rect) {
       setLocalDragStart(null);
       setMousePosition(null);
       setHoveredPathIndex(null);
       // Clear preview and notify parent
       onDragEnd?.();
       onPathMouseUp?.(dragStart);
       // Re-enable zoom after drag ends (for circle shape)
       if (shape === "circle" && zoomBehaviorRef.current && svgRef.current) {
         d3.select(svgRef.current).call(zoomBehaviorRef.current as any);
       }
       return;
     }
     
     const x = e.clientX - rect.left;
     const y = e.clientY - rect.top;
     const targetPathIdx = getPathAtPosition(x, y);
     
     if (targetPathIdx !== null && targetPathIdx !== dragStart && concatenate) {
       concatenate(targetPathIdx, dragStart);
     }
     
     setLocalDragStart(null);
     setMousePosition(null);
     setHoveredPathIndex(null);
     onPathMouseUp?.(dragStart);
     // Clear preview and notify parent
     onDragEnd?.();
     
     // Re-enable zoom after drag ends (for circle shape)
     if (shape === "circle" && zoomBehaviorRef.current && svgRef.current) {
       d3.select(svgRef.current).call(zoomBehaviorRef.current as any);
     }
   }
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
       onMouseDown={handleMouseDown}
       onMouseMove={handleMouseMove}
       onMouseUp={handleMouseUp}
       onMouseLeave={(e) => {
         // Clear drag state if mouse leaves SVG while dragging
         if (localDragStart !== null) {
           setLocalDragStart(null);
           setMousePosition(null);
           setHoveredPathIndex(null);
           onDragEnd?.();
           if (svgRef.current) {
             svgRef.current.style.cursor = '';
           }
           // Re-enable zoom after drag ends (for circle shape)
           if (shape === "circle" && zoomBehaviorRef.current && svgRef.current) {
             d3.select(svgRef.current).call(zoomBehaviorRef.current as any);
           }
         } else {
           setMousePosition(null);
           setHoveredPathIndex(null);
         }
       }}
     >
       {shape === "rect" && (
         <defs>
           <marker
             id="arrow-up"
             markerWidth="6"
             markerHeight="6"
             refX="3"
             refY="5"
             markerUnits="strokeWidth"
           >
             <path d="M3,6 L0,0 L6,0 z" fill="rgb(0, 255, 0)" />
           </marker>
           <marker
             id="arrow-right"
             markerWidth="6"
             markerHeight="6"
             refX="5"
             refY="3"
             markerUnits="strokeWidth"
           >
             <path d="M0,0 L5,3 L0,6 z" fill="rgb(0, 255, 0)" />
           </marker>
         </defs>
       )}
       <g ref={gRef}>
         {/* Use a path element so that we can place a marker at the midpoint */}
         {links.map((lk) => {
           // Determine if this edge should be highlighted
           let isActive = false;
           let isDraggedPath = false;
           let isHoveredPath = false;
           
           // Show dragged path (localDragStart) with special highlighting
           if (localDragStart !== null) {
             isDraggedPath = edgePaths[localDragStart]?.includes(lk.id) || false;
           }
           
           // Show hovered path (keep it visible during drag)
           if (hoveredPathIndex !== null && hoveredPathIndex !== localDragStart) {
             isHoveredPath = edgePaths[hoveredPathIndex]?.includes(lk.id) || false;
           }
           
           if (isDragging && dragFromIndex >= 0 && dragHoverIndex >= 0) {
             // When dragging, highlight the two paths involved in concatenation
             isActive = edgePaths[dragFromIndex]?.includes(lk.id) ||
                       edgePaths[dragHoverIndex]?.includes(lk.id);
           } else if (localDragStart !== null) {
             // When dragging, show both dragged path and hovered path
             isActive = isDraggedPath || isHoveredPath;
           } else {
             // Normal display: highlight all paths in pathIndex
             isActive = pathIndex.length > 0 &&
               pathIndex.some((index) => edgePaths[index]?.includes(lk.id));
           }
          
           const isFinalResult = Boolean(previewPath && previewPath.finalResult.edges.includes(lk.id));
           const isCancelledPart = Boolean(previewPath && previewPath.cancelledParts.edges.includes(lk.id));
          
           return (
             <Edge
               key={lk.id}
               source={lk.source}
               target={lk.target}
               sourceX={lk.sourceX}
               sourceY={lk.sourceY}
               targetX={lk.targetX}
               targetY={lk.targetY}
               isActive={isActive || isDraggedPath || isHoveredPath}
               isFinalResult={isFinalResult}
               isCancelledPart={isCancelledPart}
               edgeThickness={isDraggedPath ? edgeThickness + 3 : (isHoveredPath ? edgeThickness + 1 : edgeThickness)}
               shape={shape}
             />
           );
         })}


         {nodes.map((nd) => {
           // Determine if this node should be highlighted
           let isActive = false;
           let isDraggedPathNode = false;
           let isHoveredPathNode = false;
           
           // Show dragged path nodes
           if (localDragStart !== null) {
             isDraggedPathNode = nodePaths[localDragStart]?.includes(nd.id) || false;
           }
           
           // Show hovered path nodes
           if (hoveredPathIndex !== null && hoveredPathIndex !== localDragStart) {
             isHoveredPathNode = nodePaths[hoveredPathIndex]?.includes(nd.id) || false;
           }
           
           if (isDragging && dragFromIndex >= 0 && dragHoverIndex >= 0) {
             // When dragging, highlight the two paths involved in concatenation
             isActive = nodePaths[dragFromIndex]?.includes(nd.id) ||
                       nodePaths[dragHoverIndex]?.includes(nd.id);
           } else if (localDragStart !== null) {
             // When dragging, show both dragged path and hovered path
             isActive = isDraggedPathNode || isHoveredPathNode;
           } else {
             // Normal display: highlight all paths in pathIndex
             isActive = pathIndex.length > 0 &&
               pathIndex.some((index) => nodePaths[index]?.includes(nd.id));
           }
          
           const isFinalResult = Boolean(previewPath && previewPath.finalResult.nodes.includes(nd.id));
           const isCancelledPart = Boolean(previewPath && previewPath.cancelledParts.nodes.includes(nd.id));
          
           return (
             <Vertex
               key={nd.id}
               id={nd.id}
               x={nd.x}
               y={nd.y}
               isActive={isActive || isDraggedPathNode || isHoveredPathNode}
               isFinalResult={isFinalResult}
               isCancelledPart={isCancelledPart}
             />
           );
         })}
         
         {/* Render dragged path following mouse cursor - simplified visual indicator */}
         {localDragStart !== null && mousePosition && (
           <g
             style={{
               pointerEvents: 'none',
             }}
           >
             {/* Draw a ghost copy of the dragged path at mouse position */}
             {edgePaths[localDragStart]?.map((edgeId) => {
               const link = links.find(l => l.id === edgeId);
               if (!link || !gRef.current) return null;
               
               // Get transform to convert from graph space to SVG space
               const transform = gRef.current.getCTM();
               if (!transform) return null;
               
               // Transform coordinates
               const sourcePoint = svgRef.current?.createSVGPoint();
               const targetPoint = svgRef.current?.createSVGPoint();
               if (!sourcePoint || !targetPoint || !svgRef.current) return null;
               
               sourcePoint.x = link.sourceX;
               sourcePoint.y = link.sourceY;
               targetPoint.x = link.targetX;
               targetPoint.y = link.targetY;
               
               const transformedSource = sourcePoint.matrixTransform(transform);
               const transformedTarget = targetPoint.matrixTransform(transform);
               
               // Calculate offset from mouse to path center
               const pathNodes = nodePaths[localDragStart];
               if (!pathNodes || pathNodes.length === 0) return null;
               
               // Find center of the dragged path
               let centerX = 0;
               let centerY = 0;
               let nodeCount = 0;
               pathNodes.forEach((nodeId) => {
                 const node = nodes.find(n => n.id === nodeId);
                 if (node) {
                   const nodePoint = svgRef.current?.createSVGPoint();
                   if (nodePoint) {
                     nodePoint.x = node.x;
                     nodePoint.y = node.y;
                     const transformedNode = nodePoint.matrixTransform(transform);
                     centerX += transformedNode.x;
                     centerY += transformedNode.y;
                     nodeCount++;
                   }
                 }
               });
               
               if (nodeCount > 0) {
                 centerX /= nodeCount;
                 centerY /= nodeCount;
               }
               
               const offsetX = mousePosition.x - centerX;
               const offsetY = mousePosition.y - centerY;
               
               return (
                 <line
                   key={`drag-ghost-${edgeId}`}
                   x1={transformedSource.x + offsetX}
                   y1={transformedSource.y + offsetY}
                   x2={transformedTarget.x + offsetX}
                   y2={transformedTarget.y + offsetY}
                   stroke="rgb(251, 0, 71)"
                   strokeWidth={(edgeThickness + 3) * 1.5}
                   strokeDasharray="8,4"
                   opacity={0.7}
                 />
               );
             })}
           </g>
         )}
       </g>
     </svg>
   </div>
 );
};


export default CayleyTree;
