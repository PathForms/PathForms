"use client";
import React from "react";
import styles from "./_components/components.module.css";
import { useRouter } from "next/navigation";

const Home = () => {
  const router = useRouter();
  return (
    <div className="flex items-center justify-center h-screen bg-white">
        <button
        className={styles.button}
        style={{
          padding: "12px 28px",
          fontSize: "16px",
          borderRadius: "8px",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
        }}
        onClick={() => router.push("/rank1")}
        >
          Rank 1
        </button>
        <button
        className={styles.button}
        style={{
          padding: "12px 28px",
          fontSize: "16px",
          borderRadius: "8px",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
        }}
        onClick={() => router.push("/rank2")}
        >
          Rank 2
        </button>
    </div>
  );
};

export default Home;
