'use client'

import { useCallback, useEffect, useRef } from 'react'
import Editor, { OnMount, OnChange, loader } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { cn } from '@/lib/utils'

// Define custom magitech-dark theme
const MAGITECH_THEME: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: '', foreground: 'E8E6E3' },
    { token: 'comment', foreground: '6A6A7A', fontStyle: 'italic' },
    { token: 'keyword', foreground: '5B9FE8' },
    { token: 'keyword.control', foreground: '5B9FE8' },
    { token: 'string', foreground: '4EC9B0' },
    { token: 'string.escape', foreground: 'D4A843' },
    { token: 'number', foreground: 'D4A843' },
    { token: 'type', foreground: '8B5CF6' },
    { token: 'class', foreground: '8B5CF6' },
    { token: 'function', foreground: 'DCDCAA' },
    { token: 'variable', foreground: 'E8E6E3' },
    { token: 'constant', foreground: 'D4A843' },
    { token: 'tag', foreground: '5B9FE8' },
    { token: 'attribute.name', foreground: '8B5CF6' },
    { token: 'attribute.value', foreground: '4EC9B0' },
    { token: 'delimiter', foreground: 'E8E6E3' },
    { token: 'delimiter.bracket', foreground: 'E8E6E3' },
    // Python specific
    { token: 'keyword.python', foreground: '5B9FE8' },
    { token: 'metatag.python', foreground: '8B5CF6' },
    { token: 'tag.decorator', foreground: '8B5CF6' },
  ],
  colors: {
    'editor.background': '#0D0E19',
    'editor.foreground': '#E8E6E3',
    'editor.lineHighlightBackground': '#FFFFFF08',
    'editor.selectionBackground': '#8B5CF630',
    'editor.inactiveSelectionBackground': '#8B5CF615',
    'editorLineNumber.foreground': '#FFFFFF25',
    'editorLineNumber.activeForeground': '#FFFFFF60',
    'editorCursor.foreground': '#D4A843',
    'editorWhitespace.foreground': '#FFFFFF10',
    'editorIndentGuide.background': '#FFFFFF08',
    'editorIndentGuide.activeBackground': '#FFFFFF15',
    'editor.selectionHighlightBackground': '#8B5CF620',
    'editorBracketMatch.background': '#8B5CF630',
    'editorBracketMatch.border': '#8B5CF650',
    'scrollbarSlider.background': '#FFFFFF10',
    'scrollbarSlider.hoverBackground': '#FFFFFF20',
    'scrollbarSlider.activeBackground': '#FFFFFF30',
  },
}

// Register theme once
loader.init().then((monaco) => {
  monaco.editor.defineTheme('magitech-dark', MAGITECH_THEME)
})

// Shared editor options to avoid duplication
const BASE_EDITOR_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  minimap: { enabled: false },
  fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  lineNumbers: 'on',
  lineNumbersMinChars: 3,
  scrollBeyondLastLine: false,
  wordWrap: 'on',
  tabSize: 4,
  automaticLayout: true,
  overviewRulerLanes: 0,
  hideCursorInOverviewRuler: true,
}

interface MonacoEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  height?: string
  readOnly?: boolean
  className?: string
  title?: string
  onValidate?: () => void
}

export function MonacoEditor({
  value,
  onChange,
  language = 'python',
  height = '400px',
  readOnly = false,
  className,
  title = 'Your Code',
  onValidate,
}: MonacoEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  useEffect(() => {
    return () => {
      if (editorRef.current) {
        editorRef.current.dispose()
        editorRef.current = null
      }
    }
  }, [])

  const handleMount: OnMount = useCallback((editor) => {
    editorRef.current = editor
    editor.focus()

    if (onValidate) {
      editor.addCommand(
        2048 | 3, // CtrlCmd + Enter
        () => { onValidate() }
      )
    }
  }, [onValidate])

  const handleChange: OnChange = useCallback(
    (value) => { onChange(value || '') },
    [onChange]
  )

  return (
    <div className={cn('scroll-container overflow-hidden', className)} aria-label={`Code editor: ${title}`} role="region">
      <div className="px-4 py-2 border-b border-white/[0.06] bg-white/[0.03] flex items-center justify-between">
        <span className="text-sm font-semibold text-arcane-purple">
          {title}
        </span>
        <div className="flex items-center gap-3">
          {onValidate && (
            <span className="text-xs text-silver/40">
              Ctrl+Enter to validate
            </span>
          )}
          <span className="text-xs text-silver/50 font-mono">
            {language}
          </span>
        </div>
      </div>
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={handleChange}
        onMount={handleMount}
        theme="magitech-dark"
        options={{
          ...BASE_EDITOR_OPTIONS,
          readOnly,
          fontSize: 14,
          insertSpaces: true,
          padding: { top: 16, bottom: 16 },
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
          renderLineHighlight: 'line',
          contextmenu: true,
          quickSuggestions: true,
          suggestOnTriggerCharacters: true,
        }}
      />
    </div>
  )
}

interface MonacoEditorReadOnlyProps {
  value: string
  language?: string
  height?: string
  className?: string
}

export function MonacoEditorReadOnly({
  value,
  language = 'python',
  height = '200px',
  className,
}: MonacoEditorReadOnlyProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  useEffect(() => {
    return () => {
      if (editorRef.current) {
        editorRef.current.dispose()
        editorRef.current = null
      }
    }
  }, [])

  const handleMount: OnMount = useCallback((editor) => {
    editorRef.current = editor
  }, [])

  return (
    <div className={cn('scroll-container overflow-hidden', className)}>
      <Editor
        height={height}
        language={language}
        value={value}
        onMount={handleMount}
        theme="magitech-dark"
        options={{
          ...BASE_EDITOR_OPTIONS,
          readOnly: true,
          fontSize: 13,
          padding: { top: 12, bottom: 12 },
          scrollbar: {
            vertical: 'auto',
            horizontal: 'hidden',
            verticalScrollbarSize: 8,
          },
          renderLineHighlight: 'none',
          contextmenu: false,
          domReadOnly: true,
          cursorStyle: 'underline',
        }}
      />
    </div>
  )
}
