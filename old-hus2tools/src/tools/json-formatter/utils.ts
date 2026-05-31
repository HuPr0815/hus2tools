export function formatJson(input: string, indent: number = 2): string {
  return JSON.stringify(JSON.parse(input), null, indent);
}

export function compressJson(input: string): string {
  return JSON.stringify(JSON.parse(input));
}

export function validateJson(input: string): { valid: true } | { valid: false; error: string; suggestion?: string } {
  try {
    JSON.parse(input);
    return { valid: true };
  } catch (e) {
    const msg = (e as Error).message;
    let suggestion: string | undefined;
    if (msg.includes('Unexpected token')) suggestion = '检查是否有多余或缺失的逗号、括号';
    else if (msg.includes('Unexpected end')) suggestion = '检查是否缺少闭合括号 } 或 ]';
    else if (msg.includes('Unexpected non-whitespace')) suggestion = '检查键名是否用双引号包裹';
    return { valid: false, error: msg, suggestion };
  }
}
