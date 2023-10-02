export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start: number, end: number, alpha: number) {
  // Ensure that alpha is clamped between 0 and 1
  alpha = Math.max(0, Math.min(1, alpha));

  // Perform linear interpolation
  return start * (1 - alpha) + end * alpha;
}

export function inverseLerp(start: number, end: number, value: number): number {
  if (start === end) {
    return 0; // Avoid division by zero if start and end are equal
  }

  return (value - start) / (end - start);
}

export function distance(a: number, b: number): number {
  return Math.abs(a - b);
}

export function increaseValue(startValue: number, increaseFactor: number): number {
  if (increaseFactor < 0 || increaseFactor >= 1) {
    throw new Error("Increase factor must be between 0 (inclusive) and 1 (inclusive)");
  }

  return startValue / (1 - increaseFactor);
}
