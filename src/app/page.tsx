"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

type LandingCard = {
  id: string;
  label: string;
  route: string;
  image: string;
  alt: string;
  borderColor: string;
  shadowColor: string;
  gradient: {
    idle: string;
    hover: string;
  };
};

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

  const cardSize = "clamp(280px, 28vw, 380px)";
  const cards: LandingCard[] = [
    {
      id: "rank1",
      label: "Rank 1",
      route: "/rank1",
      image: `${basePath}/rank1.gif`,
      alt: "Rank 1 Preview",
      borderColor: "#3b82f6",
      shadowColor: "59, 130, 246",
      gradient: {
        idle: "linear-gradient(to right, #3b82f6, #2563eb)",
        hover: "linear-gradient(to right, #2563eb, #1d4ed8)",
      },
    },
    {
      id: "rank2",
      label: "Rank 2",
      route: "/rank2",
      image: `${basePath}/rank2.gif`,
      alt: "Rank 2 Preview",
      borderColor: "#8b5cf6",
      shadowColor: "139, 92, 246",
      gradient: {
        idle: "linear-gradient(to right, #8b5cf6, #7c3aed)",
        hover: "linear-gradient(to right, #7c3aed, #6d28d9)",
      },
    },
    {
      id: "rank3",
      label: "Rank 3",
      route: "/rank3",
      image: `${basePath}/rank3.gif`,
      alt: "Rank 3 Preview",
      borderColor: "#800080",
      shadowColor: "128, 0, 128",
      gradient: {
        idle: "linear-gradient(to right, #800080, #6a0080)",
        hover: "linear-gradient(to right, #6a0080, #5a0070)",
      },
    },
    {
      id: "dual",
      label: "Dual",
      route: "/dual",
      image: `${basePath}/rank3.gif`,
      alt: "Dual Preview",
      borderColor: "#14b8a6",
      shadowColor: "20, 184, 166",
      gradient: {
        idle: "linear-gradient(to right, #14b8a6, #0f766e)",
        hover: "linear-gradient(to right, #0f766e, #115e59)",
      },
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        position: "fixed",
        inset: 0,
        width: "100%",
        overflowY: "auto",
        overflowX: "hidden",
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
        {cards.map((card) => {
          const isHovered = hoveredButton === card.id;
          return (
            <button
              key={card.id}
              style={{
                width: cardSize,
                height: cardSize,
                borderRadius: "16px",
                backgroundColor: "#1a1a1a",
                border: isHovered
                  ? `4px solid ${card.borderColor}`
                  : "4px solid #2a2a2a",
                boxShadow: isHovered
                  ? `0 20px 25px -5px rgba(${card.shadowColor}, 0.3), 0 10px 10px -5px rgba(${card.shadowColor}, 0.2)`
                  : "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                transform: isHovered ? "scale(1.05)" : "scale(1)",
                overflow: "hidden",
                padding: 0,
              }}
              onClick={() => router.push(card.route)}
              onMouseEnter={() => setHoveredButton(card.id)}
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
                    src={card.image}
                    alt={card.alt}
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
                    background: isHovered
                      ? card.gradient.hover
                      : card.gradient.idle,
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
                    {card.label}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
        
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
