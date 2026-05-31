const NEWLINE_BEFORE = new Set([
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER', 'GROUP', 'HAVING',
  'LIMIT', 'OFFSET', 'UNION', 'INSERT', 'VALUES', 'UPDATE', 'SET',
  'DELETE', 'CREATE', 'ALTER', 'DROP', 'JOIN', 'LEFT', 'RIGHT',
  'INNER', 'OUTER', 'CROSS', 'FULL', 'ON', 'WITH',
]);

const INDENT_AFTER = new Set([
  'SELECT', 'FROM', 'WHERE', 'SET', 'VALUES',
]);

export function formatSql(input: string, indentSize: number = 2): string {
  const tokens = tokenize(input);
  const indent = ' '.repeat(indentSize);
  let result = '';
  let indentLevel = 0;
  let newline = true;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const upper = token.toUpperCase();

    if (token === '(') {
      result += token;
      continue;
    }
    if (token === ')') {
      result += token;
      continue;
    }
    if (token === ',') {
      result += token + '\n' + indent.repeat(indentLevel);
      continue;
    }

    if (NEWLINE_BEFORE.has(upper) && !newline) {
      result += '\n';
      if (['AND', 'OR'].includes(upper)) {
        result += indent.repeat(indentLevel);
      } else {
        indentLevel = Math.max(0, indentLevel - 1);
        result += indent.repeat(indentLevel);
      }
      newline = true;
    }

    if (!newline) result += ' ';
    result += token;
    newline = false;

    if (INDENT_AFTER.has(upper)) {
      indentLevel++;
    }
  }

  return result.trim();
}

export function compressSql(input: string): string {
  return input.replace(/\s+/g, ' ').replace(/\s*,\s*/g, ', ').replace(/\s*\(\s*/g, '(').replace(/\s*\)\s*/g, ')').trim();
}

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inString: string | null = null;

  for (const char of input) {
    if (inString) {
      current += char;
      if (char === inString) {
        tokens.push(current);
        current = '';
        inString = null;
      }
      continue;
    }

    if (char === "'" || char === '"') {
      if (current.trim()) tokens.push(current.trim());
      current = char;
      inString = char;
      continue;
    }

    if ('(),;'.includes(char)) {
      if (current.trim()) tokens.push(current.trim());
      tokens.push(char);
      current = '';
      continue;
    }

    if (/\s/.test(char)) {
      if (current.trim()) {
        tokens.push(current.trim());
        current = '';
      }
      continue;
    }

    current += char;
  }

  if (current.trim()) tokens.push(current.trim());
  return tokens;
}
