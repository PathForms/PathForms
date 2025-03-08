"use client";

import { useRouter } from "next/navigation";

const Modesbutton = () => {
  const router = useRouter();

  const goToPlayground = () => {
    router.push("/playground");
  };
  const goToGame = () => {
    router.push("/game");
  };

  return (
    <div>
      <button onClick={goToPlayground}>Playground</button>
      <button onClick={goToGame}>Game</button>
    </div>
  );
};

export default Modesbutton;
