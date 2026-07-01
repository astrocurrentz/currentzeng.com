import SVGPathCommander from "svg-path-commander";

export function parsePathToVertices(path: string, sampleLength = 15) {
  const commander = new SVGPathCommander(path);
  const points: { x: number; y: number }[] = [];
  let lastPoint: { x: number; y: number } | null = null;
  const totalLength = commander.getTotalLength();

  for (let length = 0; length < totalLength; length += sampleLength) {
    const point = commander.getPointAtLength(length);

    if (
      lastPoint === null ||
      point.x !== lastPoint.x ||
      point.y !== lastPoint.y
    ) {
      points.push({ x: point.x, y: point.y });
      lastPoint = point;
    }
  }

  const finalPoint = commander.getPointAtLength(totalLength);

  if (
    lastPoint !== null &&
    (finalPoint.x !== lastPoint.x || finalPoint.y !== lastPoint.y)
  ) {
    points.push({ x: finalPoint.x, y: finalPoint.y });
  }

  return points;
}
