"use client";

import { useState, useEffect, useRef } from "react";
import Modal from "./modal";
import {
  drawBasePlatform,
  drawGlassySector,
  drawHub,
  drawOuterRing,
  drawSectorLabel,
  getSectorStyle,
} from "@/lib/utils";
// Import constants from the shared location
import { CANVAS_SIZE } from "../lib/constants";
import { GameBoardProps, Sector } from "../lib/types";

export default function GameBoard({ initialSectors }: GameBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sectors, setSectors] = useState<Sector[]>(initialSectors);
  const [diskPhase, setDiskPhase] = useState<"falling" | "idle">("idle");

  // Trigger the "falling" animation on mount
  useEffect(() => {
    setDiskPhase("falling");
    const t = setTimeout(() => setDiskPhase("idle"), 1000);
    return () => clearTimeout(t);
  }, []);

  // Draw the disk whenever sectors change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    drawBasePlatform(ctx);
    drawOuterRing(ctx);

    for (const sector of sectors) {
      const style = getSectorStyle(sector.type);
      drawGlassySector(
        ctx,
        sector.start,
        sector.end,
        style.baseColor,
        style.glowColor,
        style.darkColor,
      );
      drawSectorLabel(
        ctx,
        sector.start,
        sector.end,
        [style.label],
        style.fraction,
        style.textColor,
      );
    }

    drawHub(ctx);
  }, [sectors]);

  const relaunch = () => {
    setDiskPhase("falling");
    setTimeout(() => setDiskPhase("idle"), 1000);
  };

  return (
    <div
      className={diskPhase === "falling" ? "disk-falling" : "disk-idle"}
      onClick={relaunch}
      style={{ cursor: "pointer", userSelect: "none" }}
      title="Click to re-launch"
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE - 200}
        height={CANVAS_SIZE - 200}
        style={{
          width: CANVAS_SIZE - 200,
          height: CANVAS_SIZE - 200,
          filter: "drop-shadow(0 20px 28px rgba(0,0,0,0.4))",
          display: "block",
        }}
      />
    </div>
  );
}
