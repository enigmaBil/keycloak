"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Plus,
  LogOut,
  User,
  Settings,
  Trash2,
  Edit,
  MoreVertical,
  CheckCircle2,
  Circle,
  Search,
} from "lucide-react"
import { todosApi, type Todo, type CreateTodoDto } from "@/lib/api"

export default function DashboardPage() {
  const router = useRouter()
  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newTodo, setNewTodo] = useState<CreateTodoDto>({ title: "", description: "" })
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all")

  useEffect(() => {
    loadTodos()
  }, [])

  const loadTodos = async () => {
    try {
      const data = await todosApi.getAll(1, 50)
      setTodos(data.todos)
    } catch (error) {
      console.error("Erreur lors du chargement des todos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.title.trim()) return

    setIsCreating(true)
    try {
      const created = await todosApi.create(newTodo)
      setTodos([created, ...todos])
      setNewTodo({ title: "", description: "" })
    } catch (error) {
      console.error("Erreur lors de la création:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleToggleComplete = async (todo: Todo) => {
    try {
      const updated = await todosApi.toggleComplete(todo.id, !todo.completed)
      setTodos(todos.map((t) => (t.id === todo.id ? updated : t)))
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error)
    }
  }

  const handleDeleteTodo = async (id: string) => {
    try {
      await todosApi.delete(id)
      setTodos(todos.filter((t) => t.id !== id))
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("accessToken")
    router.push("/login")
  }

  const filteredTodos = todos
    .filter((todo) => {
      const matchesSearch = todo.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && !todo.completed) ||
        (filter === "completed" && todo.completed)
      return matchesSearch && matchesFilter
    })

  const stats = {
    total: todos.length,
    active: todos.filter((t) => !t.completed).length,
    completed: todos.filter((t) => t.completed).length,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-900 sticky top-0 z-10 shadow-[0_2px_8px_rgba(59,130,246,0.1)]">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Mes Tâches</h1>
            <p className="text-sm text-muted-foreground">
              {stats.active} tâche{stats.active !== 1 ? "s" : ""} en cours
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-white dark:bg-gray-800 shadow-[0_2px_8px_rgba(59,130,246,0.15)] hover:shadow-[0_4px_16px_rgba(59,130,246,0.25)] transition-shadow duration-300 border-0">
            <CardHeader className="pb-3">
              <CardDescription>Total</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white dark:bg-gray-800 shadow-[0_2px_8px_rgba(59,130,246,0.15)] hover:shadow-[0_4px_16px_rgba(59,130,246,0.25)] transition-shadow duration-300 border-0">
            <CardHeader className="pb-3">
              <CardDescription>En cours</CardDescription>
              <CardTitle className="text-3xl text-blue-500">{stats.active}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white dark:bg-gray-800 shadow-[0_2px_8px_rgba(59,130,246,0.15)] hover:shadow-[0_4px_16px_rgba(59,130,246,0.25)] transition-shadow duration-300 border-0">
            <CardHeader className="pb-3">
              <CardDescription>Terminées</CardDescription>
              <CardTitle className="text-3xl text-green-500">{stats.completed}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Create Todo Form */}
        <Card className="mb-8 bg-white dark:bg-gray-800 shadow-[0_4px_16px_rgba(59,130,246,0.2)] border-0">
          <CardHeader>
            <CardTitle>Nouvelle tâche</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTodo} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  placeholder="Que voulez-vous faire ?"
                  value={newTodo.title}
                  onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optionnelle)</Label>
                <Input
                  id="description"
                  placeholder="Ajoutez des détails..."
                  value={newTodo.description || ""}
                  onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                />
              </div>
              <Button type="submit" disabled={isCreating} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                {isCreating ? "Création..." : "Ajouter la tâche"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une tâche..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              size="sm"
            >
              Toutes ({stats.total})
            </Button>
            <Button
              variant={filter === "active" ? "default" : "outline"}
              onClick={() => setFilter("active")}
              size="sm"
            >
              En cours ({stats.active})
            </Button>
            <Button
              variant={filter === "completed" ? "default" : "outline"}
              onClick={() => setFilter("completed")}
              size="sm"
            >
              Terminées ({stats.completed})
            </Button>
          </div>
        </div>

        {/* Todos List */}
        <div className="space-y-3">
          {filteredTodos.length === 0 ? (
            <Card className="bg-white dark:bg-gray-800 shadow-[0_2px_8px_rgba(59,130,246,0.15)] border-0">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {searchQuery ? "Aucune tâche trouvée" : "Aucune tâche pour le moment"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTodos.map((todo) => (
              <Card
                key={todo.id}
                className={`bg-white dark:bg-gray-800 shadow-[0_2px_8px_rgba(59,130,246,0.15)] hover:shadow-[0_4px_16px_rgba(59,130,246,0.25)] transition-all border-0 ${
                  todo.completed ? "opacity-60" : ""
                }`}
              >
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <button onClick={() => handleToggleComplete(todo)}>
                      {todo.completed ? (
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      ) : (
                        <Circle className="h-6 w-6 text-muted-foreground hover:text-primary" />
                      )}
                    </button>
                    <div className="flex-1">
                      <h3
                        className={`font-medium ${
                          todo.completed ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {todo.title}
                      </h3>
                      {todo.description && (
                        <p className="text-sm text-muted-foreground">{todo.description}</p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteTodo(todo.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
