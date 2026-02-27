"use client";
import React, { useEffect, useMemo, useState } from "react";

import buildNodesEdgesFromMoves from "../utils/buildNodesEdgesFromMoves";
import CayleyTree from "../_components/CayleyTree";

type Direction = "up" | "down" | "left" | "right";
type Token = "a" | "b" | "a^-" | "b^-";

const TOKEN_COLORS: Record<Token, string> = {
  a: "#008cff",
  "a^-": "#008cff",
  b: "#fb0047",
  "b^-": "#fb0047",
};

const tokenToMoves = (token: Token): Direction[] => {
  switch (token) {
    case "a":
      return ["down"];
    case "a^-":
      return ["up"];
    case "b":
      return ["left"];
    case "b^-":
      return ["right"];
  }
};

const formatToken = (token: Token) => token.replace("^-", "^-1");

const randomTokens = () => {
  const base: Token[] = ["a", "b", "a^-", "b^-"];
  const length = 2 + Math.floor(Math.random() * 3);
  let tokens: Token[] = [];

  do {
    tokens = [];
    for (let i = 0; i < length; i += 1) {
      tokens.push(base[Math.floor(Math.random() * base.length)]);
    }
  } while (!tokens.some((token) => token === "a"));

  return tokens;
};

const Demo = () => {
  const [tokens, setTokens] = useState<Token[]>([]);

  useEffect(() => {
    setTokens(randomTokens());
  }, []);

  const { nodePaths, edgePaths, edgeColorOverrides } = useMemo(() => {
    const moves: Direction[] = [];
    const moveColors: string[] = [];

    tokens.forEach((token) => {
      const expandedMoves = tokenToMoves(token);
      const color = TOKEN_COLORS[token];
      expandedMoves.forEach((move) => {
        moves.push(move);
        moveColors.push(color);
      });
    });

    const { newNodes, newEdges } = buildNodesEdgesFromMoves(moves);
    const overrides: Record<string, string> = {};
    newEdges.forEach((edgeId, index) => {
      const color = moveColors[index];
      if (color) overrides[edgeId] = color;
    });

    return {
      nodePaths: [newNodes],
      edgePaths: [newEdges],
      edgeColorOverrides: overrides,
    };
  }, [tokens]);

  const applyATransform = () => {
    setTokens((prev) =>
      prev.flatMap((token) => (token === "a" ? ["a", "b"] : [token]))
    );
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        backgroundColor: "#f5f3ee",
        overflow: "hidden",
      }}
    >
      <CayleyTree
        pathIndex={[0]}
        nodePaths={nodePaths}
        edgePaths={edgePaths}
        edgeThickness={0.7}
        shape="rect"
        edgeColorOverrides={edgeColorOverrides}
      />
      <div
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          right: "auto",
          zIndex: 2,
          padding: "16px 20px",
          borderRadius: "0",
          backgroundColor: "rgba(255, 255, 255, 0.92)",
          border: "1px solid rgba(15, 23, 42, 0.12)",
          color: "#0f172a",
          fontSize: "14px",
          letterSpacing: "0.02em",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div style={{ fontWeight: 600 }}>Demo Path</div>
        <div
          style={{
            fontFamily: "monospace",
            padding: "8px 10px",
            borderRadius: "8px",
            backgroundColor: "rgba(15, 23, 42, 0.04)",
            border: "1px solid rgba(15, 23, 42, 0.08)",
            lineHeight: 1.5,
            wordBreak: "break-word",
          }}
        >
          {tokens.map(formatToken).join(" ")}
        </div>
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={applyATransform}
            style={{
              padding: "8px 20px",
              minWidth: "120px",
              borderRadius: "8px",
              border: "1px solid rgba(0, 140, 255, 0.25)",
              backgroundColor: "rgba(0, 140, 255, 0.15)",
              color: "#003a66",
              cursor: "pointer",
            }}
          >
            a to ab
          </button>
        </div>
      </div>
    </div>
  );
};

export default Demo;
