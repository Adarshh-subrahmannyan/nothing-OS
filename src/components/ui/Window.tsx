'use client'

import { useRef, useCallback, useEffect, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Maximize2, Minimize2 } from 'lucide-react'
import { useWindowStore } from '@/core/windows/windowStore'
import type { WindowState } from '@/types'

interface WindowProps {
  window: WindowState
  children: ReactNode
}

export default function Window({ window: win, children }: WindowProps) {
  const { focusWindow, closeWindow, minimizeWindow, maximizeWindow, restoreWindow, moveWindow, resizeWindow } = useWindowStore()

  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null)
  const resizeRef = useRef<{ startX: number; startY: number; origW: number; origH: number; origX: number; origY: number; dir: string } | null>(null)
  const windowRef = useRef<HTMLDivElement>(null)

  // ─── Drag ──────────────────────────────────────────────────────────────────

  const onDragStart = useCallback((e: React.MouseEvent) => {
    if (win.maximized) return
    e.preventDefault()
    focusWindow(win.id)
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: win.x,
      origY: win.y,
    }

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return
      const dx = ev.clientX - dragRef.current.startX
      const dy = ev.clientY - dragRef.current.startY
      const newX = Math.max(0, dragRef.current.origX + dx)
      const newY = Math.max(32, dragRef.current.origY + dy) // keep below topbar
      moveWindow(win.id, newX, newY)
    }

    const onUp = () => {
      dragRef.current = null
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [win, focusWindow, moveWindow])

  // ─── Resize ────────────────────────────────────────────────────────────────

  const onResizeStart = useCallback((e: React.MouseEvent, dir: string) => {
    e.preventDefault()
    e.stopPropagation()
    focusWindow(win.id)
    resizeRef.current = {
      startX: e.clientX, startY: e.clientY,
      origW: win.width, origH: win.height,
      origX: win.x, origY: win.y,
      dir,
    }

    const onMove = (ev: MouseEvent) => {
      if (!resizeRef.current) return
      const { startX, startY, origW, origH, dir: d } = resizeRef.current
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY

      let newW = origW, newH = origH
      if (d.includes('e')) newW = Math.max(320, origW + dx)
      if (d.includes('s')) newH = Math.max(240, origH + dy)
      if (d.includes('w')) {
        newW = Math.max(320, origW - dx)
        moveWindow(win.id, resizeRef.current.origX + (origW - newW), win.y)
      }
      if (d.includes('n')) {
        newH = Math.max(240, origH - dy)
        moveWindow(win.id, win.x, resizeRef.current.origY + (origH - newH))
      }
      resizeWindow(win.id, newW, newH)
    }

    const onUp = () => {
      resizeRef.current = null
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [win, focusWindow, resizeWindow, moveWindow])

  const handleDoubleClickTitle = useCallback(() => {
    if (win.maximized) restoreWindow(win.id)
    else maximizeWindow(win.id)
  }, [win, maximizeWindow, restoreWindow])

  if (win.minimized) return null

  const style: React.CSSProperties = win.maximized
    ? { position: 'fixed', left: 0, top: 32, right: 0, bottom: 40, width: '100%', height: 'calc(100% - 72px)', zIndex: win.zIndex, borderRadius: 0 }
    : { position: 'fixed', left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.zIndex }

  return (
    <AnimatePresence>
      <motion.div
        ref={windowRef}
        key={win.id}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        style={style}
        className="flex flex-col overflow-hidden select-none"
        onMouseDown={() => focusWindow(win.id)}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Window chrome */}
        <div
          className={`flex flex-col h-full ${win.maximized ? '' : 'glass-panel-elevated'}`}
          style={{
            border: win.maximized ? 'none' : `1px solid ${win.focused ? 'rgba(163,113,247,0.4)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: win.maximized ? 0 : 'var(--radius-window)',
            boxShadow: win.focused
              ? 'inset 0 1px 0 rgba(255,255,255,0.2), 0 24px 64px rgba(0,0,0,0.8), 0 0 0 1px rgba(163,113,247,0.3)'
              : 'inset 0 1px 0 rgba(255,255,255,0.1), 0 12px 32px rgba(0,0,0,0.5)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            background: win.maximized ? 'var(--color-os-bg)' : undefined, // If maximized, just use solid bg
          }}
        >
          {/* Title bar */}
          <div
            className="flex items-center gap-2 px-3 shrink-0"
            style={{
              height: 42,
              background: win.focused ? 'rgba(255,255,255,0.03)' : 'transparent',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              borderRadius: win.maximized ? 0 : 'var(--radius-window) var(--radius-window) 0 0',
              cursor: 'default',
            }}
            onMouseDown={onDragStart}
            onDoubleClick={handleDoubleClickTitle}
          >
            {/* Traffic lights */}
            <div className="flex items-center gap-1.5" onMouseDown={e => e.stopPropagation()}>
              <button
                onClick={() => closeWindow(win.id)}
                className="w-3 h-3 rounded-full flex items-center justify-center group transition-opacity shadow-sm"
                style={{ background: '#F85149', boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2)' }}
                title="Close"
              >
                <X size={7} className="opacity-0 group-hover:opacity-100 text-red-900" strokeWidth={3} />
              </button>
              <button
                onClick={() => minimizeWindow(win.id)}
                className="w-3 h-3 rounded-full flex items-center justify-center group transition-opacity shadow-sm"
                style={{ background: '#D29922', boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2)' }}
                title="Minimize"
              >
                <Minus size={7} className="opacity-0 group-hover:opacity-100 text-amber-900" strokeWidth={3} />
              </button>
              <button
                onClick={() => win.maximized ? restoreWindow(win.id) : maximizeWindow(win.id)}
                className="w-3 h-3 rounded-full flex items-center justify-center group transition-opacity shadow-sm"
                style={{ background: '#3FB950', boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2)' }}
                title={win.maximized ? 'Restore' : 'Maximize'}
              >
                {win.maximized
                  ? <Minimize2 size={7} className="opacity-0 group-hover:opacity-100 text-green-900" strokeWidth={3} />
                  : <Maximize2 size={7} className="opacity-0 group-hover:opacity-100 text-green-900" strokeWidth={3} />
                }
              </button>
            </div>

            {/* Title */}
            <div
              className="flex-1 text-center text-sm font-semibold tracking-wide truncate"
              style={{ color: win.focused ? 'var(--color-os-text)' : 'var(--color-os-text-muted)', fontSize: 13 }}
            >
              {win.title}
            </div>

            {/* Spacer to balance traffic lights */}
            <div className="w-16" />
          </div>

          {/* Content */}
          <div
            className="flex-1 overflow-hidden relative"
            style={{ 
              background: win.maximized ? 'transparent' : 'rgba(10, 10, 16, 0.4)',
              borderRadius: win.maximized ? 0 : '0 0 var(--radius-window) var(--radius-window)',
            }}
            onMouseDown={e => e.stopPropagation()}
          >
            {children}
          </div>
        </div>

        {/* Resize handles (only when not maximized) */}
        {!win.maximized && (
          <>
            {/* Edges */}
            <div className="absolute top-0 left-2 right-2 h-1 cursor-n-resize" onMouseDown={e => onResizeStart(e, 'n')} />
            <div className="absolute bottom-0 left-2 right-2 h-1 cursor-s-resize" onMouseDown={e => onResizeStart(e, 's')} />
            <div className="absolute left-0 top-2 bottom-2 w-1 cursor-w-resize" onMouseDown={e => onResizeStart(e, 'w')} />
            <div className="absolute right-0 top-2 bottom-2 w-1 cursor-e-resize" onMouseDown={e => onResizeStart(e, 'e')} />
            {/* Corners */}
            <div className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize" onMouseDown={e => onResizeStart(e, 'nw')} />
            <div className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize" onMouseDown={e => onResizeStart(e, 'ne')} />
            <div className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize" onMouseDown={e => onResizeStart(e, 'sw')} />
            <div className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize" onMouseDown={e => onResizeStart(e, 'se')} />
          </>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
