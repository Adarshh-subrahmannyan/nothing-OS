import { create } from 'zustand'
import type { FileNode } from '@/types'
import { eventBus } from '@/core/events/eventBus'

function generateId(): string {
  return `fs-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

type FilesystemStore = {
  nodes: Record<string, FileNode>
  rootId: string

  // Navigation helpers
  getChildren: (id: string) => FileNode[]
  getNode: (id: string) => FileNode | undefined
  getPath: (id: string) => string

  // Operations
  mkdir: (parentId: string, name: string) => string
  touch: (parentId: string, name: string, content?: string) => string
  write: (id: string, content: string) => void
  read: (id: string) => string | undefined
  rename: (id: string, newName: string) => void
  deleteNode: (id: string) => void
  findByPath: (path: string) => FileNode | undefined
}

function buildInitialFS(): { nodes: Record<string, FileNode>; rootId: string } {
  const now = Date.now()
  const root: FileNode = {
    id: 'root',
    name: '/',
    type: 'directory',
    children: [],
    parentId: null,
    createdAt: now,
    updatedAt: now,
  }

  const nodes: Record<string, FileNode> = { root }

  function mkdir(parentId: string, name: string): string {
    const id = `dir-${name}`
    nodes[id] = {
      id,
      name,
      type: 'directory',
      children: [],
      parentId,
      createdAt: now,
      updatedAt: now,
    }
    nodes[parentId].children!.push(id)
    return id
  }

  function touch(parentId: string, name: string, content: string = ''): string {
    const id = `file-${parentId}-${name}`
    nodes[id] = {
      id,
      name,
      type: 'file',
      content,
      parentId,
      createdAt: now,
      updatedAt: now,
    }
    nodes[parentId].children!.push(id)
    return id
  }

  const desktop = mkdir('root', 'Desktop')
  const docs = mkdir('root', 'Documents')
  const downloads = mkdir('root', 'Downloads')
  const games = mkdir('root', 'Games')
  const notes = mkdir('root', 'Notes')
  mkdir('root', 'Projects')

  touch(notes, 'todo.txt', '- Do nothing\n- Keep doing nothing\n- Take a break from doing nothing')
  touch(notes, 'ideas.txt', 'Idea 1: Start a new project\nIdea 2: Abandon previous project\nIdea 3: Start another new project')
  touch(docs, 'README.txt', 'Welcome to Sloth OS.\n\nThis filesystem is completely virtual.\nNothing here is urgent.\nTake a nap.')
  touch(games, 'highscores.txt', 'Snake: 0\n2048: 0')

  return { nodes, rootId: 'root' }
}

const { nodes: initialNodes, rootId } = buildInitialFS()

export const useFilesystemStore = create<FilesystemStore>((set, get) => ({
  nodes: initialNodes,
  rootId,

  getNode: (id) => get().nodes[id],

  getChildren: (id) => {
    const node = get().nodes[id]
    if (!node?.children) return []
    return node.children.map(cid => get().nodes[cid]).filter(Boolean)
  },

  getPath: (id) => {
    const parts: string[] = []
    let current = get().nodes[id]
    while (current && current.id !== 'root') {
      parts.unshift(current.name)
      if (current.parentId) current = get().nodes[current.parentId]!
      else break
    }
    return '/' + parts.join('/')
  },

  findByPath: (path) => {
    const parts = path.split('/').filter(Boolean)
    const { nodes } = get()
    let current = nodes['root']
    for (const part of parts) {
      const child = current.children?.map(id => nodes[id]).find(n => n?.name === part)
      if (!child) return undefined
      current = child
    }
    return current
  },

  mkdir: (parentId, name) => {
    const id = generateId()
    const now = Date.now()
    set(state => {
      const parent = state.nodes[parentId]
      if (!parent) return state
      return {
        nodes: {
          ...state.nodes,
          [parentId]: { ...parent, children: [...(parent.children ?? []), id] },
          [id]: { id, name, type: 'directory', children: [], parentId, createdAt: now, updatedAt: now },
        },
      }
    })
    eventBus.emit('FILE_CREATED', { id, name, type: 'directory' })
    return id
  },

  touch: (parentId, name, content = '') => {
    const id = generateId()
    const now = Date.now()
    set(state => {
      const parent = state.nodes[parentId]
      if (!parent) return state
      return {
        nodes: {
          ...state.nodes,
          [parentId]: { ...parent, children: [...(parent.children ?? []), id] },
          [id]: { id, name, type: 'file', content, parentId, createdAt: now, updatedAt: now },
        },
      }
    })
    eventBus.emit('FILE_CREATED', { id, name, type: 'file' })
    return id
  },

  write: (id, content) => {
    set(state => {
      const node = state.nodes[id]
      if (!node || node.type !== 'file') return state
      return {
        nodes: { ...state.nodes, [id]: { ...node, content, updatedAt: Date.now() } },
      }
    })
  },

  read: (id) => get().nodes[id]?.content,

  rename: (id, newName) => {
    set(state => {
      const node = state.nodes[id]
      if (!node) return state
      return {
        nodes: { ...state.nodes, [id]: { ...node, name: newName, updatedAt: Date.now() } },
      }
    })
  },

  deleteNode: (id) => {
    const node = get().nodes[id]
    if (!node) return
    set(state => {
      const newNodes = { ...state.nodes }
      // Remove from parent
      if (node.parentId) {
        const parent = newNodes[node.parentId]
        if (parent) {
          newNodes[node.parentId] = {
            ...parent,
            children: parent.children?.filter(c => c !== id) ?? [],
          }
        }
      }
      // Recursively delete children
      function removeRecursive(nid: string) {
        const n = newNodes[nid]
        if (n?.children) n.children.forEach(removeRecursive)
        delete newNodes[nid]
      }
      removeRecursive(id)
      return { nodes: newNodes }
    })
    eventBus.emit('FILE_DELETED', { id })
  },
}))
