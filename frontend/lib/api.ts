import axios from "axios"
import { getSession } from "next-auth/react"

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
})

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      // Get token from NextAuth session
      const session = await getSession()
      console.log("Session in interceptor:", session ? "exists" : "null", session?.accessToken ? "has token" : "no token")
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`
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
      // Token expiré ou invalide - redirect to home page (login)
      if (typeof window !== "undefined") {
        window.location.href = "/"
      }
    }
    return Promise.reject(error)
  }
)

// ==================== Types et Interfaces ====================

// Todo Types
export interface Todo {
  id: string
  title: string
  summary: string | null
  completed: boolean
  userId: string
  createdAt: string
  updatedAt: string
}

export interface CreateTodoDto {
  title: string
  summary?: string
  completed?: boolean
}

export interface UpdateTodoDto {
  title?: string
  summary?: string
  completed?: boolean
}

// User Types
export interface User {
  id: string
  username: string
  email: string
}

export interface CreateUserDto {
  username: string
  email: string
  password: string
}

export interface UpdateUserDto {
  username?: string
  email?: string
  password?: string
}

// ==================== API Functions ====================

export const todosApi = {
  getAll: async (page = 1, limit = 10): Promise<{ data: Todo[]; meta: { total: number; page: number; limit: number; totalPages: number } }> => {
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
