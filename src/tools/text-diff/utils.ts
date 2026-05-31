import { diffLines, type Change as _Change } from 'diff';

export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export function computeDiff(oldText: string, newText: string): DiffLine[] {
  const changes = diffLines(oldText, newText);
  const result: DiffLine[] = [];
  let oldLine = 1;
  let newLine = 1;

  for (const change of changes) {
    const lines = change.value.split('\n');
    if (change.value.endsWith('\n')) lines.pop();

    for (const line of lines) {
      if (change.added) {
        result.push({ type: 'added', content: line, newLineNumber: newLine++ });
      } else if (change.removed) {
        result.push({ type: 'removed', content: line, oldLineNumber: oldLine++ });
      } else {
        result.push({ type: 'unchanged', content: line, oldLineNumber: oldLine++, newLineNumber: newLine++ });
      }
    }
  }
  return result;
}

export function getDiffStats(diff: DiffLine[]) {
  const added = diff.filter(d => d.type === 'added').length;
  const removed = diff.filter(d => d.type === 'removed').length;
  const unchanged = diff.filter(d => d.type === 'unchanged').length;
  return { added, removed, unchanged };
}
