'use client'

import { useState, useRef } from 'react'
import { Folder, FolderOpen, FileText, Plus, Trash2, PenLine, ChevronRight, Home, Upload, Image as ImageIcon } from 'lucide-react'
import { useFilesystemStore } from '@/core/filesystem/filesystemStore'
import { useSettingsStore } from '@/core/settings/settingsStore'
import type { FileNode } from '@/types'

export default function FileManager({ windowId }: { windowId: string }) {
  const { nodes, getChildren, mkdir, touch, deleteNode, rename, read } = useFilesystemStore()
  const { updateSettings } = useSettingsStore()
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [cwdId, setCwdId] = useState('root')
  const [selected, setSelected] = useState<string | null>(null)
  const [viewFile, setViewFile] = useState<{ id: string; name: string; content: string } | null>(null)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [renameVal, setRenameVal] = useState('')

  const cwd = nodes[cwdId]
  const children = getChildren(cwdId)

  const breadcrumb: { id: string; name: string }[] = []
  let cur = nodes[cwdId]
  while (cur) {
    breadcrumb.unshift({ id: cur.id, name: cur.id === 'root' ? 'Home' : cur.name })
    if (!cur.parentId) break
    cur = nodes[cur.parentId!]
  }

  const rootChildren = getChildren('root').filter(n => n.type === 'directory')

  const handleOpen = (node: FileNode) => {
    if (node.type === 'directory') {
      setCwdId(node.id)
      setSelected(null)
      setViewFile(null)
    } else {
      const content = read(node.id) ?? '(empty file)'
      setViewFile({ id: node.id, name: node.name, content })
    }
  }

  const handleDelete = (id: string) => {
    deleteNode(id)
    if (selected === id) setSelected(null)
  }

  const handleRename = (id: string, current: string) => {
    setRenaming(id)
    setRenameVal(current)
  }

  const commitRename = () => {
    if (renaming && renameVal.trim()) {
      rename(renaming, renameVal.trim())
    }
    setRenaming(null)
  }

  const handleNewFolder = () => {
    mkdir(cwdId, `New Folder ${Date.now() % 1000}`)
  }

  const handleNewFile = () => {
    touch(cwdId, `new-file-${Date.now() % 1000}.txt`)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      touch(cwdId, file.name, dataUrl)
    }
    reader.readAsDataURL(file)
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="flex h-full" style={{ background: 'var(--color-os-surface)' }}>
      {/* Sidebar */}
      <div
        className="flex flex-col shrink-0"
        style={{
          width: 160,
          borderRight: '1px solid var(--color-os-border)',
          background: 'var(--color-os-elevated)',
          padding: '12px 8px',
        }}
      >
        <div style={{ color: 'var(--color-os-text-muted)', fontSize: 10, fontWeight: 600, letterSpacing: 1, paddingLeft: 8, marginBottom: 8 }}>
          LOCATIONS
        </div>
        <button
          className="flex items-center gap-2 px-2 py-1.5 rounded text-sm w-full text-left hover:bg-white/5"
          style={{ color: cwdId === 'root' ? '#A371F7' : 'var(--color-os-text-secondary)' }}
          onClick={() => setCwdId('root')}
        >
          <Home size={14} />
          Home
        </button>
        {rootChildren.map(dir => (
          <button
            key={dir.id}
            className="flex items-center gap-2 px-2 py-1.5 rounded text-sm w-full text-left hover:bg-white/5"
            style={{ color: cwdId === dir.id ? '#A371F7' : 'var(--color-os-text-secondary)' }}
            onClick={() => setCwdId(dir.id)}
          >
            <Folder size={14} />
            {dir.name}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Toolbar */}
        <div
          className="flex items-center gap-2 px-3 py-2 shrink-0"
          style={{ borderBottom: '1px solid var(--color-os-border)', background: 'var(--color-os-elevated)' }}
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 flex-1 min-w-0 overflow-hidden">
            {breadcrumb.map((seg, i) => (
              <span key={seg.id} className="flex items-center gap-1">
                {i > 0 && <ChevronRight size={12} style={{ color: 'var(--color-os-text-muted)' }} />}
                <button
                  onClick={() => setCwdId(seg.id)}
                  className="text-sm hover:underline truncate max-w-32"
                  style={{ color: i === breadcrumb.length - 1 ? 'var(--color-os-text)' : 'var(--color-os-text-secondary)' }}
                >
                  {seg.name}
                </button>
              </span>
            ))}
          </div>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
          <button onClick={handleUploadClick} className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-white/5" style={{ color: 'var(--color-os-text-secondary)' }}>
            <Upload size={12} /> Upload
          </button>
          <button onClick={handleNewFolder} className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-white/5" style={{ color: 'var(--color-os-text-secondary)' }}>
            <Plus size={12} /> Folder
          </button>
          <button onClick={handleNewFile} className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-white/5" style={{ color: 'var(--color-os-text-secondary)' }}>
            <Plus size={12} /> File
          </button>
        </div>

        {viewFile ? (
          <div className="flex-1 flex flex-col p-4 min-h-0">
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => setViewFile(null)} className="text-xs px-2 py-1 rounded hover:bg-white/5" style={{ color: '#A371F7' }}>← Back</button>
              <span style={{ color: 'var(--color-os-text)', fontSize: 13, fontWeight: 500 }}>{viewFile.name}</span>
              {viewFile.content?.startsWith('data:image/') && (
                <button
                  onClick={() => updateSettings({ wallpaper: viewFile.id })}
                  className="ml-auto text-xs px-3 py-1 rounded"
                  style={{ background: '#A371F7', color: 'white' }}
                >
                  Set as Wallpaper
                </button>
              )}
            </div>
            {viewFile.content?.startsWith('data:image/') ? (
              <div className="flex-1 overflow-auto rounded-lg bg-black flex items-center justify-center p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={viewFile.content} alt={viewFile.name} className="max-w-full max-h-full object-contain" />
              </div>
            ) : (
              <pre
                className="flex-1 overflow-auto p-4 rounded-lg"
                style={{
                  background: 'var(--color-os-elevated)',
                  border: '1px solid var(--color-os-border)',
                  color: 'var(--color-os-text)',
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {viewFile.content || '(empty)'}
              </pre>
            )}
          </div>
        ) : (
          <div className="flex-1 p-3 overflow-y-auto">
            {children.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full" style={{ color: 'var(--color-os-text-muted)', fontSize: 13 }}>
                <FolderOpen size={40} strokeWidth={1} style={{ marginBottom: 12, opacity: 0.4 }} />
                <div>No files here.</div>
                <div style={{ fontSize: 11, marginTop: 4 }}>Good.</div>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {children.map(node => (
                  <div
                    key={node.id}
                    className="relative flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer group"
                    style={{
                      background: selected === node.id ? 'rgba(163,113,247,0.1)' : 'transparent',
                      border: selected === node.id ? '1px solid rgba(163,113,247,0.3)' : '1px solid transparent',
                    }}
                    onClick={() => setSelected(node.id)}
                    onDoubleClick={() => handleOpen(node)}
                  >
                    {node.type === 'directory'
                      ? <Folder size={32} strokeWidth={1.5} style={{ color: '#D29922' }} />
                      : (node.content?.startsWith('data:image/') 
                          ? <ImageIcon size={32} strokeWidth={1.5} style={{ color: '#A371F7' }} /> 
                          : <FileText size={32} strokeWidth={1.5} style={{ color: '#58A6FF' }} />
                        )
                    }

                    {renaming === node.id ? (
                      <input
                        autoFocus
                        value={renameVal}
                        onChange={e => setRenameVal(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenaming(null) }}
                        className="w-full text-center bg-transparent border-b outline-none"
                        style={{ color: 'var(--color-os-text)', fontSize: 11, borderColor: '#A371F7' }}
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <span className="text-center truncate w-full" style={{ color: 'var(--color-os-text)', fontSize: 11 }}>
                        {node.name}
                      </span>
                    )}

                    {/* Action icons on hover */}
                    {selected === node.id && (
                      <div className="absolute top-1 right-1 flex gap-1">
                        <button onClick={e => { e.stopPropagation(); handleRename(node.id, node.name) }} className="p-0.5 rounded hover:bg-white/10">
                          <PenLine size={10} style={{ color: 'var(--color-os-text-muted)' }} />
                        </button>
                        <button onClick={e => { e.stopPropagation(); handleDelete(node.id) }} className="p-0.5 rounded hover:bg-white/10">
                          <Trash2 size={10} style={{ color: '#F85149' }} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
