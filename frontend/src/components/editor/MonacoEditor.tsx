'use client'

import { useCallback, useEffect, useRef } from 'react'
import Editor, { OnMount, OnChange, loader } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { cn } from '@/lib/utils'
import { useMode } from '@/contexts'
import type { LearningMode } from '@/lib/api'

// MTG theme: dark fantasy with purple/gold accents
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

// Detailed mode: VS Code-inspired dark theme
const VSCODE_DARK_THEME: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: '', foreground: 'D4D4D4' },
    { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
    { token: 'keyword', foreground: '569CD6' },
    { token: 'keyword.control', foreground: 'C586C0' },
    { token: 'string', foreground: 'CE9178' },
    { token: 'string.escape', foreground: 'D7BA7D' },
    { token: 'number', foreground: 'B5CEA8' },
    { token: 'type', foreground: '4EC9B0' },
    { token: 'class', foreground: '4EC9B0' },
    { token: 'function', foreground: 'DCDCAA' },
    { token: 'variable', foreground: '9CDCFE' },
    { token: 'constant', foreground: '4FC1FF' },
    { token: 'tag', foreground: '569CD6' },
    { token: 'attribute.name', foreground: '9CDCFE' },
    { token: 'attribute.value', foreground: 'CE9178' },
    { token: 'delimiter', foreground: 'D4D4D4' },
    { token: 'delimiter.bracket', foreground: 'FFD700' },
    { token: 'keyword.python', foreground: '569CD6' },
    { token: 'metatag.python', foreground: '4EC9B0' },
    { token: 'tag.decorator', foreground: 'DCDCAA' },
  ],
  colors: {
    'editor.background': '#1E1E1E',
    'editor.foreground': '#D4D4D4',
    'editor.lineHighlightBackground': '#2A2D2E',
    'editor.selectionBackground': '#264F78',
    'editor.inactiveSelectionBackground': '#3A3D41',
    'editorLineNumber.foreground': '#858585',
    'editorLineNumber.activeForeground': '#C6C6C6',
    'editorCursor.foreground': '#AEAFAD',
    'editorWhitespace.foreground': '#3B3B3B',
    'editorIndentGuide.background': '#404040',
    'editorIndentGuide.activeBackground': '#707070',
    'editor.selectionHighlightBackground': '#ADD6FF26',
    'editorBracketMatch.background': '#0064001A',
    'editorBracketMatch.border': '#888888',
    'scrollbarSlider.background': '#79797966',
    'scrollbarSlider.hoverBackground': '#646464B3',
    'scrollbarSlider.activeBackground': '#BFBFBF66',
  },
}

// Simple mode: clean light theme
const SIMPLE_LIGHT_THEME: editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: [
    { token: '', foreground: '1E1E1E' },
    { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
    { token: 'keyword', foreground: '0000FF' },
    { token: 'keyword.control', foreground: 'AF00DB' },
    { token: 'string', foreground: 'A31515' },
    { token: 'number', foreground: '098658' },
    { token: 'type', foreground: '267F99' },
    { token: 'class', foreground: '267F99' },
    { token: 'function', foreground: '795E26' },
    { token: 'variable', foreground: '001080' },
    { token: 'constant', foreground: '0070C1' },
    { token: 'tag', foreground: '800000' },
    { token: 'attribute.name', foreground: 'FF0000' },
    { token: 'attribute.value', foreground: '0451A5' },
    { token: 'delimiter', foreground: '1E1E1E' },
    { token: 'keyword.python', foreground: '0000FF' },
    { token: 'metatag.python', foreground: '267F99' },
    { token: 'tag.decorator', foreground: '795E26' },
  ],
  colors: {
    'editor.background': '#1A1B2E',
    'editor.foreground': '#D4D4D4',
    'editor.lineHighlightBackground': '#FFFFFF08',
    'editor.selectionBackground': '#3B82F630',
    'editor.inactiveSelectionBackground': '#3B82F615',
    'editorLineNumber.foreground': '#FFFFFF30',
    'editorLineNumber.activeForeground': '#FFFFFF60',
    'editorCursor.foreground': '#3B82F6',
    'editorWhitespace.foreground': '#FFFFFF10',
    'editorIndentGuide.background': '#FFFFFF08',
    'editorIndentGuide.activeBackground': '#FFFFFF15',
    'editor.selectionHighlightBackground': '#3B82F620',
    'editorBracketMatch.background': '#3B82F630',
    'editorBracketMatch.border': '#3B82F650',
    'scrollbarSlider.background': '#FFFFFF10',
    'scrollbarSlider.hoverBackground': '#FFFFFF20',
    'scrollbarSlider.activeBackground': '#FFFFFF30',
  },
}

const THEME_MAP: Record<LearningMode, string> = {
  mtg: 'magitech-dark',
  detailed: 'vscode-dark',
  simple: 'simple-clean',
}

// Register all themes once
loader.init().then((monaco) => {
  monaco.editor.defineTheme('magitech-dark', MAGITECH_THEME)
  monaco.editor.defineTheme('vscode-dark', VSCODE_DARK_THEME)
  monaco.editor.defineTheme('simple-clean', SIMPLE_LIGHT_THEME)
})

// Shared editor options
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
  const { mode } = useMode()
  const theme = THEME_MAP[mode]

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
        theme={theme}
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
  const { mode } = useMode()
  const theme = THEME_MAP[mode]

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
        theme={theme}
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
