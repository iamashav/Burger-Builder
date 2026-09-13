function channels(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.replace('#', ''), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

/** Linear blend of two `#rrggbb` colours; `weight` is how much of `b` ends up in the result. */
export function mix(a: string, b: string, weight: number): string {
  const from = channels(a);
  const to = channels(b);
  const blended = from.map((channel, index) =>
    Math.round(channel + (to[index] - channel) * weight),
  );
  return `#${blended.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}
