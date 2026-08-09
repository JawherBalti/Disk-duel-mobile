import React from "react";
import {
  Skia,
  Canvas,
  Group,
  Path,
  Rect,
  Text,
  vec,
  useFont,
  Shadow,
  LinearGradient,
  matchFont,
} from "@shopify/react-native-skia";
import { Platform, View } from "react-native";
import {
  CENTER,
  RADIUS,
  HALF_DISK_START,
  HALF_DISK_END,
  CANVAS_SIZE,
} from "../lib/constants";
import { SectorType, Sector, GamePhase } from "../lib/types";

// Your existing Skia components
import { BasePlatform } from "./disk/base-platform";
import { OuterRing } from "./disk/outer-ring";
import { GlassySector } from "./disk/glassy-sector";
import { Hub } from "./disk/hub";
// import { ClockHand } from "./disk/clock-hand";

// --------------------------------------------------------------------
// 1. Styles for sector types (used for player1’s coloured sectors)
// --------------------------------------------------------------------
const SECTOR_STYLES: Record<
  SectorType,
  { baseColor: string; glowColor: string; darkColor: string }
> = {
  bullseye: {
    baseColor: "#FFD700",
    glowColor: "#FFA000",
    darkColor: "#FF6F00",
  },
  safe: {
    baseColor: "#4CAF50",
    glowColor: "#81C784",
    darkColor: "#2E7D32",
  },
  danger: {
    baseColor: "#F44336",
    glowColor: "#EF9A9A",
    darkColor: "#C62828",
  },
};

// --------------------------------------------------------------------
// 2. Two‑halves colours (MOST = red, LEAST = blue)
// --------------------------------------------------------------------
const HALF_COLORS = {
  left: {
    baseColor: "#c62828",
    glowColor: "#ef9a9a",
    darkColor: "#4a0000",
  },
  right: {
    baseColor: "#1565C0",
    glowColor: "#64B5F6",
    darkColor: "#0D1B3E",
  },
};

// --------------------------------------------------------------------
// 3. Clock hand component (unchanged)
// --------------------------------------------------------------------
const ClockHand: React.FC<{ angle: number }> = ({ angle }) => {
  const length = RADIUS + 10;
  const endX = CENTER.x + Math.cos(angle) * length;
  const endY = CENTER.y + Math.sin(angle) * length;

  const path = Skia.Path.Make();
  path.moveTo(CENTER.x, CENTER.y);
  path.lineTo(endX, endY);

  const tipSize = 12;
  const tipAngle = angle;
  const tipPath = Skia.Path.Make();
  tipPath.moveTo(endX, endY);
  tipPath.lineTo(
    endX - Math.cos(angle - tipAngle) * tipSize,
    endY - Math.sin(angle - tipAngle) * tipSize,
  );
  tipPath.lineTo(
    endX - Math.cos(angle + tipAngle) * tipSize,
    endY - Math.sin(angle + tipAngle) * tipSize,
  );
  tipPath.close();

  return (
    <Group>
      <Path
        path={path}
        color="#FF5252"
        style="stroke"
        strokeWidth={6}
        strokeCap="round"
      >
        <Shadow dx={0} dy={2} blur={6} color="rgba(255,0,0,0.4)" />
      </Path>
      <Path path={tipPath} color="#FF5252">
        <Shadow dx={0} dy={2} blur={6} color="rgba(255,0,0,0.4)" />
      </Path>
    </Group>
  );
};

// --------------------------------------------------------------------
// 4. Helper to get a system font of a given size
// --------------------------------------------------------------------
const getSystemFont = (size: number) => {
  const typeface = Skia.Typeface.MakeDefault();
  return new Skia.Font(typeface, size); // <--- Added 'new'
};

// --------------------------------------------------------------------
// 5. Main Disk component
// --------------------------------------------------------------------
interface DiskProps {
  phase: GamePhase;
  role: "player1" | "player2" | null;
  sectors: Sector[];
  countdown: number | null;
  clockHandAngle: number | null;
  hoverAngle: number | null;
  scale: number;
}

const fontFamily = Platform.OS === "ios" ? "Helvetica" : "sans-serif";
const defaultFont = matchFont({
  fontFamily: fontFamily,
  fontSize: 32,
  fontWeight: "bold",
});

export default function Disk({
  phase,
  role,
  sectors,
  countdown,
  clockHandAngle,
  hoverAngle,
  scale,
}: DiskProps) {
  // ---- Lobby early return ----
  //   if (phase === "lobby") {
  //     return (
  //       <View>
  //           <Text
  //             x={CENTER.x - 70}
  //             y={CENTER.y}
  //             text="Lobby"
  //             font={defaultFont}
  //             color="#000"
  //           />
  //       </View>
  //     );
  //   }

  // ---- Determine which sectors to show ----
  const showPlayer1Sectors =
    phase === "phase1" && role === "player1" && sectors.length > 0;

  const showTwoHalves =
    (phase === "phase1" && role === "player2") ||
    phase === "phase2" ||
    phase === "phase3" ||
    phase === "roundComplete";

  // ---- Determine clock hand angle ----
  let handAngle = clockHandAngle;
  if (
    phase === "phase3" &&
    handAngle === null &&
    hoverAngle !== null &&
    role === "player2"
  ) {
    handAngle = hoverAngle;
  }

  // ---- Draw divider line (shared by two‑halves) ----
  const dividerPath = Skia.Path.Make();
  dividerPath.moveTo(CENTER.x, CENTER.y);
  dividerPath.lineTo(CENTER.x, CENTER.y - RADIUS + 6);

  return (
    <Group transform={[{ scale }]}>
      {/* ---- Base disk layers ---- */}
      <BasePlatform />
      <OuterRing />

      {/* ---- Sectors ---- */}
      {showPlayer1Sectors &&
        sectors.map((sector, index) => {
          const style = SECTOR_STYLES[sector.type];
          return (
            <GlassySector
              key={index}
              sectorType={sector.type}
              startAngle={sector.start}
              endAngle={sector.end}
              baseColor={style.baseColor}
              glowColor={style.glowColor}
              darkColor={style.darkColor}
              showLabel={true}
            />
          );
        })}

      {showTwoHalves && (
        <>
          {/* Left half: from HALF_DISK_START to -π/2 (straight up) */}
          <GlassySector
            sectorType=""
            startAngle={HALF_DISK_START}
            endAngle={-Math.PI / 2}
            baseColor={HALF_COLORS.left.baseColor}
            glowColor={HALF_COLORS.left.glowColor}
            darkColor={HALF_COLORS.left.darkColor}
            showLabel={false}
          />
          {/* Right half: from -π/2 to HALF_DISK_END */}
          <GlassySector
            sectorType=""
            startAngle={-Math.PI / 2}
            endAngle={HALF_DISK_END}
            baseColor={HALF_COLORS.right.baseColor}
            glowColor={HALF_COLORS.right.glowColor}
            darkColor={HALF_COLORS.right.darkColor}
            showLabel={false}
          />

          {/* Divider line (golden) */}
          <Path
            path={dividerPath}
            color="rgba(255,215,0,0.9)"
            style="stroke"
            strokeWidth={3}
          >
            <Shadow dx={0} dy={0} blur={8} color="#FFD700" />
          </Path>
          <Hub />

          {/* Labels */}
          <Text
            x={CENTER.x - RADIUS}
            y={CENTER.y + 42}
            text="MOST"
            font={defaultFont}
            color="#fff"
            textAlign="center"
          />
          <Text
            x={CENTER.x + RADIUS * 0.55}
            y={CENTER.y + 42}
            text="LEAST"
            font={defaultFont}
            color="#fff"
            textAlign="center"
          />
        </>
      )}

      {/* Fallback (should rarely happen) */}
      {!showPlayer1Sectors && !showTwoHalves && (
        <GlassySector
          sectorType=""
          startAngle={HALF_DISK_START}
          endAngle={HALF_DISK_END}
          baseColor="#444"
          glowColor="#888"
          darkColor="#222"
          showLabel={false}
        />
      )}

      {/* ---- Clock hand ---- */}
      {handAngle !== null && <ClockHand angle={handAngle} />}

      {/* ---- Overlay texts ---- */}
      <Group>
        {phase === "phase1" && (
          <>
            {countdown !== null && (
              <>
                <Text
                  x={CENTER.x - 8}
                  y={CENTER.y - RADIUS - 32}
                  text={`${countdown}s`}
                  font={defaultFont}
                  color="#FFD700"
                />
              </>
            )}
          </>
        )}
      </Group>
    </Group>
  );
}
