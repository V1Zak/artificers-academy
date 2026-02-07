'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import type { Components } from 'react-markdown'

const components: Components = {
  h1: ({ children }) => (
    <h2 className="text-2xl font-bold mt-8 mb-4 text-silver">{children}</h2>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-semibold mt-8 mb-3 text-silver">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-semibold mt-6 mb-2 text-silver">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="my-4 leading-relaxed text-silver/70">{children}</p>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-arcane-purple hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="text-silver font-semibold">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  code: ({ className, children }) => {
    const isBlock = className?.includes('language-')
    if (isBlock) {
      return <code className={`${className} text-sm font-mono`}>{children}</code>
    }
    return (
      <code className="bg-arcane-purple/10 text-arcane-purple px-1.5 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    )
  },
  pre: ({ children }) => (
    <pre className="bg-black/30 border border-white/[0.08] rounded-lg p-4 my-4 overflow-x-auto text-sm font-mono">
      {children}
    </pre>
  ),
  ul: ({ children }) => (
    <ul className="list-disc ml-6 my-4 text-silver/70 marker:text-arcane-purple">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal ml-6 my-4 text-silver/70 marker:text-arcane-purple">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="my-1">{children}</li>,
  hr: () => <hr className="my-8 border-white/[0.08]" />,
  table: ({ children }) => (
    <table className="w-full my-4 border-collapse">{children}</table>
  ),
  th: ({ children }) => (
    <th className="border border-white/[0.08] px-4 py-2 bg-white/5 font-semibold text-left text-silver">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-white/[0.06] px-4 py-2 text-silver/70">
      {children}
    </td>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-arcane-purple/40 pl-4 my-4 text-silver/60 italic">
      {children}
    </blockquote>
  ),
}

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
