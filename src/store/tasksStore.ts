import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Task, TaskComment } from '../types/tasks'
import { INITIAL_TASKS } from '../data/mockTasks'

interface TasksState {
  tasks: Task[]
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  addComment: (taskId: string, comment: TaskComment) => void
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set) => ({
      tasks: INITIAL_TASKS,

      addTask: (task: Task) => {
        set(state => ({ tasks: [...state.tasks, task] }))
      },

      updateTask: (id: string, updates: Partial<Task>) => {
        set(state => ({
          tasks: state.tasks.map(t => (t.id === id ? { ...t, ...updates } : t)),
        }))
      },

      deleteTask: (id: string) => {
        set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }))
      },

      addComment: (taskId: string, comment: TaskComment) => {
        set(state => ({
          tasks: state.tasks.map(t =>
            t.id === taskId
              ? { ...t, comments: [...t.comments, comment] }
              : t,
          ),
        }))
      },
    }),
    {
      name: 'qi-tasks',
      // Only seed with mock data if localStorage is empty / missing
      merge: (persisted, current) => {
        const p = persisted as Partial<TasksState>
        if (!p.tasks || p.tasks.length === 0) {
          return { ...current, tasks: INITIAL_TASKS }
        }
        return { ...current, ...p }
      },
    },
  ),
)
