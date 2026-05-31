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

export function queryJsonPath(json: string, path: string): { value: unknown; error: string | null } {
  try {
    const obj = JSON.parse(json);
    const keys = path.replace(/^\$\.?/, '').split('.').filter(Boolean);
    let current: unknown = obj;
    for (const key of keys) {
      const match = key.match(/^(\w+)\[(\d+)\]$/);
      if (match) {
        current = (current as Record<string, unknown>)?.[match[1]];
        current = (current as unknown[])?.[Number(match[2])];
      } else {
        current = (current as Record<string, unknown>)?.[key];
      }
      if (current === undefined) return { value: null, error: `路径不存在: ${key}` };
    }
    return { value: current, error: null };
  } catch (e) {
    return { value: null, error: (e as Error).message };
  }
}

export function validateJsonPath(path: string): { valid: boolean; error: string | null } {
  if (!path.startsWith('$')) return { valid: false, error: 'JSONPath 必须以 $ 开头' };
  return { valid: true, error: null };
}
