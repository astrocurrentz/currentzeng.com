export function calculatePosition(
  value: number | string | undefined,
  containerSize: number,
  elementSize: number,
) {
  if (typeof value === "string" && value.endsWith("%")) {
    return containerSize * (Number.parseFloat(value) / 100);
  }

  if (typeof value === "number") {
    return value;
  }

  return (containerSize - elementSize) / 2;
}
