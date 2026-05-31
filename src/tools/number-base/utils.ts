export type NumberBase = 'bin' | 'oct' | 'dec' | 'hex';

export function convertBase(input: string, fromBase: NumberBase, toBase: NumberBase): string | { error: string } {
  try {
    const bases: Record<NumberBase, number> = { bin: 2, oct: 8, dec: 10, hex: 16 };
    const cleaned = input.trim().replace(/\s/g, '');
    const num = parseInt(cleaned, bases[fromBase]);
    if (isNaN(num)) return { error: `无效的${fromBase === 'bin' ? '二进制' : fromBase === 'oct' ? '八进制' : fromBase === 'dec' ? '十进制' : '十六进制'}数` };
    if (num < 0) return { error: '暂不支持负数' };
    return num.toString(bases[toBase]).toUpperCase();
  } catch (e) {
    return { error: '转换失败: ' + (e as Error).message };
  }
}

export function convertAll(input: string, fromBase: NumberBase): Record<NumberBase, string> | { error: string } {
  try {
    const bases: Record<NumberBase, number> = { bin: 2, oct: 8, dec: 10, hex: 16 };
    const cleaned = input.trim().replace(/\s/g, '');
    const num = parseInt(cleaned, bases[fromBase]);
    if (isNaN(num)) return { error: '无效的输入数值' };
    return {
      bin: num.toString(2),
      oct: num.toString(8),
      dec: num.toString(10),
      hex: num.toString(16).toUpperCase(),
    };
  } catch (e) {
    return { error: '转换失败: ' + (e as Error).message };
  }
}

export function formatBinary(bin: string): string {
  return bin.replace(/(.{4})/g, '$1 ').trim();
}

export function formatHex(hex: string): string {
  return hex.replace(/(.{2})/g, '$1 ').trim();
}
