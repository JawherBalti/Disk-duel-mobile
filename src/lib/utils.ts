import {
  DANGER_ANGLE,
  SAFE_ANGLE,
  BULLSEYE_ANGLE,
  HALF_DISK_START,
  CANVAS_SIZE,
  HALF_DISK_END,
  RADIUS,
} from "./constants";

import { DiskDrawOptions, Sector, SectorType } from "./types";
import {Skia} from '@shopify/react-native-skia';
import type {SkCanvas} from '@shopify/react-native-skia';

export function generateRandomSectors(): Sector[] {
  const types: SectorType[] = ["danger", "safe", "bullseye"];

  const shuffled = [...types];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  let currentStart = HALF_DISK_START;

  return shuffled.map((type) => {
    const angle =
      type === "danger"
        ? DANGER_ANGLE
        : type === "safe"
          ? SAFE_ANGLE
          : BULLSEYE_ANGLE;

    const sector = {
      type,
      start: currentStart,
      end: currentStart + angle,
    };

    currentStart += angle;

    return sector;
  });
}

// Center of the disk (shared across all drawings)
export const CENTER = { x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 + 40 };

// ----------------------------------------------------------------------
// Low-level drawing helpers
// ----------------------------------------------------------------------

/**
 * Draw a single glassy sector with gradient, glow, and sheen.
 */
export function drawGlassySector(
  ctx: CanvasRenderingContext2D,
  startAngle: number,
  endAngle: number,
  baseColor: string,
  glowColor: string,
  darkColor: string,
  innerR: number = RADIUS - 6,
) {
  const midAngle = startAngle + (endAngle - startAngle) / 2;

  // Outer glow shadow
  ctx.save();
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 28;
  ctx.beginPath();
  ctx.moveTo(CENTER.x, CENTER.y);
  ctx.arc(CENTER.x, CENTER.y, innerR, startAngle, endAngle);
  ctx.closePath();

  // Radial gradient from center out
  const grad = ctx.createRadialGradient(
    CENTER.x,
    CENTER.y,
    innerR * 0.1,
    CENTER.x,
    CENTER.y,
    innerR,
  );
  grad.addColorStop(0, darkColor);
  grad.addColorStop(0.55, baseColor);
  grad.addColorStop(1, glowColor);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();

  // Border
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(CENTER.x, CENTER.y);
  ctx.arc(CENTER.x, CENTER.y, innerR, startAngle, endAngle);
  ctx.closePath();
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();

  // Glass sheen
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(CENTER.x, CENTER.y);
  ctx.arc(CENTER.x, CENTER.y, innerR, startAngle, endAngle);
  ctx.closePath();
  ctx.clip();

  const sheenGrad = ctx.createRadialGradient(
    CENTER.x + Math.cos(midAngle) * innerR * 0.55,
    CENTER.y + Math.sin(midAngle) * innerR * 0.55,
    0,
    CENTER.x + Math.cos(midAngle) * innerR * 0.55,
    CENTER.y + Math.sin(midAngle) * innerR * 0.55,
    innerR * 0.45,
  );
  sheenGrad.addColorStop(0, "rgba(255,255,255,0.22)");
  sheenGrad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sheenGrad;
  ctx.beginPath();
  ctx.moveTo(CENTER.x, CENTER.y);
  ctx.arc(CENTER.x, CENTER.y, innerR, startAngle, endAngle);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Draw text labels inside a sector.
 * `lines` is an array of strings (each on a new line).
 */
export function drawSectorLabel(
  ctx: CanvasRenderingContext2D,
  startAngle: number,
  endAngle: number,
  lines: string[],
  fraction: string,
  textColor: string,
) {
  const midAngle = startAngle + (endAngle - startAngle) / 2;
  const labelR = RADIUS * 0.62;
  const lx = CENTER.x + Math.cos(midAngle) * labelR;
  const ly = CENTER.y + Math.sin(midAngle) * labelR;

  ctx.save();
  ctx.translate(lx, ly);
  ctx.rotate(midAngle + Math.PI / 2);

  // fraction label (e.g. "1/4")
  ctx.font = "bold 14px 'Fredoka One', cursive";
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0,0,0,0.7)";
  ctx.shadowBlur = 4;
  ctx.fillText(fraction, 0, -lines.length * 11 - 4);

  // main label lines
  ctx.font = "bold 32px 'Fredoka One', cursive";
  lines.forEach((line, i) => {
    ctx.fillText(line, 0, i * 22);
  });

  ctx.restore();
}

/**
 * Draw the "MOST" (left) and "LEAST" (right) halves used in phases 2 & 3.
 */
export function drawGlassyTwoHalves(ctx: CanvasRenderingContext2D) {
  // Left half — blue (MOST)
  drawGlassySector(
    ctx,
    HALF_DISK_START,
    -Math.PI / 2,
    "#c62828",
    "#ef9a9a",
    "#4a0000",
  );
  // Right half — red (LEAST)
  drawGlassySector(
    ctx,
    -Math.PI / 2,
    HALF_DISK_END,
    "#1565C0",
    "#64B5F6",
    "#0D1B3E",
  );

  // Divider line
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(CENTER.x, CENTER.y);
  ctx.lineTo(CENTER.x, CENTER.y - RADIUS + 6);
  ctx.strokeStyle = "rgba(255,215,0,0.9)";
  ctx.lineWidth = 3;
  ctx.shadowColor = "#FFD700";
  ctx.shadowBlur = 8;
  ctx.stroke();
  ctx.restore();

  // Labels
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "bold 20px 'Fredoka One', cursive";
  ctx.fillStyle = "#fff";
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 5;
  ctx.fillText("MOST", CENTER.x - RADIUS * 0.55, CENTER.y + 30);
  ctx.fillText("LEAST", CENTER.x + RADIUS * 0.55, CENTER.y + 30);
  ctx.restore();
}

/**
 * Draw the metallic base platform under the disk.
 */
// export function drawBasePlatform(ctx: CanvasRenderingContext2D) {
//   const baseH = 22;
//   const platformGrad = ctx.createLinearGradient(
//     CENTER.x - RADIUS,
//     CENTER.y + baseH,
//     CENTER.x + RADIUS,
//     CENTER.y + baseH + baseH,
//   );
//   platformGrad.addColorStop(0, "#3a3a3a");
//   platformGrad.addColorStop(0.4, "#5a5a5a");
//   platformGrad.addColorStop(1, "#2a2a2a");

//   ctx.save();
//   ctx.beginPath();
//   ctx.ellipse(CENTER.x, CENTER.y + baseH, RADIUS + 10, 18, 0, 0, Math.PI);
//   ctx.fillStyle = platformGrad;
//   ctx.shadowColor = "rgba(0,0,0,0.7)";
//   ctx.shadowBlur = 20;
//   ctx.shadowOffsetY = 8;
//   ctx.fill();
//   ctx.restore();
// }

// Assuming CENTER and RADIUS are defined elsewhere in your project
// e.g., const CENTER = { x: 100, y: 100 }; const RADIUS = 50;

/**
 * Draw the dark outer ring border.
 */
export function drawOuterRing(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 6;

  const ringGrad = ctx.createLinearGradient(
    CENTER.x - RADIUS,
    CENTER.y - RADIUS,
    CENTER.x + RADIUS,
    CENTER.y,
  );
  ringGrad.addColorStop(0, "#555");
  ringGrad.addColorStop(0.5, "#888");
  ringGrad.addColorStop(1, "#333");

  ctx.beginPath();
  ctx.arc(CENTER.x, CENTER.y, RADIUS + 8, HALF_DISK_START, HALF_DISK_END);
  ctx.lineTo(CENTER.x, CENTER.y);
  ctx.closePath();
  ctx.fillStyle = ringGrad;
  ctx.fill();
  ctx.restore();
}

/**
 * Draw the center hub (glassy gold with inner dot).
 */
export function drawHub(ctx: CanvasRenderingContext2D) {
  const hubGrad = ctx.createRadialGradient(
    CENTER.x - 4,
    CENTER.y - 4,
    2,
    CENTER.x,
    CENTER.y,
    20,
  );
  hubGrad.addColorStop(0, "#FFE57F");
  hubGrad.addColorStop(0.6, "#FFB300");
  hubGrad.addColorStop(1, "#E65100");

  ctx.save();
  ctx.beginPath();
  ctx.arc(CENTER.x, CENTER.y, 20, 0, 2 * Math.PI);
  ctx.fillStyle = hubGrad;
  ctx.shadowColor = "rgba(255,180,0,0.6)";
  ctx.shadowBlur = 14;
  ctx.fill();

  // Inner dot
  ctx.beginPath();
  ctx.arc(CENTER.x, CENTER.y, 8, 0, 2 * Math.PI);
  ctx.fillStyle = "#1a1a1a";
  ctx.shadowBlur = 0;
  ctx.fill();
  ctx.restore();
}

/**
 * Draw the clock hand (arrow) at a given angle.
 */
export function drawClockHand(ctx: CanvasRenderingContext2D, angle: number) {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 4;

  const handX = CENTER.x + Math.cos(angle) * (RADIUS - 14);
  const handY = CENTER.y + Math.sin(angle) * (RADIUS - 14);

  // Hand body
  const handGrad = ctx.createLinearGradient(CENTER.x, CENTER.y, handX, handY);
  handGrad.addColorStop(0, "#FFD700");
  handGrad.addColorStop(1, "#FF8F00");
  ctx.beginPath();
  ctx.moveTo(CENTER.x, CENTER.y);
  ctx.lineTo(handX, handY);
  ctx.strokeStyle = handGrad;
  ctx.lineWidth = 11;
  ctx.lineCap = "round";
  ctx.stroke();

  // Arrowhead
  const arrowAngle = angle;
  ctx.beginPath();
  ctx.moveTo(handX, handY);
  const leftX = handX - 16 * Math.cos(arrowAngle + Math.PI / 6);
  const leftY = handY - 16 * Math.sin(arrowAngle + Math.PI / 6);
  const rightX = handX - 16 * Math.cos(arrowAngle - Math.PI / 6);
  const rightY = handY - 16 * Math.sin(arrowAngle - Math.PI / 6);
  ctx.lineTo(leftX, leftY);
  ctx.lineTo(rightX, rightY);
  ctx.closePath();
  ctx.fillStyle = "#FFD700";
  ctx.fill();

  // Hub (already drawn separately, but we re-draw to keep consistent layering)
  drawHub(ctx);
  ctx.restore();
}

// ----------------------------------------------------------------------
// High-level disk drawing (combines helpers)
// ----------------------------------------------------------------------

/**
 * Draw the complete disk based on the current game state.
 * This is the main entry point for rendering the disk in the GameRoom.
 */
export function drawDisk(
  ctx: CanvasRenderingContext2D,
  options: DiskDrawOptions,
) {
  const { phase, role, sectors, countdown, clockHandAngle, hoverAngle } =
    options;

  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  if (phase === "lobby") {
    ctx.save();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 32px 'Fredoka One', cursive";
    ctx.textAlign = "center";
    ctx.fillText("Lobby", CENTER.x - 70, CENTER.y);
    ctx.restore();
    return;
  }

  // Draw base and outer ring
  drawBasePlatform(ctx);
  drawOuterRing(ctx);

  // Draw sectors depending on phase and role
  if (phase === "phase1" && role === "player1" && sectors.length > 0) {
    // Player1 sees colored sectors with labels
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
  } else if (phase === "phase1" && role === "player2") {
    // Player2 sees only two halves (no labels)
    drawGlassyTwoHalves(ctx);
  } else if (
    phase === "phase2" ||
    phase === "phase3" ||
    phase === "roundComplete"
  ) {
    drawGlassyTwoHalves(ctx);
  } else {
    // fallback blank disk
    drawGlassySector(
      ctx,
      HALF_DISK_START,
      HALF_DISK_END,
      "#444",
      "#888",
      "#222",
    );
  }

  // Draw the clock hand
  let handAngle = clockHandAngle;
  if (
    phase === "phase3" &&
    handAngle === null &&
    hoverAngle !== null &&
    role === "player2"
  ) {
    handAngle = hoverAngle;
  }
  if (handAngle !== null) {
    drawClockHand(ctx, handAngle);
  }

  // Draw UI text overlays (countdown, hints, phase labels)
  ctx.save();
  ctx.textAlign = "center";
  if (phase === "phase1") {
    if (countdown !== null) {
      ctx.font = "bold 48px 'Fredoka One', cursive";
      ctx.fillStyle = "#FFD700";
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 10;
      ctx.fillText(`${countdown}s`, CENTER.x, CENTER.y - RADIUS - 28);
      ctx.font = "bold 20px 'Comic Neue', cursive";
      ctx.fillStyle = "#fff";
      ctx.fillText("Memorise the zones!", CENTER.x, CENTER.y - RADIUS - 68);
    } else if (role === "player1" && sectors.length === 0) {
      ctx.font = "bold 20px 'Comic Neue', cursive";
      ctx.fillStyle = "#fff";
      ctx.fillText("Click 'Ready' below", CENTER.x, CENTER.y - RADIUS - 38);
    }
  } else if (phase === "phase3") {
    ctx.font = "bold 20px 'Comic Neue', cursive";
    ctx.fillStyle = "#fff";
    ctx.fillText("Click to place arrow", CENTER.x, CENTER.y - RADIUS - 20);
  } else if (phase === "roundComplete") {
    ctx.font = "bold 22px 'Comic Neue', cursive";
    ctx.fillStyle = "#FFD700";
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 6;
    ctx.fillText("Round complete!", CENTER.x, CENTER.y - RADIUS - 28);
  } else if (phase === "phase2") {
    ctx.font = "bold 20px 'Comic Neue', cursive";
    ctx.fillStyle = "#fff";
    ctx.fillText("Phase 2: Categories", CENTER.x, CENTER.y - RADIUS - 28);
  }
  ctx.restore();

  // Game over overlay
  if (phase === "gameover") {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.82)";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.fillStyle = "#FF5252";
    ctx.font = "bold 46px 'Fredoka One', cursive";
    ctx.textAlign = "center";
    ctx.shadowColor = "#ff0000";
    ctx.shadowBlur = 18;
    ctx.fillText("GAME OVER", CENTER.x, CENTER.y);
    ctx.restore();
  }

  // Victory overlay
  if (phase === "victory") {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.82)";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.fillStyle = "#52ff7d";
    ctx.font = "bold 46px 'Fredoka One', cursive";
    ctx.textAlign = "center";
    ctx.shadowColor = "#ff0000";
    ctx.shadowBlur = 18;
    ctx.fillText("VICTORY", CENTER.x, CENTER.y);
    ctx.restore();
  }
}

// Add this function to diskDrawing.ts

export function getSectorStyle(type: Sector["type"]) {
  if (type === "danger") {
    return {
      baseColor: "#e53935",
      glowColor: "#ff6659",
      darkColor: "#7f0000",
      textColor: "#ffcdd2",
      label: "💀",
      fraction: "",
    };
  } else if (type === "safe") {
    return {
      baseColor: "#43a047",
      glowColor: "#76d275",
      darkColor: "#003300",
      textColor: "#c8e6c9",
      label: "+1",
      fraction: "",
    };
  } else {
    // "bullseye"
    return {
      baseColor: "#c8a400",
      glowColor: "#ffe57f",
      darkColor: "#5f4c00",
      textColor: "#fff9c4",
      label: "+3",
      fraction: "",
    };
  }
}
