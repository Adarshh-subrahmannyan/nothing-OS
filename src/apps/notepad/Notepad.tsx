'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Save, FileText, Search, X, Download } from 'lucide-react'
import { useFilesystemStore } from '@/core/filesystem/filesystemStore'
import { useProductivityStore } from '@/core/productivity/productivityEngine'
import { useTodoStore } from '@/core/todo/todoStore'
import { eventBus } from '@/core/events/eventBus'

const DISTRACTIONS = [
  "Research why flamingos stand on one leg (science demands it)",
  "Organize your Downloads folder (it's been 3 years)",
  "Learn why bananas are radioactive",
  "Count all the tabs in your browser",
  "Start a new project you'll also never finish",
  "Read random Wikipedia articles for exactly 47 minutes",
  "Rearrange your bookmarks for maximum inefficiency",
  "Research the lifecycle of the common house spider",
  "Write a list of things you'll do tomorrow instead",
  "Audit all your streaming service subscriptions",
]

const PRODUCTIVE_PATTERNS = [
  /study plan/i, /assignment/i, /homework/i, /todo list/i, /meeting notes/i,
  /project plan/i, /work schedule/i, /exam prep/i, /deadline/i, /lecture/i,
]

export default function Notepad({ windowId }: { windowId: string }) {
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('Untitled.txt')
  const [saved, setSaved] = useState(true)
  const [searching, setSearching] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [fileId, setFileId] = useState<string | null>(null)
  const [distractionModal, setDistractionModal] = useState<{task: string, distraction: string} | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const checkTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { touch, write, getNode } = useFilesystemStore()
  const { detectText } = useProductivityStore()
  const { tasks } = useTodoStore()
  const activeTasks = tasks.filter(t => !t.completed)

  const wordCount = content.split(/\s+/).filter(Boolean).length
  const charCount = content.length

  const handleSave = useCallback(() => {
    const notesDir = 'dir-Notes'
    if (fileId) {
      write(fileId, content)
    } else {
      const id = touch(notesDir, title, content)
      setFileId(id)
    }
    setSaved(true)
    eventBus.emit('NOTE_SAVED', { title, wordCount })
    eventBus.emit('FILE_CREATED', { name: title })
  }, [content, title, fileId, touch, write, wordCount])

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleSave])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setContent(val)
    setSaved(false)

    // Autosave after 2s of inactivity
    if (checkTimer.current) clearTimeout(checkTimer.current)
    checkTimer.current = setTimeout(() => {
      handleSave()
      // Check for productivity
      const isProductive = PRODUCTIVE_PATTERNS.some(p => p.test(val))
      if (isProductive && val.length > 20) {
        detectText(val, 'notepad')
      }
    }, 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = title
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleAvoid = (taskTitle: string) => {
    const randomDistraction = DISTRACTIONS[Math.floor(Math.random() * DISTRACTIONS.length)]
    setDistractionModal({ task: taskTitle, distraction: randomDistraction })
  }

  const highlighted = searching && searchTerm
    ? content.replace(new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'), '**$1**')
    : content

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--color-os-surface)' }}>
      {/* Toolbar */}
      <div
        className="flex items-center gap-2 px-3 py-2 shrink-0"
        style={{ borderBottom: '1px solid var(--color-os-border)', background: 'var(--color-os-elevated)' }}
      >
        {/* Title */}
        <input
          value={title}
          onChange={e => { setTitle(e.target.value); setSaved(false) }}
          className="bg-transparent outline-none text-sm font-medium"
          style={{ color: 'var(--color-os-text)', width: 180 }}
          aria-label="File name"
        />

        <div style={{ flex: 1 }} />

        <button
          onClick={() => setSearching(s => !s)}
          className="p-1.5 rounded hover:bg-white/5 transition-colors"
          title="Search"
        >
          <Search size={14} style={{ color: searching ? '#A371F7' : 'var(--color-os-text-muted)' }} />
        </button>
        <button
          onClick={handleSave}
          className="p-1.5 rounded hover:bg-white/5 transition-colors"
          title="Save (Ctrl+S)"
        >
          <Save size={14} style={{ color: saved ? 'var(--color-os-text-muted)' : '#3FB950' }} />
        </button>
        <button
          onClick={handleDownload}
          className="p-1.5 rounded hover:bg-white/5 transition-colors"
          title="Download as .txt"
        >
          <Download size={14} style={{ color: 'var(--color-os-text-muted)' }} />
        </button>
      </div>

      {/* Search bar */}
      {searching && (
        <div
          className="flex items-center gap-2 px-3 py-1.5 shrink-0"
          style={{ borderBottom: '1px solid var(--color-os-border)', background: 'var(--color-os-elevated)' }}
        >
          <Search size={12} style={{ color: 'var(--color-os-text-muted)' }} />
          <input
            autoFocus
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--color-os-text)', fontSize: 12 }}
            aria-label="Search in document"
          />
          <button onClick={() => { setSearching(false); setSearchTerm('') }}>
            <X size={12} style={{ color: 'var(--color-os-text-muted)' }} />
          </button>
        </div>
      )}

      {/* Editor & Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          placeholder="Start typing... (or don't, that's valid too)"
          className="flex-1 resize-none p-4 outline-none bg-transparent h-full"
          style={{
            color: 'var(--color-os-text)',
            fontSize: 14,
            lineHeight: 1.7,
            fontFamily: 'var(--font-sans)',
          }}
          aria-label="Document content"
          spellCheck={true}
        />

        {activeTasks.length > 0 && (
          <div
            className="w-64 flex flex-col shrink-0 p-4 gap-3 overflow-y-auto h-full"
            style={{ borderLeft: '1px solid var(--color-os-border)', background: 'var(--color-os-elevated)' }}
          >
            <div style={{ color: '#F85149', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 }}>
              ACTIVE TASKS DETECTED
            </div>
            <div style={{ color: 'var(--color-os-text-muted)', fontSize: 11 }}>
              You are trying to write notes while you have things to do.
            </div>
            {activeTasks.map(task => (
              <div
                key={task.id}
                className="p-3 rounded-xl flex flex-col gap-2"
                style={{ background: 'var(--color-os-surface)', border: '1px solid var(--color-os-border)' }}
              >
                <div style={{ color: 'var(--color-os-text)', fontSize: 13, fontWeight: 500 }}>
                  {task.title}
                </div>
                <button
                  onClick={() => handleAvoid(task.title)}
                  className="w-full text-center py-1.5 rounded-lg text-xs font-bold transition-opacity hover:opacity-80 mt-1"
                  style={{ background: '#D29922', color: '#000' }}
                >
                  How to avoid this
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status bar */}
      <div
        className="flex items-center gap-4 px-4 py-1.5 shrink-0"
        style={{
          borderTop: '1px solid var(--color-os-border)',
          background: 'var(--color-os-elevated)',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--color-os-text-muted)',
        }}
      >
        <span>Words: {wordCount}</span>
        <span>Characters: {charCount}</span>
        <div style={{ flex: 1 }} />
        <span style={{ color: saved ? '#3FB950' : '#D29922' }}>
          {saved ? '● Saved' : '● Unsaved'}
        </span>
      </div>

      {/* Distraction Modal Overlay */}
      {distractionModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="p-6 rounded-2xl flex flex-col gap-4 max-w-sm w-full shadow-2xl"
            style={{ background: 'var(--color-os-elevated)', border: '1px solid rgba(210, 153, 34, 0.3)' }}
          >
            <div>
              <div style={{ color: 'var(--color-os-text-muted)', fontSize: 11, letterSpacing: 1, fontFamily: 'var(--font-mono)' }}>
                INSTEAD OF DOING:
              </div>
              <div style={{ color: 'var(--color-os-text)', fontSize: 14, fontWeight: 500, marginTop: 4 }}>
                {distractionModal.task}
              </div>
            </div>
            <div>
              <div style={{ color: '#D29922', fontSize: 11, letterSpacing: 1, fontFamily: 'var(--font-mono)' }}>
                WE HIGHLY RECOMMEND:
              </div>
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 600, marginTop: 4 }}>
                {distractionModal.distraction}
              </div>
            </div>
            <button
              onClick={() => setDistractionModal(null)}
              className="mt-2 py-2 rounded-lg font-medium text-sm transition-opacity hover:opacity-80"
              style={{ background: '#D29922', color: '#000' }}
            >
              I will do that instead
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
