'use client'

import React, { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const formatInlineMarkdown = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-foreground/85">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="rounded bg-sky-100 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800 px-1.5 py-0.5 font-mono text-[11px] text-sky-700 dark:text-sky-300 font-semibold">$1</code>')
  }

  const renderElements = () => {
    const lines = content.split('\n')
    const elements: React.ReactNode[] = []
    let inTable = false
    let tableRows: string[][] = []
    let inCodeBlock = false
    let codeBlockLang = ''
    let codeBlockLines: string[] = []

    const flushTable = () => {
      if (tableRows.length > 0) {
        const headerRow = tableRows[0]
        const bodyRows = tableRows.slice(1)
        elements.push(
          <div key={`table-${elements.length}`} className="my-2.5 overflow-x-auto rounded-xl border border-sky-200 dark:border-sky-900/60 bg-white dark:bg-slate-900/80 shadow-xs">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-sky-200 dark:border-sky-800/80 bg-sky-50/80 dark:bg-sky-950/50 font-semibold text-sky-950 dark:text-sky-200">
                  {headerRow.map((cell, idx) => (
                    <th key={idx} className="px-3 py-2 whitespace-nowrap">
                      <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(cell.trim()) }} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-sky-50/40 dark:hover:bg-sky-950/30 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3 py-2 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(cell.trim()) }} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
        tableRows = []
        inTable = false
      }
    }

    const flushCodeBlock = () => {
      if (codeBlockLines.length > 0) {
        const codeText = codeBlockLines.join('\n')
        const currentIdx = elements.length
        elements.push(
          <div key={`code-${currentIdx}`} className="relative my-2.5 rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 shadow-sm font-mono text-xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-400">
              <span className="uppercase tracking-wider font-semibold text-sky-400">{codeBlockLang || 'SQL / CODE'}</span>
              <button
                onClick={() => handleCopy(codeText, currentIdx)}
                className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                title="Copy code"
              >
                {copiedIndex === currentIdx ? (
                  <>
                    <Check size={12} className="text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="overflow-x-auto leading-relaxed">
              <code>{codeText}</code>
            </pre>
          </div>
        )
        codeBlockLines = []
        inCodeBlock = false
        codeBlockLang = ''
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()

      // Handle Code Block backticks
      if (trimmed.startsWith('```')) {
        if (inCodeBlock) {
          flushCodeBlock()
        } else {
          if (inTable) flushTable()
          inCodeBlock = true
          codeBlockLang = trimmed.replace('```', '').trim()
        }
        continue
      }

      if (inCodeBlock) {
        codeBlockLines.push(line)
        continue
      }

      // Handle Table Lines
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        inTable = true
        // Ignore separator line like | :--- | :--- | or | --- |
        if (trimmed.match(/^\|[\s\-:]+\|/)) {
          continue
        }
        const cols = trimmed.slice(1, -1).split('|')
        tableRows.push(cols)
        continue
      } else if (inTable) {
        flushTable()
      }

      // Headers
      if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={i} className="mt-3 mb-1.5 text-sm md:text-base font-bold text-sky-950 dark:text-sky-200 flex items-center gap-1.5">
            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed.replace('### ', '')) }} />
          </h3>
        )
      } else if (trimmed.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="mt-3 mb-1.5 text-base md:text-lg font-bold text-foreground">
            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed.replace('## ', '')) }} />
          </h2>
        )
      } else if (trimmed.startsWith('#### ')) {
        elements.push(
          <h4 key={i} className="mt-2 mb-1 text-xs md:text-sm font-semibold text-foreground">
            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed.replace('#### ', '')) }} />
          </h4>
        )
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
        const text = trimmed.replace(/^[-•*]\s*/, '')
        elements.push(
          <li key={i} className="ml-4 list-disc text-xs md:text-sm leading-relaxed text-foreground/90 my-0.5">
            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(text) }} />
          </li>
        )
      } else if (trimmed === '') {
        elements.push(<div key={i} className="h-1.5" />)
      } else {
        elements.push(
          <p key={i} className="text-xs md:text-sm leading-relaxed text-foreground/90 my-1">
            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed) }} />
          </p>
        )
      }
    }

    if (inCodeBlock) flushCodeBlock()
    if (inTable) flushTable()

    return elements
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {renderElements()}
    </div>
  )
}
