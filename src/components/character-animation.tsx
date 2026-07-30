"use client";

import {
  AnimationConfig,
  AnimationState,
  CharacterAnimationProps,
} from "../lib/types";
import { useEffect, useRef, useState } from "react";

const animations: Record<AnimationState, AnimationConfig> = {
  welcome1: {
    src: "/character/welcome1.webp",
    frames: 35,
    fps: 30,
    loop: false,
    width: 640,
    height: 432,
  },
  welcome2: {
    src: "/character/welcome2.webp",
    frames: 40,
    fps: 30,
    loop: false,
    width: 640,
    height: 432,
  },
  welcome3: {
    src: "/character/welcome3.webp",
    frames: 62,
    fps: 30,
    loop: false,
    width: 640,
    height: 432,
  },

  laughing: {
    src: "/character/laughing.webp",
    frames: 53,
    fps: 30,
    loop: false,
    width: 608,
    height: 410,
  },

  hit: {
    src: "/character/hit.webp",
    frames: 35,
    fps: 30,
    loop: false,
    width: 640,
    height: 432,
  },

  attack: {
    src: "/character/attack.webp",
    frames: 99,
    fps: 30,
    loop: false,
    width: 640,
    height: 432,
  },

  victory: {
    src: "/character/victory.webp",
    frames: 86,
    fps: 30,
    loop: false,
    width: 640,
    height: 272,
  },
};

export default function CharacterAnimation({
  state = "welcome1",
  width = 100,
  height = 300,
  caption,
  sprites,
  customHeight,
  customWidth,
  showBubble,
  frame,
}: CharacterAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrame = useRef<number>(0);

  const [displayedCaption, setDisplayedCaption] = useState("");

  useEffect(() => {
    setDisplayedCaption("");

    let index = 0;

    const interval = setInterval(() => {
      index++;

      setDisplayedCaption(caption.slice(0, index));

      if (index >= caption.length) {
        clearInterval(interval);
      }
    }, 40); // speed

    return () => clearInterval(interval);
  }, [caption]);

  useEffect(() => {
    let cancelled = false;

    function start() {
      const sprite = sprites[state];
      const canvas = canvasRef.current;

      if (!sprite || !canvas) return;

      if (cancelled) return;

      const ctx = canvasRef.current?.getContext("2d");

      if (!ctx) return;

      ctx.imageSmoothingEnabled = true;

      const config = animations[state];
      const columns = Math.floor(sprite.width / config.width);
      const frameDuration = 1000 / config.fps;

      // Render a specific frame only
      if (frame !== undefined) {
        const sx = (frame % columns) * config.width;
        const sy = Math.floor(frame / columns) * config.height;

        ctx.clearRect(0, 0, width, height);

        ctx.drawImage(
          sprite,
          sx,
          sy,
          config.width,
          config.height,
          0,
          0,
          width,
          height,
        );

        return;
      }

      let startTime: number | null = null;

      const render = (time: number) => {
        if (startTime === null) {
          startTime = time;
        }

        const elapsed = time - startTime;

        let frame = Math.floor(elapsed / frameDuration);

        if (config.loop) {
          frame %= config.frames;
        } else if (frame >= config.frames) {
          frame = config.frames - 1;
        }

        const sx = (frame % columns) * animations[state].width;

        const sy = Math.floor(frame / columns) * animations[state].height;

        ctx.clearRect(0, 0, width, height);

        ctx.drawImage(
          sprite,
          sx,
          sy,
          animations[state].width,
          animations[state].height,
          0,
          0,
          width,
          height,
        );

        if (config.loop || frame < config.frames - 1) {
          animationFrame.current = requestAnimationFrame(render);
        }
      };

      animationFrame.current = requestAnimationFrame(render);
    }

    start();

    return () => {
      cancelled = true;

      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [sprites, state, width, height]);

  return (
    <div className="relative">
      {caption && showBubble && (
        <div className="speechBubble">
          <span>{displayedCaption}</span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          width: customWidth ? `${customWidth}px` : "200px",
          height: customHeight ? `${customHeight}px` : "200px",
          display: "block",
          userSelect: "none",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
