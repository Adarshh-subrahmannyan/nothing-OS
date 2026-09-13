'use client'

import { useState } from 'react'
import { Check, Plus, Trash2, ListTodo } from 'lucide-react'
import { useTodoStore } from '@/core/todo/todoStore'

export default function Todo({ windowId }: { windowId: string }) {
  const { tasks, addTask, toggleTask, deleteTask } = useTodoStore()
  const [newTaskTitle, setNewTaskTitle] = useState('')

  const handleAdd = () => {
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim())
      setNewTaskTitle('')
    }
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--color-os-surface)' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4 shrink-0"
        style={{ borderBottom: '1px solid var(--color-os-border)', background: 'var(--color-os-elevated)' }}
      >
        <ListTodo size={18} style={{ color: '#F85149' }} />
        <div>
          <div style={{ color: 'var(--color-os-text)', fontSize: 14, fontWeight: 600 }}>Tasks</div>
          <div style={{ color: 'var(--color-os-text-muted)', fontSize: 11 }}>
            Things you really shouldn't be doing right now.
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="p-4" style={{ borderBottom: '1px solid var(--color-os-border)' }}>
        <div className="flex gap-2">
          <input
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd()
            }}
            placeholder="Add a new productive task..."
            className="flex-1 min-w-0 bg-transparent outline-none px-3 py-2 rounded-lg text-sm"
            style={{
              border: '1px solid var(--color-os-border)',
              background: 'var(--color-os-elevated)',
              color: 'var(--color-os-text)'
            }}
          />
          <button
            onClick={handleAdd}
            className="w-9 h-9 shrink-0 rounded-lg hover:opacity-80 transition-opacity flex items-center justify-center"
            style={{ background: '#F85149', color: '#fff' }}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {tasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
            <ListTodo size={48} className="mb-4" />
            <div style={{ color: 'var(--color-os-text)', fontSize: 14, fontWeight: 500 }}>No tasks found</div>
            <div style={{ color: 'var(--color-os-text-muted)', fontSize: 12, marginTop: 4 }}>
              Perfect. Stay lazy.
            </div>
          </div>
        ) : (
          tasks.map(task => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 rounded-lg group transition-colors"
              style={{
                background: 'var(--color-os-elevated)',
                border: '1px solid var(--color-os-border)',
                opacity: task.completed ? 0.5 : 1,
              }}
            >
              <button
                onClick={() => toggleTask(task.id)}
                className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors"
                style={{
                  border: `1px solid ${task.completed ? '#3FB950' : 'var(--color-os-border)'}`,
                  background: task.completed ? '#3FB950' : 'transparent',
                }}
              >
                {task.completed && <Check size={12} color="#000" />}
              </button>
              <div
                className="flex-1 text-sm truncate"
                style={{
                  color: 'var(--color-os-text)',
                  textDecoration: task.completed ? 'line-through' : 'none',
                }}
              >
                {task.title}
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="p-1.5 rounded hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: '#F85149' }}
                title="Delete task"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
