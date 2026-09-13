import { create } from 'zustand'

export type Task = {
  id: string
  title: string
  completed: boolean
  createdAt: number
}

type TodoStore = {
  tasks: Task[]
  addTask: (title: string) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
}

export const useTodoStore = create<TodoStore>((set) => ({
  tasks: [],
  addTask: (title) => set(state => ({
    tasks: [...state.tasks, {
      id: `task-${Date.now()}`,
      title,
      completed: false,
      createdAt: Date.now()
    }]
  })),
  toggleTask: (id) => set(state => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
  })),
  deleteTask: (id) => set(state => ({
    tasks: state.tasks.filter(t => t.id !== id)
  })),
}))
