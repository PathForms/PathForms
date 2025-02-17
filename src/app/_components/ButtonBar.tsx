import React from "react";

type Direction = "up" | "down" | "left" | "right";

interface ButtonBarProps {
  onMove: (direction: Direction) => void;
}

const ButtonBar: React.FC<ButtonBarProps> = ({ onMove }) => {
  // onclick function
  const handleClick = (direction: Direction) => {
    // You can add additional logic here if needed
    onMove(direction);
  };
  return (
    <div
      style={{
        position: "absolute",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10,
      }}
    >
      <button onClick={() => onMove("up")}>A</button>
      <button onClick={() => onMove("down")}>A'</button>
      <button onClick={() => onMove("left")}>B'</button>
      <button onClick={() => onMove("right")}>B</button>
    </div>
  );
};

export default ButtonBar;
