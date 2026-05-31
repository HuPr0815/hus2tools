export interface GradientStop {
  color: string;
  position: number;
}

export function generateCssGradient(
  type: 'linear' | 'radial',
  angle: number,
  stops: GradientStop[],
  repeating: boolean
): string {
  const stopsStr = stops
    .sort((a, b) => a.position - b.position)
    .map((s) => `${s.color} ${s.position}%`)
    .join(', ');

  if (type === 'radial') {
    return `${repeating ? 'repeating-' : ''}radial-gradient(circle, ${stopsStr})`;
  }
  return `${repeating ? 'repeating-' : ''}linear-gradient(${angle}deg, ${stopsStr})`;
}

export function parseGradientStops(css: string): GradientStop[] {
  const stops: GradientStop[] = [];
  const matches = css.matchAll(/(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))\s*(\d+)?%/g);
  for (const m of matches) {
    stops.push({ color: m[1], position: m[2] ? parseInt(m[2]) : 0 });
  }
  if (stops.length === 0) {
    stops.push({ color: '#74c69d', position: 0 }, { color: '#2d6a4f', position: 100 });
  }
  return stops;
}
