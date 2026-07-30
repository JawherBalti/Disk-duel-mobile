import { Howl } from "howler";

export const backgroundHomeMusic = new Howl({
  src: ["/audio/bg-home.m4a"],
  loop: true,
  volume: 0.3,
  preload: true,
});

export const backgroundRoomMusic = new Howl({
  src: ["/audio/bg-room.m4a"],
  loop: true,
  volume: 0.3,
  preload: true,
});

export const backgroundVictory = new Howl({
  src: ["/audio/bg-victory.m4a"],
  loop: false,
  volume: 0.3,
  preload: true,
});

export const backgroundGameover = new Howl({
  src: ["/audio/bg-gameover.m4a"],
  loop: false,
  volume: 0.3,
  preload: true,
});

export const hit = new Howl({
  src: ["/audio/sfx/hit.m4a"],
  volume: 0.6,
});

export const attack = new Howl({
  src: ["/audio/sfx/attack.m4a"],
  volume: 0.6,
});

export const click = new Howl({
  src: ["/audio/sfx/click.m4a"],
  volume: 0.6,
});

export const reveal = new Howl({
  src: ["/audio/sfx/reveal.m4a"],
  volume: 0.6,
});

export const cardPick = new Howl({
  src: ["/audio/sfx/pick.m4a"],
  volume: 0.6,
});

export const tick = new Howl({
  src: ["/audio/sfx/tick.m4a"],
  volume: 0.2,
});

export const countdownTick = new Howl({
  src: ["/audio/sfx/countdown.m4a"],
  volume: 0.2,
});