export interface CharStats {
  chars: number;
  charsNoSpace: number;
  words: number;
  lines: number;
  bytes: number;
}

export function countChars(text: string): CharStats {
  return {
    chars: text.length,
    charsNoSpace: text.replace(/\s/g, '').length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    lines: text ? text.split('\n').length : 0,
    bytes: new TextEncoder().encode(text).length,
  };
}

export function removeDuplicates(text: string): string {
  const lines = text.split('\n');
  return [...new Set(lines)].join('\n');
}

export function removeEmptyLines(text: string): string {
  return text.split('\n').filter(line => line.trim()).join('\n');
}

export function sortLines(text: string): string {
  return text.split('\n').sort().join('\n');
}

export function toUpperCase(text: string): string {
  return text.toUpperCase();
}

export function toLowerCase(text: string): string {
  return text.toLowerCase();
}
