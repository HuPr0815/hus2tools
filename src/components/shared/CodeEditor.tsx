import { useRef, useEffect } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { defaultKeymap, indentWithTab, history, historyKeymap } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldGutter, indentOnInput } from '@codemirror/language';
import { json } from '@codemirror/lang-json';
import { yaml } from '@codemirror/lang-yaml';
import { oneDark } from '@codemirror/theme-one-dark';

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: 'json' | 'yaml' | 'sql' | 'markdown' | 'javascript' | 'html' | 'css';
  readOnly?: boolean;
  placeholder?: string;
  height?: string;
}

function getLanguageExtension(lang?: string) {
  switch (lang) {
    case 'json': return [json()];
    case 'yaml': return [yaml()];
    default: return [];
  }
}

function getThemeExtension(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

export default function CodeEditor({ value, onChange, language, readOnly = false, placeholder: _placeholder, height = '100%' }: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const isDark = getThemeExtension();
    const extensions = [
      lineNumbers(),
      highlightActiveLine(),
      highlightActiveLineGutter(),
      history(),
      foldGutter(),
      indentOnInput(),
      bracketMatching(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
      ...getLanguageExtension(language),
      EditorView.updateListener.of((update) => {
        if (update.docChanged && onChangeRef.current) {
          onChangeRef.current(update.state.doc.toString());
        }
      }),
      EditorView.theme({
        '&': { height, fontSize: '13px', fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
        '.cm-content': { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
        '.cm-scroller': { overflow: 'auto' },
        '.cm-gutters': { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
      }),
      EditorState.readOnly.of(readOnly),
    ];

    if (isDark) extensions.push(oneDark);

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
  }, [language, readOnly, height, value]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const view = viewRef.current;
      if (!view || !containerRef.current) return;
      const isDark = document.documentElement.classList.contains('dark');
      view.destroy();
      viewRef.current = null;

      const extensions = [
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        history(),
        foldGutter(),
        indentOnInput(),
        bracketMatching(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
        ...getLanguageExtension(language),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && onChangeRef.current) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
        EditorView.theme({
          '&': { height, fontSize: '13px', fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
          '.cm-content': { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
          '.cm-scroller': { overflow: 'auto' },
          '.cm-gutters': { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
        }),
        EditorState.readOnly.of(readOnly),
      ];
      if (isDark) extensions.push(oneDark);

      const currentValue = value;
      const state = EditorState.create({ doc: currentValue, extensions });
      const newView = new EditorView({ state, parent: containerRef.current });
      viewRef.current = newView;
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [language, readOnly, height, value]);

  return (
    <div
      ref={containerRef}
      className="rounded-xl overflow-hidden border border-clay-gray-medium/20 shadow-clay-inset"
      style={{ height }}
    />
  );
}
