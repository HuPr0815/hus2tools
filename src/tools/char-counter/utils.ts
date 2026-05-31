export interface CharStats {
  chars: number;
  charsNoSpace: number;
  words: number;
  lines: number;
  bytes: number;
  paragraphs: number;
  wordFrequency: { word: string; count: number }[];
}

export function countChars(text: string): CharStats {
  const words = text.trim() ? text.trim().split(/\s+/) : [];
  const freq: Record<string, number> = {};
  for (const w of words) {
    const lw = w.toLowerCase();
    freq[lw] = (freq[lw] || 0) + 1;
  }
  const wordFrequency = Object.entries(freq)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);
  return {
    chars: text.length,
    charsNoSpace: text.replace(/\s/g, '').length,
    words: words.length,
    lines: text ? text.split('\n').length : 0,
    bytes: new TextEncoder().encode(text).length,
    paragraphs: text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0,
    wordFrequency,
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
