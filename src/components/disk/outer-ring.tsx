import {
  Skia,
  Path,
  LinearGradient,
  Shadow,
  vec,
} from "@shopify/react-native-skia";
import {
  CENTER,
  RADIUS,
  HALF_DISK_START,
  HALF_DISK_END,
} from "../../lib/constants";

const toDeg = (rad: number) => (rad * 180) / Math.PI;

export function OuterRing() {
  const r = RADIUS + 8;
  const startDeg = toDeg(HALF_DISK_START);
  const sweepDeg = toDeg(HALF_DISK_END - HALF_DISK_START);

  const path = Skia.Path.Make();
  const rect = Skia.XYWHRect(CENTER.x - r, CENTER.y - r, r * 2, r * 2);
  path.moveTo(CENTER.x, CENTER.y); // was missing this before addArc too — add it
  path.arcToOval(rect, startDeg, sweepDeg, false);
  path.lineTo(CENTER.x, CENTER.y); // keep this, or path.close() handles it since we started at center
  path.close();
  return (
    <Path path={path}>
      <LinearGradient
        start={vec(CENTER.x - RADIUS, CENTER.y - RADIUS)}
        end={vec(CENTER.x + RADIUS, CENTER.y)}
        colors={["#555", "#888", "#333"]}
        positions={[0, 0.5, 1]}
      />
      <Shadow dx={4} dy={6} blur={9} color="rgba(0,0,0,0.6)" />
    </Path>
  );
}
