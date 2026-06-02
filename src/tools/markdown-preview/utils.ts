import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({
  gfm: true,
  breaks: true,
});

export function markdownToHtml(md: string): string {
  const rawHtml = marked.parse(md) as string;
  return DOMPurify.sanitize(rawHtml);
}
