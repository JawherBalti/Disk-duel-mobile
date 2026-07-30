// animations.ts

import { AnimationConfig, AnimationState } from "./types";

export const animations: Record<AnimationState, AnimationConfig> = {
  welcome1: {
    src: require("../assets/character/welcome1.webp"),
    frames: 35,
    fps: 30,
    loop: false,
    width: 640,
    height: 432,
  },
  welcome2: {
    src: require("../assets/character/welcome2.webp"),
    frames: 40,
    fps: 30,
    loop: false,
    width: 640,
    height: 432,
  },
  welcome3: {
    src: require("../assets/character/welcome3.webp"),
    frames: 62,
    fps: 30,
    loop: false,
    width: 640,
    height: 432,
  },

  laughing: {
    src: require("../assets/character/laughing.webp"),
    frames: 53,
    fps: 30,
    loop: false,
    width: 608,
    height: 410,
  },

  hit: {
    src: require("../assets/character/hit.webp"),
    frames: 35,
    fps: 30,
    loop: false,
    width: 640,
    height: 432,
  },

  attack: {
    src: require("../assets/character/attack.webp"),
    frames: 99,
    fps: 30,
    loop: false,
    width: 640,
    height: 432,
  },

  victory: {
    src: require("../assets/character/victory.webp"),
    frames: 86,
    fps: 30,
    loop: false,
    width: 640,
    height: 272,
  },
};
