import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  text: string;
}

export default function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center justify-center rounded p-1.5 bg-surface-container hover:bg-surface-container-high transition-all duration-200 active:scale-90"
      type="button"
    >
      <span className="relative w-[14px] h-[14px]">
        <Copy
          className={cn(
            'w-3.5 h-3.5 text-on-surface-variant absolute inset-0 transition-all duration-200',
            copied ? 'opacity-0 scale-75 rotate-45' : 'opacity-100 scale-100 rotate-0'
          )}
        />
        <Check
          className={cn(
            'w-3.5 h-3.5 text-success absolute inset-0 transition-all duration-200',
            copied ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-45'
          )}
        />
      </span>
    </button>
  );
}
