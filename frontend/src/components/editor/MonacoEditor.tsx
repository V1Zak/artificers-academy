'use client'

import { useCallback, useRef } from 'react'
import Editor, { OnMount, OnChange } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { cn } from '@/lib/utils'

interface MonacoEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  height?: string
  readOnly?: boolean
  className?: string
}

/**
 * MonacoEditor - A syntax-highlighted code editor
 *
 * Styled to match the scroll/parchment aesthetic of the platform
 * while providing full IDE-like editing capabilities.
 */
export function MonacoEditor({
  value,
  onChange,
  language = 'python',
  height = '400px',
  readOnly = false,
  className,
}: MonacoEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  const handleMount: OnMount = useCallback((editor) => {
    editorRef.current = editor
    // Focus editor on mount
    editor.focus()
  }, [])

  const handleChange: OnChange = useCallback(
    (value) => {
      onChange(value || '')
    },
    [onChange]
  )

  return (
    <div className={cn('scroll-container overflow-hidden', className)}>
      <div className="px-4 py-2 border-b border-scroll-border bg-scroll-bg/50 flex items-center justify-between">
        <span className="text-sm font-semibold text-arcane-purple">
          Your Decklist
        </span>
        <span className="text-xs text-scroll-text/50 font-mono">
          {language}
        </span>
      </div>
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={handleChange}
        onMount={handleMount}
        theme="vs-light"
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          lineNumbers: 'on',
          lineNumbersMinChars: 3,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          tabSize: 4,
          insertSpaces: true,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          renderLineHighlight: 'line',
          contextmenu: true,
          quickSuggestions: true,
          suggestOnTriggerCharacters: true,
        }}
      />
    </div>
  )
}

/**
 * MonacoEditorReadOnly - Read-only version for displaying code examples
 */
export function MonacoEditorReadOnly({
  value,
  language = 'python',
  height = '200px',
  className,
}: Omit<MonacoEditorProps, 'onChange' | 'readOnly'>) {
  return (
    <div className={cn('scroll-container overflow-hidden', className)}>
      <Editor
        height={height}
        language={language}
        value={value}
        theme="vs-light"
        options={{
          readOnly: true,
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          lineNumbers: 'on',
          lineNumbersMinChars: 3,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          tabSize: 4,
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
          scrollbar: {
            vertical: 'auto',
            horizontal: 'hidden',
            verticalScrollbarSize: 8,
          },
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          renderLineHighlight: 'none',
          contextmenu: false,
          domReadOnly: true,
          cursorStyle: 'underline',
        }}
      />
    </div>
  )
}
