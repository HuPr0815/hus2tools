import { useEffect, useRef } from 'react';
import { EditorView, placeholder as cmPlaceholder } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { json } from '@codemirror/lang-json';
import { yaml } from '@codemirror/lang-yaml';
import { useTheme } from '@/hooks/useTheme';

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: 'json' | 'yaml' | 'javascript' | 'sql' | 'markdown' | 'text';
  readOnly?: boolean;
  placeholder?: string;
}

function getLanguageExtension(lang: CodeEditorProps['language']) {
  switch (lang) {
    case 'json':
      return json();
    case 'yaml':
      return yaml();
    default:
      return [];
  }
}

export default function CodeEditor({
  value,
  onChange,
  language = 'text',
  readOnly = false,
  placeholder,
}: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!containerRef.current) return;

    const extensions = [
      getLanguageExtension(language),
      EditorView.updateListener.of((update) => {
        if (update.docChanged && onChangeRef.current) {
          onChangeRef.current(update.state.doc.toString());
        }
      }),
    ];

    if (resolvedTheme === 'dark') {
      extensions.push(oneDark);
    }

    if (readOnly) {
      extensions.push(EditorState.readOnly.of(true));
    }

    if (placeholder) {
      extensions.push(cmPlaceholder(placeholder));
    }

    const state = EditorState.create({
      doc: value,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [language, readOnly, resolvedTheme, placeholder]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentDoc = view.state.doc.toString();
    if (currentDoc !== value) {
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: value },
      });
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      className="cm-editor-wrapper rounded-lg overflow-hidden border border-outline-variant/30"
      style={{ minHeight: 200 }}
    />
  );
}
