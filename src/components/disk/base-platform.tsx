import { Skia, Path, LinearGradient, Shadow, vec } from "@shopify/react-native-skia";
import { CENTER, RADIUS } from "../../lib/constants";

export function BasePlatform() {
  const baseH = 22;

  // Bounding rect for the ellipse, same math as ctx.ellipse(cx, cy, rx, ry, ...)
  const rx = RADIUS + 10;
  const ry = 18;
  const cx = CENTER.x;
  const cy = CENTER.y + baseH;

  const path = Skia.Path.Make();
  const ovalRect = Skia.XYWHRect(cx - rx, cy - ry, rx * 2, ry * 2);
  // ctx.ellipse(..., 0, Math.PI) sweeps 0 -> 180deg (clockwise, y-down = bottom half)
  path.addArc(ovalRect, 0, 180);
  path.close(); // canvas fill() implicitly closes open subpaths — do it explicitly here

  return (
    <Path path={path}>
      <LinearGradient
        start={vec(CENTER.x - RADIUS, CENTER.y + baseH)}
        end={vec(CENTER.x + RADIUS, CENTER.y + baseH + baseH)}
        colors={["#3a3a3a", "#5a5a5a", "#2a2a2a"]}
        positions={[0, 0.4, 1]}
      />
      <Shadow dx={0} dy={8} blur={10} color="rgba(0,0,0,0.7)" />
    </Path>
  );
}