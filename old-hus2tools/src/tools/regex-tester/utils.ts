export interface MatchResult {
  match: string;
  index: number;
  groups: Record<string, string> | undefined;
}

export function matchRegex(pattern: string, flags: string, text: string): MatchResult[] | { error: string } {
  try {
    const regex = new RegExp(pattern, flags);
    const results: MatchResult[] = [];
    let match: RegExpExecArray | null;
    if (flags.includes('g')) {
      while ((match = regex.exec(text)) !== null) {
        results.push({ match: match[0], index: match.index, groups: match.groups });
        if (match[0].length === 0) regex.lastIndex++;
      }
    } else {
      match = regex.exec(text);
      if (match) results.push({ match: match[0], index: match.index, groups: match.groups });
    }
    return results;
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export const COMMON_PATTERNS = [
  { name: '邮箱', pattern: '[\\w.-]+@[\\w.-]+\\.\\w+', flags: 'g' },
  { name: '手机号', pattern: '1[3-9]\\d{9}', flags: 'g' },
  { name: 'URL', pattern: 'https?://[\\w\\-._~:/?#\\[\\]@!$&\'()*+,;=]+', flags: 'g' },
  { name: 'IP地址', pattern: '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}', flags: 'g' },
  { name: '日期', pattern: '\\d{4}[-/]\\d{2}[-/]\\d{2}', flags: 'g' },
  { name: '中文字符', pattern: '[\\u4e00-\\u9fa5]+', flags: 'g' },
];
