export const ClockHand: React.FC<{ angle: number }> = ({ angle }) => {
  const length = RADIUS + 10; // or similar
  const endX = CENTER.x + Math.cos(angle) * length;
  const endY = CENTER.y + Math.sin(angle) * length;
  // Draw a line
  const path = Skia.Path.Make();
  path.moveTo(CENTER.x, CENTER.y);
  path.lineTo(endX, endY);
  // Optional: add arrow head
  return (
    <Path path={path} color="#FF5252" style="stroke" strokeWidth={4} strokeCap="round" />
  );
};