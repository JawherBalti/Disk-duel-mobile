import { Sector } from "../lib/types";
import GameBoard from "./game-board";

type LoadingSpritesProps = {
    sectors: Sector[]
}

export default function LoadingSprites({ sectors }: LoadingSpritesProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #a855f7 100%)",
      }}
    >
      <GameBoard initialSectors={sectors} />

      <h2
        className="title-anim text-6xl font-bold text-white mb-0 select-none"
        style={{
          fontFamily: "'Fredoka One', cursive",
          textShadow: "0 4px 14px rgba(0,0,0,0.28)",
          letterSpacing: "2px",
        }}
      >
        Loading...
      </h2>
    </div>
  );
}
