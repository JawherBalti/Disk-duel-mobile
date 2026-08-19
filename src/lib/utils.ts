import {
  DANGER_ANGLE,
  SAFE_ANGLE,
  BULLSEYE_ANGLE,
  HALF_DISK_START,
  CANVAS_SIZE,
} from "./constants";

import { Sector, SectorType } from "./types";

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
