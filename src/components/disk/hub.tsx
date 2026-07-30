import { Circle, TwoPointConicalGradient, Shadow, vec } from "@shopify/react-native-skia";
import { CENTER } from "../../lib/constants";

export function Hub() {
  return (
    <>
      {/* Outer glassy gold circle */}
      <Circle cx={CENTER.x} cy={CENTER.y} r={20}>
        <TwoPointConicalGradient
          start={vec(CENTER.x - 4, CENTER.y - 4)}
          startR={2}
          end={vec(CENTER.x, CENTER.y)}
          endR={20}
          colors={["#FFE57F", "#FFB300", "#E65100"]}
          positions={[0, 0.6, 1]}
        />
        <Shadow dx={0} dy={0} blur={7} color="rgba(255,180,0,0.6)" />
      </Circle>

      {/* Inner dot — drawn after, no shadow (matches ctx.shadowBlur = 0 before this fill) */}
      <Circle cx={CENTER.x} cy={CENTER.y} r={8} color="#1a1a1a" />
    </>
  );
}