const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

export interface PasswordOptions {
  length: number;
  lowercase: boolean;
  uppercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

const AMBIGUOUS_CHARS = 'il1Lo0O';

export function generatePassword(options: PasswordOptions): string {
  let chars = '';
  if (options.lowercase) chars += LOWERCASE;
  if (options.uppercase) chars += UPPERCASE;
  if (options.numbers) chars += NUMBERS;
  if (options.symbols) chars += SYMBOLS;
  if (options.excludeAmbiguous) {
    chars = chars.split('').filter(c => !AMBIGUOUS_CHARS.includes(c)).join('');
  }
  if (!chars) chars = LOWERCASE;

  const array = new Uint32Array(options.length);
  crypto.getRandomValues(array);
  return Array.from(array, n => chars[n % chars.length]).join('');
}

export function generateBatch(count: number, options: PasswordOptions): string[] {
  return Array.from({ length: count }, () => generatePassword(options));
}

export function calculateStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: '弱', color: '#EF4444' };
  if (score <= 4) return { score, label: '中', color: '#F59E0B' };
  if (score <= 5) return { score, label: '强', color: '#10B981' };
  return { score, label: '极强', color: '#059669' };
}
