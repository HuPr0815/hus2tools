export function textToUnicode(input: string, format: 'unicode' | 'html' | 'css' | 'js'): string {
  switch (format) {
    case 'unicode':
      return Array.from(input).map(c => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`).join('');
    case 'html':
      return Array.from(input).map(c => `&#${c.charCodeAt(0)};`).join('');
    case 'css':
      return Array.from(input).map(c => `\\${c.charCodeAt(0).toString(16)}`).join('');
    case 'js':
      return Array.from(input).map(c => {
        const code = c.charCodeAt(0);
        return code > 127 ? `\\u${code.toString(16).padStart(4, '0')}` : c;
      }).join('');
  }
}

export function unicodeToText(input: string): string | { error: string } {
  try {
    return input
      .replace(/\\u([0-9a-fA-F]{4,6})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)))
      .replace(/\\([0-9a-fA-F]{1,6})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  } catch (e) {
    return { error: 'Unicode 解码失败: ' + (e as Error).message };
  }
}

export function charInfo(char: string): { char: string; code: number; hex: string; unicode: string; html: string; utf8: string } {
  const code = char.charCodeAt(0);
  const bytes = new TextEncoder().encode(char);
  return {
    char,
    code,
    hex: '0x' + code.toString(16).toUpperCase(),
    unicode: 'U+' + code.toString(16).toUpperCase().padStart(4, '0'),
    html: `&#${code};`,
    utf8: Array.from(bytes, b => '0x' + b.toString(16).padStart(2, '0')).join(' '),
  };
}
