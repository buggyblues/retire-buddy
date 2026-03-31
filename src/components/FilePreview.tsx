import { motion } from 'framer-motion'
import { X, FileText, Copy, Download, Check } from 'lucide-react'
import { useState } from 'react'
import type { GeneratedFile } from './AgentChat'

interface FilePreviewProps {
  file: GeneratedFile
  onClose: () => void
}

export default function FilePreview({ file, onClose }: FilePreviewProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(file.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([file.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    a.click()
    URL.revokeObjectURL(url)
  }

  // 简易 markdown 渲染
  const renderContent = (content: string) => {
    const lines = content.split('\n')
    const elements: React.ReactNode[] = []
    let inCodeBlock = false
    let codeLines: string[] = []
    let inTable = false
    let tableRows: string[][] = []

    const flushTable = () => {
      if (tableRows.length > 0) {
        elements.push(
          <div key={`table-${elements.length}`} className="overflow-x-auto my-3">
            <table className="w-full text-[11px] border-collapse">
              <thead>
                <tr>
                  {tableRows[0].map((cell, ci) => (
                    <th key={ci} className="border border-white/10 bg-white/5 px-2 py-1.5 text-left text-gray-300 font-medium">
                      {cell.trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.slice(2).map((row, ri) => (
                  <tr key={ri} className={ri % 2 === 0 ? '' : 'bg-white/[0.02]'}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="border border-white/10 px-2 py-1.5 text-gray-400">
                        {cell.trim()}
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

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${i}`} className="bg-black/30 border border-white/5 rounded-lg px-3 py-2 my-2 overflow-x-auto">
              <code className="text-[11px] text-green-300 font-mono leading-relaxed">
                {codeLines.join('\n')}
              </code>
            </pre>
          )
          codeLines = []
          inCodeBlock = false
        } else {
          flushTable()
          inCodeBlock = true
        }
        continue
      }

      if (inCodeBlock) {
        codeLines.push(line)
        continue
      }

      // Table rows
      if (line.includes('|') && line.trim().startsWith('|')) {
        if (!inTable) inTable = true
        const cells = line.split('|').filter(c => c.trim() !== '')
        // 跳过分隔行
        if (cells.every(c => /^[\s-:]+$/.test(c))) {
          tableRows.push(cells)
          continue
        }
        tableRows.push(cells)
        continue
      } else if (inTable) {
        flushTable()
      }

      // Headers
      if (line.startsWith('# ')) {
        flushTable()
        elements.push(
          <h1 key={i} className="text-lg font-bold text-white mt-4 mb-2 flex items-center gap-2">
            {line.slice(2)}
          </h1>
        )
      } else if (line.startsWith('## ')) {
        flushTable()
        elements.push(
          <h2 key={i} className="text-base font-bold text-gray-200 mt-4 mb-1.5 border-b border-white/5 pb-1">
            {line.slice(3)}
          </h2>
        )
      } else if (line.startsWith('### ')) {
        flushTable()
        elements.push(
          <h3 key={i} className="text-sm font-bold text-gray-300 mt-3 mb-1">
            {line.slice(4)}
          </h3>
        )
      }
      // Blockquotes
      else if (line.startsWith('>')) {
        flushTable()
        elements.push(
          <blockquote key={i} className="border-l-2 border-amber-500/50 pl-3 my-2 text-[12px] text-amber-200/80 italic">
            {line.slice(1).trim()}
          </blockquote>
        )
      }
      // List items
      else if (line.match(/^[-*] /)) {
        elements.push(
          <div key={i} className="flex items-start gap-2 text-[12px] text-gray-300 py-0.5 pl-2">
            <span className="text-primary-light mt-0.5">•</span>
            <span>{renderInline(line.slice(2))}</span>
          </div>
        )
      }
      // Checkbox items
      else if (line.match(/^- \[[ x]\]/)) {
        const checked = line.includes('[x]')
        elements.push(
          <div key={i} className="flex items-start gap-2 text-[12px] text-gray-300 py-0.5 pl-2">
            <span className={checked ? 'text-green-400' : 'text-gray-600'}>{checked ? '☑' : '☐'}</span>
            <span className={checked ? 'line-through text-gray-500' : ''}>{renderInline(line.replace(/^- \[[ x]\]\s*/, ''))}</span>
          </div>
        )
      }
      // Numbered list
      else if (line.match(/^\d+\.\s/)) {
        const num = line.match(/^(\d+)/)
        elements.push(
          <div key={i} className="flex items-start gap-2 text-[12px] text-gray-300 py-0.5 pl-2">
            <span className="text-primary-light font-mono w-4 text-right flex-shrink-0">{num?.[1]}.</span>
            <span>{renderInline(line.replace(/^\d+\.\s*/, ''))}</span>
          </div>
        )
      }
      // Empty line
      else if (line.trim() === '') {
        elements.push(<div key={i} className="h-2" />)
      }
      // Normal text
      else {
        elements.push(
          <p key={i} className="text-[12px] text-gray-300 leading-relaxed">
            {renderInline(line)}
          </p>
        )
      }
    }

    flushTable()

    return elements
  }

  // 内联格式
  const renderInline = (text: string): React.ReactNode => {
    // Bold
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
      }
      // Inline code
      const codeParts = part.split(/(`[^`]+`)/g)
      return codeParts.map((cp, j) => {
        if (cp.startsWith('`') && cp.endsWith('`')) {
          return <code key={`${i}-${j}`} className="bg-white/10 text-amber-300 px-1 py-0.5 rounded text-[11px] font-mono">{cp.slice(1, -1)}</code>
        }
        return <span key={`${i}-${j}`}>{cp}</span>
      })
    })
  }

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 420, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="h-full flex flex-col bg-[#141428] border-l border-white/10 overflow-hidden"
    >
      {/* 顶部工具栏 */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-[#1a1a30]">
        <div className="flex items-center gap-2 min-w-0">
          <FileText size={14} className="text-primary-light flex-shrink-0" />
          <span className="text-xs font-medium text-white truncate">{file.icon} {file.name}</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handleCopy}
            className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded transition-colors"
            title="复制内容"
          >
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded transition-colors"
            title="下载文件"
          >
            <Download size={14} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* 文件内容 */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {renderContent(file.content)}
      </div>

      {/* 底部状态栏 */}
      <div className="flex-shrink-0 px-4 py-2 border-t border-white/10 flex items-center justify-between">
        <span className="text-[10px] text-gray-600">
          {file.content.split('\n').length} 行 · {file.content.length} 字符
        </span>
        <span className="text-[10px] text-red-400/60">
          ⚠️ 此文件内容可能引起不适
        </span>
      </div>
    </motion.div>
  )
}
