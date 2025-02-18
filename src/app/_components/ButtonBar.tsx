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
      <button onClick={() => handleClick("up")}>A</button>
      <button onClick={() => handleClick("down")}>A'</button>
      <button onClick={() => handleClick("left")}>B'</button>
      <button onClick={() => handleClick("right")}>B</button>
    </div>
  );
};

export default ButtonBar;
