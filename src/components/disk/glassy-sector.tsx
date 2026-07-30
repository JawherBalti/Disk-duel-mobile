import {
  Skia,
  Path,
  Group,
  TwoPointConicalGradient,
  RadialGradient,
  vec,
  Text,
  matchFont,
} from "@shopify/react-native-skia";
import { CENTER, RADIUS } from "../../lib/constants";
import { SectorType } from "../../lib/types";
import {Platform} from "react-native"
const toDeg = (rad: number) => (rad * 180) / Math.PI;

const SECTOR_LABELS: Record<Exclude<SectorType, "danger">, string> = {
  bullseye: "+3",
  safe: "+1",
};

// SVG Path for a simple skull icon (viewBox assumed 24x24)
const SKULL_SVG_PATH =
  "M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h1v2c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2h1c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm-3 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm6 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z";

const skullSkiaPath = Skia.Path.MakeFromSVGString(SKULL_SVG_PATH);

// Define icon settings
const SKULL_ORIGINAL_SIZE = 24;
const SKULL_SCALE_FACTOR = 2.0; // Make it 2x bigger
const SKULL_SCALED_SIZE = SKULL_ORIGINAL_SIZE * SKULL_SCALE_FACTOR; // 48x48
const BORDER_WIDTH = 4; // Black border thickness

// Create standard font for other labels
const fontFamily = Platform.OS === "ios" ? "Helvetica" : "sans-serif";
const defaultFont = matchFont({
  fontFamily: fontFamily,
  fontSize: 32,
  fontWeight: "bold",
});

type GlassySectorProps = {
  sectorType: SectorType;
  startAngle: number;
  endAngle: number;
  baseColor: string;
  glowColor: string;
  darkColor: string;
  innerR?: number;
};

export function GlassySector({
  sectorType,
  startAngle,
  endAngle,
  baseColor,
  glowColor,
  darkColor,
  innerR = RADIUS - 6,
}: GlassySectorProps) {
  const midAngleRad = startAngle + (endAngle - startAngle) / 2;

  // Center position for icon or text (60% out from radial origin)
  const centerRadius = innerR * 0.6;
  const rawX = CENTER.x + Math.cos(midAngleRad) * centerRadius;
  const rawY = CENTER.y + Math.sin(midAngleRad) * centerRadius;

  // Angles for sector arc
  const startDeg = toDeg(startAngle);
  let sweepDeg = toDeg(endAngle - startAngle);
  if (sweepDeg < 0) sweepDeg += 360;

  const sectorPath = Skia.Path.Make();
  const rect = Skia.XYWHRect(CENTER.x - innerR, CENTER.y - innerR, innerR * 2, innerR * 2);
  sectorPath.moveTo(CENTER.x, CENTER.y);
  sectorPath.arcToOval(rect, startDeg, sweepDeg, false);
  sectorPath.close();

  const sheenCx = CENTER.x + Math.cos(midAngleRad) * innerR * 0.55;
  const sheenCy = CENTER.y + Math.sin(midAngleRad) * innerR * 0.55;

  return (
    <>
      {/* --- Sector Fill, Border, Sheen (same as before) --- */}
      <Path path={sectorPath}>
        <TwoPointConicalGradient
          start={vec(CENTER.x, CENTER.y)}
          startR={innerR * 0.1}
          end={vec(CENTER.x, CENTER.y)}
          endR={innerR}
          colors={[darkColor, baseColor, glowColor]}
          positions={[0, 0.55, 1]}
        />
      </Path>
      <Path
        path={sectorPath}
        style="stroke"
        strokeWidth={2.5}
        color="rgba(255,255,255,0.55)"
      />
      <Group clip={sectorPath}>
        <Path path={sectorPath}>
          <RadialGradient
            c={vec(sheenCx, sheenCy)}
            r={innerR * 0.45}
            colors={["rgba(255,255,255,0.22)", "rgba(255,255,255,0)"]}
          />
        </Path>
      </Group>

      {/* --- Render Danger Skull Icon OR Text Label --- */}
      {sectorType === "danger" && skullSkiaPath ? (
        <Group
          transform={[
            // 1. Position the local coordinate system origin at the target center
            { translateX: rawX },
            { translateY: rawY },
            // 2. Scale the group around that origin
            { scale: SKULL_SCALE_FACTOR },
            // 3. Move the SVG's own center (e.g., 12,12) back onto the origin
            { translateX: -(SKULL_ORIGINAL_SIZE / 2) },
            { translateY: -(SKULL_ORIGINAL_SIZE / 2) },
          ]}
        >
          {/* Layer 1: Black Border (drawn first) */}
          <Path
            path={skullSkiaPath}
            color="#000000"
            style="stroke"
            strokeWidth={BORDER_WIDTH}
            // Add strokeJoin "round" to prevent sharp corner artifacts
            strokeJoin="round"
          />
          {/* Layer 2: White Fill (drawn over border) */}
          <Path path={skullSkiaPath} color="#FFFFFF" />
        </Group>
      ) : (
        (() => {
          const labelText = SECTOR_LABELS[sectorType as keyof typeof SECTOR_LABELS] ?? "";
          const textSize = defaultFont.measureText(labelText);
          return (
            <Text
              x={rawX - textSize.width / 2}
              y={rawY + textSize.height / 3}
              text={labelText}
              font={defaultFont}
              color="#FFFFFF"
            />
          );
        })()
      )}
    </>
  );
}