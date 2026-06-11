import { useRef, useEffect } from 'react';
import { EditorState, Compartment } from '@codemirror/state';
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

function isDarkMode(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

const baseExtensions = [
  lineNumbers(),
  highlightActiveLine(),
  highlightActiveLineGutter(),
  history(),
  foldGutter(),
  indentOnInput(),
  bracketMatching(),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
  EditorView.theme({
    '&': { fontSize: '13px', fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
    '.cm-content': { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
    '.cm-scroller': { overflow: 'auto' },
    '.cm-gutters': { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
  }),
];

export default function CodeEditor({ value, onChange, language, readOnly = false, placeholder: _placeholder, height = '100%' }: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const themeCompartment = useRef(new Compartment());
  const langCompartment = useRef(new Compartment());
  const readOnlyCompartment = useRef(new Compartment());
  const heightCompartment = useRef(new Compartment());

  // Keep onChange ref up to date
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  // Initialize editor once (no value dependency)
  useEffect(() => {
    if (!containerRef.current) return;

    const dark = isDarkMode();
    const extensions = [
      ...baseExtensions,
      langCompartment.current.of(getLanguageExtension(language)),
      readOnlyCompartment.current.of(EditorState.readOnly.of(readOnly)),
      themeCompartment.current.of(dark ? [oneDark] : []),
      heightCompartment.current.of(EditorView.theme({ '&': { height } })),
      EditorView.updateListener.of((update) => {
        if (update.docChanged && onChangeRef.current) {
          onChangeRef.current(update.state.doc.toString());
        }
      }),
    ];

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
    // Only re-create on structural changes, not value changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, readOnly]);

  // Sync value via dispatch (no destroy/recreate)
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

  // Update height via compartment
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: heightCompartment.current.reconfigure(
        EditorView.theme({ '&': { height } })
      ),
    });
  }, [height]);

  // Theme switch via compartment (no destroy/recreate)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const view = viewRef.current;
      if (!view) return;
      const dark = isDarkMode();
      view.dispatch({
        effects: themeCompartment.current.reconfigure(dark ? [oneDark] : []),
      });
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="rounded-xl overflow-hidden border border-clay-gray-medium/20 shadow-clay-inset"
      style={{ height }}
    />
  );
}
