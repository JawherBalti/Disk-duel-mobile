import { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import { Canvas, Group } from "@shopify/react-native-skia";
import {
  useSharedValue,
  withTiming,
  useDerivedValue,
  Easing,
} from "react-native-reanimated";

import { BasePlatform } from "./disk/base-platform";
import { OuterRing } from "./disk/outer-ring";
import { Hub } from "./disk/hub";
import { GlassySector } from "./disk/glassy-sector";
import { getSectorStyle } from "../lib/utils"; // once ported, or keep as pure JS/TS — no ctx needed, doesn't require conversion

// TODO: convert these next, same pattern as BasePlatform
// import { OuterRing } from "./OuterRing";
// import { GlassySector } from "./GlassySector";
// import { SectorLabel } from "./SectorLabel";
// import { Hub } from "./Hub";
// import { getSectorStyle } from "../lib/utils";

import { CANVAS_SIZE } from "../lib/constants";
import { GameBoardProps } from "../lib/types";

const DISPLAY_SIZE = CANVAS_SIZE - 200;
const scale = DISPLAY_SIZE / CANVAS_SIZE;

export default function GameBoard({ initialSectors }: GameBoardProps) {
  const sectors = initialSectors; // wire up real state once sector components exist

  // translateY drives the "falling" animation; runs on the UI thread
  const translateY = useSharedValue(-300);
  const transform = useDerivedValue(() => [{ translateY: translateY.value }]);

  const runFallAnimation = () => {
    translateY.value = -300;
    translateY.value = withTiming(0, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  };

  useEffect(() => {
    runFallAnimation();
  }, []);

  return (
    <Pressable onPress={runFallAnimation} style={styles.container}>
      <Canvas style={{ width: DISPLAY_SIZE, height: DISPLAY_SIZE }}>
          <Group transform={[{ scale }]}>
            <Group transform={transform}>
              <BasePlatform />
              <OuterRing />
              {sectors.map((sector, idx) => {
                const style = getSectorStyle(sector.type);
                return (
                  <GlassySector
                    key={idx}
                    sectorType={sector.type}
                    startAngle={sector.start}
                    endAngle={sector.end}
                    baseColor={style.baseColor}
                    glowColor={style.glowColor}
                    darkColor={style.darkColor}
                  />
                );
              })}

              <Hub />
            </Group>
        </Group>
      </Canvas>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    // RN drop shadows on arbitrary views need elevation (Android) / shadow* (iOS),
    // but since content is inside Skia Canvas, prefer per-shape <Shadow> in Skia instead
  },
});
