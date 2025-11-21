"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const Home = () => {
  const router = useRouter();
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  // Get basePath from next.config
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  // Rainbow colors for PathForms title (from Headbar)
  const colors = [
    "rgb(255, 50, 91)",
    "rgb(0, 255, 106)",
    "rgb(246, 255, 0)",
    "rgb(255, 166, 0)",
    "rgb(255, 0, 255)",
    "rgb(255, 94, 0)",
    "rgb(255, 204, 160)",
    "rgb(152, 0, 137)",
    "rgb(255, 137, 239)",
  ];
  const text = "PathForms";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        width: "100vw",
        overflow: "auto",
        backgroundColor: "#0a0a0a", // Dark theme background from globals.css
        padding: "clamp(16px, 3vh, 40px) 20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{ marginBottom: "clamp(16px, 2.5vh, 40px)", textAlign: "center" }}
      >
        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 42px)",
            fontWeight: "bold",
            marginBottom: "8px",
          }}
        >
          {text.split("").map((char, index) => (
            <span key={index} style={{ color: colors[index % colors.length] }}>
              {char}
            </span>
          ))}
        </h1>
        <p style={{ fontSize: "clamp(14px, 2vw, 18px)", color: "#ededed" }}>
          Explore Free Group Visualizations
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: "clamp(20px, 3vw, 40px)",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          maxWidth: "1400px",
          width: "100%",
        }}
      >
        {/* Rank 1 Button */}
        <button
          style={{
            width: "clamp(280px, 28vw, 380px)",
            height: "clamp(280px, 28vw, 380px)",
            borderRadius: "16px",
            backgroundColor: "#1a1a1a",
            border:
              hoveredButton === "rank1"
                ? "4px solid #3b82f6"
                : "4px solid #2a2a2a",
            boxShadow:
              hoveredButton === "rank1"
                ? "0 20px 25px -5px rgba(59, 130, 246, 0.3), 0 10px 10px -5px rgba(59, 130, 246, 0.2)"
                : "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)",
            cursor: "pointer",
            transition: "all 0.3s ease",
            transform: hoveredButton === "rank1" ? "scale(1.05)" : "scale(1)",
            overflow: "hidden",
            padding: 0,
          }}
          onClick={() => router.push("/rank1")}
          onMouseEnter={() => setHoveredButton("rank1")}
          onMouseLeave={() => setHoveredButton(null)}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                flex: 1,
                position: "relative",
                backgroundColor: "#0a0a0a",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={`${basePath}/rank1.gif`}
                alt="Rank 1 Preview"
                width={380}
                height={300}
                style={{ objectFit: "contain", width: "100%", height: "100%" }}
              />
            </div>
            <div
              style={{
                height: "clamp(50px, 18%, 70px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  hoveredButton === "rank1"
                    ? "linear-gradient(to right, #2563eb, #1d4ed8)"
                    : "linear-gradient(to right, #3b82f6, #2563eb)",
                transition: "background 0.3s ease",
              }}
            >
              <span
                style={{
                  fontSize: "clamp(16px, 2.5vw, 22px)",
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                Rank 1
              </span>
            </div>
          </div>
        </button>

        {/* Rank 2 Button */}
        <button
          style={{
            width: "clamp(280px, 28vw, 380px)",
            height: "clamp(280px, 28vw, 380px)",
            borderRadius: "16px",
            backgroundColor: "#1a1a1a",
            border:
              hoveredButton === "rank2"
                ? "4px solid #8b5cf6"
                : "4px solid #2a2a2a",
            boxShadow:
              hoveredButton === "rank2"
                ? "0 20px 25px -5px rgba(139, 92, 246, 0.3), 0 10px 10px -5px rgba(139, 92, 246, 0.2)"
                : "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)",
            cursor: "pointer",
            transition: "all 0.3s ease",
            transform: hoveredButton === "rank2" ? "scale(1.05)" : "scale(1)",
            overflow: "hidden",
            padding: 0,
          }}
          onClick={() => router.push("/rank2")}
          onMouseEnter={() => setHoveredButton("rank2")}
          onMouseLeave={() => setHoveredButton(null)}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                flex: 1,
                position: "relative",
                backgroundColor: "#0a0a0a",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={`${basePath}/rank2.gif`}
                alt="Rank 2 Preview"
                width={380}
                height={300}
                style={{ objectFit: "contain", width: "100%", height: "100%" }}
              />
            </div>
            <div
              style={{
                height: "clamp(50px, 18%, 70px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  hoveredButton === "rank2"
                    ? "linear-gradient(to right, #7c3aed, #6d28d9)"
                    : "linear-gradient(to right, #8b5cf6, #7c3aed)",
                transition: "background 0.3s ease",
              }}
            >
              <span
                style={{
                  fontSize: "clamp(16px, 2.5vw, 22px)",
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                Rank 2
              </span>
            </div>
          </div>
        </button>

        {/* Rank 3 Button */}
        <button
          style={{
            width: "clamp(280px, 28vw, 380px)",
            height: "clamp(280px, 28vw, 380px)",
            borderRadius: "16px",
            backgroundColor: "#1a1a1a",
            border:
              hoveredButton === "rank3"
                ? "4px solid #800080"
                : "4px solid #2a2a2a",
            boxShadow:
              hoveredButton === "rank3"
                ? "0 20px 25px -5px rgba(128, 0, 128, 0.3), 0 10px 10px -5px rgba(128, 0, 128, 0.2)"
                : "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)",
            cursor: "pointer",
            transition: "all 0.3s ease",
            transform: hoveredButton === "rank3" ? "scale(1.05)" : "scale(1)",
            overflow: "hidden",
            padding: 0,
          }}
          onClick={() => router.push("/rank3")}
          onMouseEnter={() => setHoveredButton("rank3")}
          onMouseLeave={() => setHoveredButton(null)}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                flex: 1,
                position: "relative",
                backgroundColor: "#0a0a0a",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={`${basePath}/rank3.gif`}
                alt="Rank 3 Preview"
                width={380}
                height={300}
                style={{ objectFit: "contain", width: "100%", height: "100%" }}
              />
            </div>
            <div
              style={{
                height: "clamp(50px, 18%, 70px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  hoveredButton === "rank3"
                    ? "linear-gradient(to right, #6a0080, #5a0070)"
                    : "linear-gradient(to right, #800080, #6a0080)",
                transition: "background 0.3s ease",
              }}
            >
              <span
                style={{
                  fontSize: "clamp(16px, 2.5vw, 22px)",
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                Rank 3
              </span>
            </div>
          </div>
        </button>
      </div>

      <div style={{ marginTop: "clamp(16px, 2.5vh, 32px)", textAlign: "center" }}>
        <p style={{ color: "#e0e0e0", fontSize: "clamp(13px, 1.6vw, 16px)" }}>
          Click on a rank to start exploring!
        </p>
      </div>
    </div>
  );
};

export default Home;
