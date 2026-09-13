'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useFilesystemStore } from '@/core/filesystem/filesystemStore'
import { useProductivityStore } from '@/core/productivity/productivityEngine'

interface TerminalProps {
  windowId: string
}

type LineType = 'input' | 'output' | 'error' | 'info' | 'success'

interface TermLine {
  id: string
  type: LineType
  text: string
}

const NEOFETCH = `
  ███████╗██╗      ██████╗ ████████╗██╗  ██╗     ██████╗ ███████╗
  ██╔════╝██║     ██╔═══██╗╚══██╔══╝██║  ██║    ██╔═══██╗██╔════╝
  ███████╗██║     ██║   ██║   ██║   ███████║    ██║   ██║███████╗
  ╚════██║██║     ██║   ██║   ██║   ██╔══██║    ██║   ██║╚════██║
  ███████║███████╗╚██████╔╝   ██║   ██║  ██║    ╚██████╔╝███████║
  ╚══════╝╚══════╝ ╚═════╝    ╚═╝   ╚═╝  ╚═╝     ╚═════╝ ╚══════╝

  OS:         Sloth OS v0.1.0 (Canopy Edition)
  Kernel:     Definitely Linux (Slowly)
  Shell:      SlothShell 1.0.0
  CPU:        Doing nothing (8 cores @ 0.0GHz)
  RAM:        4GB / 4GB (mostly napping)
  Disk:       Infinite (virtual)
  Uptime:     Too long
  Motivation: 2%
  Uselessness: 98%
  Status:     Hanging around
`

const FORTUNES = [
  "A journey of a thousand miles begins with a single procrastination.",
  "The early bird gets the worm, but the late bird sleeps in.",
  "Work smarter, not harder. Or just don't work.",
  "Time you enjoy wasting is not wasted time.",
  "The best time to start was yesterday. The second best time is never.",
  "Do not put off until tomorrow what you can avoid entirely.",
  "I have not failed. I've just found 10,000 ways to not work.",
  "Success is just failure that hasn't happened yet. Keep procrastinating.",
  "The secret of getting ahead is getting started. So don't.",
]

export default function Terminal({ windowId }: TerminalProps) {
  const [lines, setLines] = useState<TermLine[]>([
    { id: '0', type: 'info', text: 'Sloth OS  SlothShell v1.0.0' },
    { id: '1', type: 'info', text: 'Type `help` for available commands.' },
    { id: '2', type: 'output', text: '' },
  ])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const [cwd, setCwd] = useState('~')
  const [cwdId, setCwdId] = useState('dir-Notes') // start in Notes
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const { getChildren, getNode, mkdir, touch, write, read, deleteNode, findByPath, rootId } = useFilesystemStore()
  const { recordCommand } = useProductivityStore()

  const addLine = useCallback((type: LineType, text: string) => {
    setLines(prev => [...prev, { id: `${Date.now()}-${Math.random()}`, type, text }])
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const processCommand = useCallback((raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed) return

    addLine('input', `sloth@nothing:${cwd}$ ${trimmed}`)
    recordCommand()

    const parts = trimmed.split(/\s+/)
    const cmd = parts[0].toLowerCase()
    const args = parts.slice(1)

    switch (cmd) {
      case 'help':
        addLine('output', 'Available commands:')
        addLine('output', '  help        — Show this help')
        addLine('output', '  clear       — Clear terminal')
        addLine('output', '  echo [text] — Print text')
        addLine('output', '  pwd         — Print working directory')
        addLine('output', '  ls          — List directory contents')
        addLine('output', '  cd [dir]    — Change directory')
        addLine('output', '  cat [file]  — Print file contents')
        addLine('output', '  mkdir [dir] — Create directory')
        addLine('output', '  touch [file]— Create empty file')
        addLine('output', '  rm [file]   — Remove file/directory')
        addLine('output', '  neofetch    — System information')
        addLine('output', '  fortune     — Random wisdom')
        addLine('output', '  about       — About Sloth OS')
        addLine('output', '  productivity— Check your productivity score')
        addLine('output', '  whoami      — Who are you?')
        addLine('output', '  date        — Current date and time')
        addLine('output', '  uptime      — System uptime')
        addLine('output', '  ps          — List processes')
        break

      case 'clear':
        setLines([])
        break

      case 'echo':
        addLine('output', args.join(' ') || '')
        break

      case 'pwd':
        addLine('output', cwd === '~' ? '/home/sloth' : `/home/sloth/${cwd}`)
        break

      case 'ls': {
        const children = getChildren(cwdId)
        if (children.length === 0) {
          addLine('output', '(empty)')
        } else {
          children.forEach(child => {
            addLine('output', child.type === 'directory' ? `📁 ${child.name}/` : `📄 ${child.name}`)
          })
        }
        break
      }

      case 'cd': {
        if (!args[0] || args[0] === '~') {
          setCwd('~')
          setCwdId('root')
          break
        }
        if (args[0] === '..') {
          const current = getNode(cwdId)
          if (current?.parentId) {
            const parent = getNode(current.parentId)
            if (parent) {
              setCwdId(current.parentId)
              setCwd(parent.id === 'root' ? '~' : parent.name)
            }
          }
          break
        }
        const children = getChildren(cwdId)
        const target = children.find(c => c.name === args[0] && c.type === 'directory')
        if (target) {
          setCwdId(target.id)
          setCwd(args[0])
        } else {
          addLine('error', `cd: ${args[0]}: No such directory`)
        }
        break
      }

      case 'cat': {
        if (!args[0]) { addLine('error', 'cat: missing filename'); break }
        const children = getChildren(cwdId)
        const file = children.find(c => c.name === args[0] && c.type === 'file')
        if (file) {
          const content = read(file.id) ?? ''
          content.split('\n').forEach(line => addLine('output', line))
        } else {
          addLine('error', `cat: ${args[0]}: No such file`)
        }
        break
      }

      case 'mkdir': {
        if (!args[0]) { addLine('error', 'mkdir: missing directory name'); break }
        mkdir(cwdId, args[0])
        addLine('success', `Directory created: ${args[0]}`)
        break
      }

      case 'touch': {
        if (!args[0]) { addLine('error', 'touch: missing filename'); break }
        touch(cwdId, args[0])
        addLine('success', `File created: ${args[0]}`)
        break
      }

      case 'rm': {
        if (!args[0]) { addLine('error', 'rm: missing filename'); break }
        const children = getChildren(cwdId)
        const target = children.find(c => c.name === args[0])
        if (target) {
          deleteNode(target.id)
          addLine('success', `Removed: ${args[0]}`)
        } else {
          addLine('error', `rm: ${args[0]}: No such file or directory`)
        }
        break
      }

      case 'neofetch':
        NEOFETCH.split('\n').forEach(l => addLine('info', l))
        break

      case 'fortune': {
        const f = FORTUNES[Math.floor(Math.random() * FORTUNES.length)]
        addLine('output', '')
        addLine('info', `  "${f}"`)
        addLine('output', '')
        break
      }

      case 'about':
        addLine('output', '')
        addLine('info', '  Sloth OS — An Operating System for Doing Absolutely Nothing')
        addLine('info', '  Version: 0.1.0 (Canopy Edition)')
        addLine('info', '  Purpose: Protect users from productivity.')
        addLine('info', '  Status: Working slowly and perfectly.')
        addLine('output', '')
        break

      case 'productivity': {
        const { uselessnessScore, productivityScore, analytics } = useProductivityStore.getState()
        addLine('output', '')
        addLine('output', `  Productivity Score:   ${Math.round(productivityScore)}%  ← BAD`)
        addLine('info',   `  Uselessness Score:    ${Math.round(uselessnessScore)}%  ← GOOD`)
        addLine('output', `  Games Played:         ${analytics.gamesPlayed}`)
        addLine('output', `  Excuses Generated:    ${analytics.excusesGenerated}`)
        addLine('output', `  Blocked Attempts:     ${analytics.productivityBlocked}`)
        addLine('output', '')
        break
      }

      case 'whoami':
        addLine('output', 'sloth')
        break

      case 'date':
        addLine('output', new Date().toString())
        break

      case 'uptime':
        addLine('output', `  up infinite hours, 1 user, load average: 0.00, 0.00, 0.00`)
        addLine('output', `  (motivation load: 0.02)`)
        break

      case 'ps':
        addLine('output', 'PID   PROCESS             CPU    MEM')
        addLine('output', '101   desktop             0.1%   2%')
        addLine('output', '102   sloth-engine        0.0%   1%')
        addLine('output', '103   procrastination     0.0%   38%')
        addLine('output', '104   thinking-about-work 0.0%   61%')
        addLine('output', '105   slothshell          0.1%   0%')
        break

      case 'sudo':
        addLine('error', 'sudo: Permission denied. This system does not support ambition.')
        break

      case 'exit':
        addLine('info', 'There is no exit. There is only Sloth OS.')
        break

      default:
        addLine('error', `${cmd}: command not found. Try 'help'.`)
    }
  }, [cwd, cwdId, addLine, recordCommand, getChildren, getNode, mkdir, touch, read, deleteNode])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (input.trim()) {
        setHistory(h => [input, ...h])
        setHistoryIdx(-1)
      }
      processCommand(input)
      setInput('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const newIdx = Math.min(historyIdx + 1, history.length - 1)
      setHistoryIdx(newIdx)
      setInput(history[newIdx] ?? '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const newIdx = Math.max(historyIdx - 1, -1)
      setHistoryIdx(newIdx)
      setInput(newIdx === -1 ? '' : (history[newIdx] ?? ''))
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      setLines([])
    }
  }

  const lineColor: Record<LineType, string> = {
    input: '#A371F7',
    output: 'var(--color-os-text)',
    error: '#F85149',
    info: '#58A6FF',
    success: '#3FB950',
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{
        background: '#0D0F12',
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
      }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Output area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-0.5">
        {lines.map(line => (
          <div key={line.id} style={{ color: lineColor[line.type], lineHeight: 1.6, whiteSpace: 'pre' }}>
            {line.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div
        className="flex items-center px-4 py-3 shrink-0"
        style={{ borderTop: '1px solid var(--color-os-border)' }}
      >
        <span style={{ color: '#A371F7', marginRight: 8 }}>sloth@nothing:{cwd}$</span>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none"
          style={{ color: 'var(--color-os-text)', caretColor: '#A371F7' }}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          aria-label="Terminal input"
        />
        <span className="cursor-blink" style={{ color: '#A371F7', marginLeft: 1 }}>▌</span>
      </div>
    </div>
  )
}
