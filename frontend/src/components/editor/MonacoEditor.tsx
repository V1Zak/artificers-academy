'use client'

import { useCallback, useEffect, useRef } from 'react'
import Editor, { OnMount, OnChange } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { cn } from '@/lib/utils'

// Shared editor options to avoid duplication
const BASE_EDITOR_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  minimap: { enabled: false },
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
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
  onValidate?: () => void // Callback for Ctrl+Enter
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
  title = 'Your Decklist',
  onValidate,
}: MonacoEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  // Dispose editor on unmount to prevent memory leaks
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

    // Add Ctrl/Cmd+Enter keyboard shortcut for validation
    if (onValidate) {
      editor.addCommand(
        // Monaco.KeyMod.CtrlCmd | Monaco.KeyCode.Enter
        2048 | 3, // CtrlCmd = 2048, Enter = 3
        () => {
          onValidate()
        }
      )
    }
  }, [onValidate])

  const handleChange: OnChange = useCallback(
    (value) => {
      onChange(value || '')
    },
    [onChange]
  )

  return (
    <div className={cn('scroll-container overflow-hidden', className)}>
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
        theme="vs-light"
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

/**
 * MonacoEditorReadOnly - Read-only version for displaying code examples
 */
export function MonacoEditorReadOnly({
  value,
  language = 'python',
  height = '200px',
  className,
}: MonacoEditorReadOnlyProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  // Dispose editor on unmount
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
        theme="vs-light"
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
