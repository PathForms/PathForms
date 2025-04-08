"use client";
import React, { useState, useEffect, useRef } from "react";
import ButtonBar from "./ButtonBar";
import CayleyTree from "./CayleyTree";
import Pathbar from "./Pathbar";
import Headbar from "./Headbar";
import Pathlist from "./Pathlist";
import Pathterminal from "./Pathterminal";
import styles from "./components.module.css";
import CheckNielsen from "./CheckNielsen";
import TutorialPage from "./TutorialPage";
import PopupExplanation from "./PopupExplanation";

type Direction = "up" | "down" | "left" | "right";

// 记录相反方向，防止 backtracking
const oppositeMoves: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

/**
 * 
 *  Interface: 主容器组件
 *   - 保留了你原有的路径操作、CayleyTree、Pathlist、Headbar 等功能。
 *   - 新增 PopupExplanation，用于在 "Invert" 或 "Concatenate" 完成后弹出提示。
 * 
 */
const Interface: React.FC = () => {
  const [pathIndex, setPathIndex] = useState<number[]>([]);
  const [nodePaths, setNodePaths] = useState<string[][]>([]);
  const [edgePaths, setEdgePaths] = useState<string[][]>([]);
  const [moveRecords, setMoveRecords] = useState<Direction[][]>([]);
  const [operationMode, setOperationMode] = useState<string>("normal");
  const [edgeThickness, setEdgeThickness] = useState<number>(0.7);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // ================== 新增：弹窗解释相关状态 ==================
  // 当某个操作执行完后，这里控制是否显示 PopupExplanation，以及对应的操作类型。
  // actionType: "invert" | "concatenate" | "" (空字符串表示无操作)
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [popupAction, setPopupAction] = useState<"invert" | "concatenate" | "">("");

  // 当弹窗自动关闭后，清理状态
  const handlePopupClose = () => {
    setShowPopup(false);
    setPopupAction("");
  };

  // ================== 核心操作函数 ==================

  // 切换到 invert 模式 / 退出
  const setInvert = () => {
    setOperationMode((prev) => (prev === "invert" ? "normal" : "invert"));
  };

  // 切换到 concat 模式 / 退出
  const setConcat = () => {
    setOperationMode((prev) => (prev === "concat" ? "normal" : "concat"));
  };

  // 拼接操作：把第 index2 条路径连接到第 index1 条路径后面
  const concatenate = (index1: number, index2: number) => {
    if (
      index1 < 0 ||
      index1 >= moveRecords.length ||
      index2 < 0 ||
      index2 >= moveRecords.length
    ) {
      console.error("Invalid indices for concatenation:", index1, index2);
      return;
    }

    const path1Moves = [...moveRecords[index1]];
    const path2Moves = [...moveRecords[index2]];

    // 拼接前先看一下尾巴与开头是否会相互抵消
    while (path1Moves.length && path2Moves.length) {
      const tail = path1Moves.at(-1);
      const head = path2Moves.at(0);
      if (tail && head && head === oppositeMoves[tail]) {
        path1Moves.pop();
        path2Moves.shift();
      } else {
        break;
      }
    }

    // 得到新的 move 序列
    const newMoves = [...path1Moves, ...path2Moves];

    // 如果拼接完啥也不剩，那就删除这个路径
    if (newMoves.length === 0) {
      const updatedMove = [...moveRecords];
      const updatedNode = [...nodePaths];
      const updatedEdge = [...edgePaths];
      const updatedIndex = [...pathIndex];

      updatedMove.splice(index1, 1);
      updatedNode.splice(index1, 1);
      updatedEdge.splice(index1, 1);

      // 同时把 index1 从 pathIndex 中移除
      const newPathIndex = updatedIndex.filter((i) => i !== index1);

      setMoveRecords(updatedMove);
      setNodePaths(updatedNode);
      setEdgePaths(updatedEdge);
      setPathIndex(newPathIndex);
    } else {
      // 否则更新 path1
      const updatedMoveRecords = [...moveRecords];
      updatedMoveRecords[index1] = newMoves;
      setMoveRecords(updatedMoveRecords);

      // 重算 nodePaths 和 edgePaths
      const newNodes: string[] = ["0,0"];
      const newEdges: string[] = [];
      for (const direction of newMoves) {
        const [x, y] = newNodes[newNodes.length - 1].split(",").map(Number);
        let nextNodeRaw: [number, number] | null = null;

        switch (direction) {
          case "up":
            nextNodeRaw = [x, y + 100.0 / 2 ** (newNodes.length - 1)];
            break;
          case "down":
            nextNodeRaw = [x, y - 100.0 / 2 ** (newNodes.length - 1)];
            break;
          case "left":
            nextNodeRaw = [x - 100.0 / 2 ** (newNodes.length - 1), y];
            break;
          case "right":
            nextNodeRaw = [x + 100.0 / 2 ** (newNodes.length - 1), y];
            break;
        }
        if (!nextNodeRaw) continue;
        const nextNode = `${nextNodeRaw[0]},${nextNodeRaw[1]}`;
        newNodes.push(nextNode);
        newEdges.push(`${x},${y}->${nextNodeRaw[0]},${nextNodeRaw[1]}`);
      }

      const updatedNodePaths = [...nodePaths];
      const updatedEdgePaths = [...edgePaths];
      updatedNodePaths[index1] = newNodes;
      updatedEdgePaths[index1] = newEdges;
      setNodePaths(updatedNodePaths);
      setEdgePaths(updatedEdgePaths);
    }

    // ===== 当用户完成 Concatenate 操作后，弹出解释 =====
    setPopupAction("concatenate");
    setShowPopup(true);
  };

  // 清空所有路径数据
  const clear = () => {
    setNodePaths([]);
    setEdgePaths([]);
    setMoveRecords([]);
    setPathIndex([]);
    setOperationMode("normal");
  };

  // 倒置某条路径
  const invertPath = (index: number) => {
    if (!moveRecords[index]) return;
    const currentMoves = [...moveRecords[index]];

    const invertedMoves: Direction[] = [];
    const invertedNodes: string[] = ["0,0"];
    const invertedEdges: string[] = [];

    for (let i = currentMoves.length - 1; i >= 0; i--) {
      const oppositeMove = oppositeMoves[currentMoves[i]];
      invertedMoves.push(oppositeMove);

      const [x, y] = invertedNodes[invertedNodes.length - 1]
        .split(",")
        .map(Number);

      let nextNodeRaw: [number, number] | null = null;
      switch (oppositeMove) {
        case "up":
          nextNodeRaw = [x, y + 100.0 / 2 ** (invertedNodes.length - 1)];
          break;
        case "down":
          nextNodeRaw = [x, y - 100.0 / 2 ** (invertedNodes.length - 1)];
          break;
        case "left":
          nextNodeRaw = [x - 100.0 / 2 ** (invertedNodes.length - 1), y];
          break;
        case "right":
          nextNodeRaw = [x + 100.0 / 2 ** (invertedNodes.length - 1), y];
          break;
      }
      if (!nextNodeRaw) continue;
      const nextNode = `${nextNodeRaw[0]},${nextNodeRaw[1]}`;
      invertedNodes.push(nextNode);
      invertedEdges.push(`${x},${y}->${nextNodeRaw[0]},${nextNodeRaw[1]}`);
    }

    // 更新第 index 条路径的数据
    setMoveRecords((prev) => {
      const newList = [...prev];
      newList[index] = invertedMoves;
      return newList;
    });
    setNodePaths((prev) => {
      const newList = [...prev];
      newList[index] = invertedNodes;
      return newList;
    });
    setEdgePaths((prev) => {
      const newList = [...prev];
      newList[index] = invertedEdges;
      return newList;
    });

    // ===== 当用户完成 Invert 操作后，弹出解释 =====
    setPopupAction("invert");
    setShowPopup(true);
  };

  // 生成多条随机路径
  const moveRecordsRef = useRef<Direction[][]>([["up"], ["right"]]);
  const GeneratePath = (n: number) => {
    setNodePaths([]);
    setEdgePaths([]);
    setMoveRecords([]);
    setOperationMode("normal");

    moveRecordsRef.current = [["up"], ["right"]];
    if (n < 2) n = 2;
    while (moveRecordsRef.current.length < n) {
      moveRecordsRef.current.push([]);
    }

    const opposite = (d: Direction) => oppositeMoves[d];
    const allPathsOk = () => moveRecordsRef.current.every((p) => p.length >= 2);

    while (!allPathsOk()) {
      const operation = Math.random() < 0.5 ? 0 : 1;
      if (operation === 0) {
        // Invert
        const idx = Math.floor(Math.random() * moveRecordsRef.current.length);
        const path = [...moveRecordsRef.current[idx]];
        const newMoves = path.reverse().map((d) => opposite(d));
        moveRecordsRef.current[idx] = newMoves;
      } else {
        // Concat
        const idx1 = Math.floor(Math.random() * moveRecordsRef.current.length);
        let idx2 = Math.floor(Math.random() * moveRecordsRef.current.length);
        while (idx1 === idx2) {
          idx2 = Math.floor(Math.random() * moveRecordsRef.current.length);
        }
        const p1 = [...moveRecordsRef.current[idx1]];
        const p2 = [...moveRecordsRef.current[idx2]];

        while (p1.length && p2.length) {
          const tail = p1.at(-1);
          const head = p2.at(0);
          if (tail && head && head === opposite(tail)) {
            p1.pop();
            p2.shift();
          } else {
            break;
          }
        }
        moveRecordsRef.current[idx1] = [...p1, ...p2];
      }
    }

    setMoveRecords(moveRecordsRef.current);

    const newNodePaths: string[][] = [];
    const newEdgePaths: string[][] = [];

    moveRecordsRef.current.forEach((moves) => {
      const thisNodes = ["0,0"];
      const thisEdges: string[] = [];
      for (const d of moves) {
        const [x, y] = thisNodes[thisNodes.length - 1]
          .split(",")
          .map(Number);
        let nextNodeRaw: [number, number] | null = null;

        switch (d) {
          case "up":
            nextNodeRaw = [x, y + 100.0 / 2 ** (thisNodes.length - 1)];
            break;
          case "down":
            nextNodeRaw = [x, y - 100.0 / 2 ** (thisNodes.length - 1)];
            break;
          case "left":
            nextNodeRaw = [x - 100.0 / 2 ** (thisNodes.length - 1), y];
            break;
          case "right":
            nextNodeRaw = [x + 100.0 / 2 ** (thisNodes.length - 1), y];
            break;
        }
        if (nextNodeRaw) {
          const nextNode = `${nextNodeRaw[0]},${nextNodeRaw[1]}`;
          thisNodes.push(nextNode);
          thisEdges.push(`${x},${y}->${nextNodeRaw[0]},${nextNodeRaw[1]}`);
        }
      }
      newNodePaths.push(thisNodes);
      newEdgePaths.push(thisEdges);
    });

    setNodePaths(newNodePaths);
    setEdgePaths(newEdgePaths);

    const newIndexes = moveRecordsRef.current.map((_, idx) => idx);
    setPathIndex(newIndexes);
  };

  const demonstratePath = (index: number) => {
    setPathIndex((prevIndexes) =>
      prevIndexes.includes(index)
        ? prevIndexes.filter((i) => i !== index)
        : [...prevIndexes, index]
    );
  };

  const toggleSettings = () => {
    setShowSettings((prev) => !prev);
  };
  const handleEdgeThicknessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEdgeThickness(Number(e.target.value));
  };
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value as "dark" | "light";
    setTheme(selected);
  };

  return (
    <>

      <TutorialPage />

     
      <PopupExplanation
        show={showPopup}
        actionType={popupAction as "invert" | "concatenate"}
        duration={3000} // 3秒后自动消失
        onClose={handlePopupClose}
      />

      <div className={`${styles.container} ${theme}`}>
        <Headbar
          theme={theme}
          toggleSettings={toggleSettings}
          showSettings={showSettings}
          edgeThickness={edgeThickness}
          handleEdgeThicknessChange={handleEdgeThicknessChange}
          handleThemeChange={handleThemeChange}
        />

        <ButtonBar generate={GeneratePath} />

        <Pathbar
          mode={operationMode}
          setInvert={setInvert}
          setConcat={setConcat}
          nodePaths={nodePaths}
          edgePaths={edgePaths}
          movePaths={moveRecords}
          clear={clear}
          demonstratePath={demonstratePath}
          concatenate={concatenate}
          invert={invertPath}
        />

        <Pathterminal
          pathIndex={pathIndex}
          nodePaths={nodePaths}
          edgePaths={edgePaths}
          moveRecords={moveRecords}
          operationMode={operationMode}
          setPathIndex={setPathIndex}
          setNodePaths={setNodePaths}
          setEdgePaths={setEdgePaths}
          setMoveRecords={setMoveRecords}
          setOperationMode={setOperationMode}
          generate={GeneratePath}
          demonstratePath={demonstratePath}
          concatenate={concatenate}
          invert={invertPath}
        />

        <CayleyTree
          pathIndex={pathIndex}
          nodePaths={nodePaths}
          edgePaths={edgePaths}
          edgeThickness={edgeThickness}
        />

        <Pathlist
          mode={operationMode}
          nodePaths={nodePaths}
          edgePaths={edgePaths}
          movePaths={moveRecords}
          pathIndex={pathIndex}
          demonstratePath={demonstratePath}
          concatenate={concatenate}
          invert={invertPath}
        />

        <CheckNielsen movePaths={moveRecords} />
      </div>
    </>
  );
};

export default Interface;
