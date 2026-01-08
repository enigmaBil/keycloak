import axios from "axios"

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
})

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Intercepteur pour gérer les erreurs de réponse
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken")
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)

export interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  createdAt: string
  updatedAt: string
  userId: string
}

export interface CreateTodoDto {
  title: string
  description?: string
}

export interface UpdateTodoDto {
  title?: string
  description?: string
  completed?: boolean
}

export const todosApi = {
  getAll: async (page = 1, limit = 10): Promise<{ todos: Todo[]; total: number }> => {
    const response = await apiClient.get(`/todos?page=${page}&limit=${limit}`)
    return response.data
  },

  getById: async (id: string): Promise<Todo> => {
    const response = await apiClient.get(`/todos/${id}`)
    return response.data
  },

  create: async (data: CreateTodoDto): Promise<Todo> => {
    const response = await apiClient.post("/todos", data)
    return response.data
  },

  update: async (id: string, data: UpdateTodoDto): Promise<Todo> => {
    const response = await apiClient.patch(`/todos/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/todos/${id}`)
  },

  toggleComplete: async (id: string, completed: boolean): Promise<Todo> => {
    const response = await apiClient.patch(`/todos/${id}`, { completed })
    return response.data
  },
}

export default apiClient
