const NAMED_ENTITIES: Record<string, string> = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
  '©': '&copy;', '®': '&reg;', '™': '&trade;', '€': '&euro;', '£': '&pound;',
  '¥': '&yen;', '¢': '&cent;', '§': '&sect;', '°': '&deg;', '±': '&plusmn;',
  '×': '&times;', '÷': '&divide;', '←': '&larr;', '→': '&rarr;', '↑': '&uarr;',
  '↓': '&darr;', '♠': '&spades;', '♣': '&clubs;', '♥': '&hearts;', '♦': '&diams;',
  ' ': '&nbsp;', '—': '&mdash;', '–': '&ndash;', '…': '&hellip;',
  '«': '&laquo;', '»': '&raquo;', '¶': '&para;', '·': '&middot;',
};

const REVERSE_ENTITIES: Record<string, string> = {};
for (const [char, entity] of Object.entries(NAMED_ENTITIES)) {
  REVERSE_ENTITIES[entity] = char;
}

export function encodeHtmlEntities(input: string, mode: 'named' | 'numeric' | 'hex'): string {
  let result = '';
  for (const char of input) {
    if (mode === 'named' && NAMED_ENTITIES[char]) {
      result += NAMED_ENTITIES[char];
    } else if (mode === 'numeric') {
      result += `&#${char.charCodeAt(0)};`;
    } else if (mode === 'hex') {
      result += `&#x${char.charCodeAt(0).toString(16).toUpperCase()};`;
    } else {
      result += char;
    }
  }
  return result;
}

export function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&#[xX]([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)))
    .replace(/&[a-zA-Z]+;/g, (entity) => REVERSE_ENTITIES[entity] || entity);
}
