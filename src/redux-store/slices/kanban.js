import { createSlice } from '@reduxjs/toolkit'

// Default Initial State
const initialState = {
  columns: [
    { id: 1, title: 'To Do', taskIds: [1, 2, 3, 4] },
    { id: 2, title: 'In Progress', taskIds: [5, 6, 7, 8] },
    { id: 3, title: 'Done', taskIds: [9, 10, 11, 12] }
  ],
  tasks: [
    { id: 1, title: 'Task 1' },
    { id: 2, title: 'Task 2' },
    { id: 3, title: 'Task 3' },
    { id: 4, title: 'Task 4' },
    { id: 5, title: 'Task 5' },
    { id: 6, title: 'Task 6' },
    { id: 7, title: 'Task 7' },
    { id: 8, title: 'Task 8' },
    { id: 9, title: 'Task 9' },
    { id: 10, title: 'Task 10' },
    { id: 11, title: 'Task 11' },
    { id: 12, title: 'Task 12' }
  ],
  currentTaskId: null
}

export const kanbanSlice = createSlice({
  name: 'kanban',
  initialState,
  reducers: {
    addColumn: (state, action) => {
      const maxId = state.columns.length > 0 ? Math.max(...state.columns.map(column => column.id)) : 0

      const newColumn = {
        id: maxId + 1,
        title: action.payload,
        taskIds: []
      }

      state.columns.push(newColumn)
    },
    editColumn: (state, action) => {
      const { id, title } = action.payload
      const column = state.columns.find(column => column.id === id)

      if (column) {
        column.title = title
      }
    },
    deleteColumn: (state, action) => {
      const { columnId } = action.payload
      const column = state.columns.find(column => column.id === columnId)

      state.columns = state.columns.filter(column => column.id !== columnId)

      if (column) {
        state.tasks = state.tasks.filter(task => !column.taskIds.includes(task.id))
      }
    },
    updateColumns: (state, action) => {
      state.columns = action.payload
    },
    updateColumnTaskIds: (state, action) => {
      const { id, tasksList } = action.payload

      state.columns = state.columns.map(column => {
        if (column.id === id) {
          return { ...column, taskIds: tasksList.map(task => task.id) }
        }

        
return column
      })
    },
    addTask: (state, action) => {
      const { columnId, title } = action.payload

      const newTask = {
        id: state.tasks.length > 0 ? state.tasks[state.tasks.length - 1].id + 1 : 1,
        title
      }

      const column = state.columns.find(column => column.id === columnId)

      if (column) {
        column.taskIds.push(newTask.id)
      }

      state.tasks.push(newTask)
    },
    editTask: (state, action) => {
      const { id, badgeText, dueDate, category } = action.payload
      const task = state.tasks.find(task => task.id === id)

      if (task) {
        // Only update fields except title
        task.badgeText = badgeText || task.badgeText
        task.dueDate = dueDate || task.dueDate
        task.category = category || task.category
      } else {
        // If task does not exist, create a new one
        const newTask = {
          id,
          title: `Task ${id}`, // Default title
          badgeText: badgeText || '',
          dueDate: dueDate || null,
          category: category || ''
        }

        state.tasks.push(newTask)
      }
    },
    deleteTask: (state, action) => {
      const taskId = action.payload

      state.tasks = state.tasks.filter(task => task.id !== taskId)
      state.columns = state.columns.map(column => ({
        ...column,
        taskIds: column.taskIds.filter(id => id !== taskId)
      }))
    },
    getCurrentTask: (state, action) => {
      state.currentTaskId = action.payload
    }
  }
})

export const {
  addColumn,
  editColumn,
  deleteColumn,
  updateColumns,
  updateColumnTaskIds,
  addTask,
  editTask,
  deleteTask,
  getCurrentTask
} = kanbanSlice.actions

export default kanbanSlice.reducer
