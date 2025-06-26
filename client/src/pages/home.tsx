import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTodoSchema, type Todo, type InsertTodo } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { CheckSquare, Plus, Edit, Trash2, Check, X, ClipboardList, Moon } from "lucide-react";
import { z } from "zod";

type FilterType = "all" | "active" | "completed";

const createTodoSchema = insertTodoSchema.extend({
  title: z.string().min(3, "Task description must be at least 3 characters"),
});

export default function Home() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof createTodoSchema>>({
    resolver: zodResolver(createTodoSchema),
    defaultValues: {
      title: "",
      completed: false,
    },
  });

  // Queries
  const { data: todos = [], isLoading } = useQuery<Todo[]>({
    queryKey: ["/api/todos"],
  });

  // Mutations
  const createTodoMutation = useMutation({
    mutationFn: async (data: InsertTodo) => {
      const response = await apiRequest("POST", "/api/todos", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      form.reset();
      toast({
        title: "Task created",
        description: "Your new task has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateTodoMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Todo> }) => {
      const response = await apiRequest("PATCH", `/api/todos/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      setEditingId(null);
      toast({
        title: "Task updated",
        description: "Your task has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteTodoMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/todos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      toast({
        title: "Task deleted",
        description: "Your task has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const clearCompletedMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/todos/completed/clear");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      toast({
        title: "Completed tasks cleared",
        description: `Removed ${data.count} completed tasks.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear completed tasks. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Filter todos
  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  // Statistics
  const totalTodos = todos.length;
  const activeTodos = todos.filter((todo) => !todo.completed).length;
  const completedTodos = todos.filter((todo) => todo.completed).length;
  const progressPercentage = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  const onSubmit = (data: z.infer<typeof createTodoSchema>) => {
    createTodoMutation.mutate(data);
  };

  const handleToggleComplete = (todo: Todo) => {
    updateTodoMutation.mutate({
      id: todo.id,
      updates: { completed: !todo.completed },
    });
  };

  const handleEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
  };

  const handleSaveEdit = () => {
    if (editingId && editTitle.trim()) {
      updateTodoMutation.mutate({
        id: editingId,
        updates: { title: editTitle.trim() },
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-divider sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <CheckSquare className="text-white text-lg" />
              </div>
              <h1 className="text-2xl font-bold text-on-surface">Todo List</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-muted">
                <span>{activeTodos}</span>
                <span>active</span>
                <span className="mx-2">•</span>
                <span>{completedTodos}</span>
                <span>completed</span>
              </div>
              <Button variant="ghost" size="sm" className="p-2 text-muted hover:text-on-surface">
                <Moon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Todo Form */}
        <Card className="p-6 mb-8 shadow-material">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-on-surface">
                      Add a new task
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="What needs to be done?"
                          className="pr-32 py-3 focus:ring-2 focus:ring-primary focus:border-primary"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="submit"
                        disabled={createTodoMutation.isPending}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary-dark text-white font-medium"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Task
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </Card>

        {/* Filters */}
        <Card className="p-4 mb-6 shadow-material">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-on-surface">Filter:</span>
              <div className="flex bg-surface rounded-lg p-1">
                {(["all", "active", "completed"] as FilterType[]).map((filterType) => (
                  <Button
                    key={filterType}
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilter(filterType)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      filter === filterType
                        ? "bg-primary text-white"
                        : "text-muted hover:text-on-surface"
                    }`}
                  >
                    {filterType === "all" ? "All Tasks" : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearCompletedMutation.mutate()}
              disabled={clearCompletedMutation.isPending || completedTodos === 0}
              className="text-muted hover:text-on-surface"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Completed
            </Button>
          </div>
        </Card>

        {/* Todo List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted mt-2">Loading tasks...</p>
            </div>
          ) : filteredTodos.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="text-3xl text-muted" size={48} />
              </div>
              <h3 className="text-xl font-semibold text-on-surface mb-2">
                {totalTodos === 0 ? "No tasks yet" : `No ${filter} tasks`}
              </h3>
              <p className="text-muted">
                {totalTodos === 0
                  ? "Add your first task above to get started!"
                  : `You have no ${filter} tasks at the moment.`}
              </p>
            </div>
          ) : (
            filteredTodos.map((todo) => (
              <Card
                key={todo.id}
                className={`p-4 shadow-material hover:shadow-material-lg transition-shadow ${
                  todo.completed ? "opacity-75" : ""
                } ${editingId === todo.id ? "border-2 border-primary" : ""}`}
              >
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleComplete(todo)}
                    disabled={editingId === todo.id || updateTodoMutation.isPending}
                    className={`w-6 h-6 rounded-full border-2 p-0 flex items-center justify-center transition-colors ${
                      todo.completed
                        ? "bg-success border-success hover:border-primary text-white"
                        : "border-divider hover:border-primary"
                    }`}
                  >
                    {todo.completed && <Check className="w-3 h-3" />}
                  </Button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      {editingId === todo.id ? (
                        <div className="flex items-center space-x-2 flex-1">
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            disabled={updateTodoMutation.isPending}
                            className="bg-success hover:bg-green-600 text-white"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleCancelEdit}
                            className="bg-muted hover:bg-gray-600 text-white"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <p
                            className={`font-medium truncate ${
                              todo.completed
                                ? "line-through text-muted"
                                : "text-on-surface"
                            }`}
                          >
                            {todo.title}
                          </p>
                          <div className="flex items-center space-x-2 ml-4">
                            <span className="text-xs text-muted">
                              {new Date(todo.createdAt).toLocaleDateString()}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(todo)}
                              disabled={updateTodoMutation.isPending}
                              className="p-1 text-muted hover:text-primary"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteTodoMutation.mutate(todo.id)}
                              disabled={deleteTodoMutation.isPending}
                              className="p-1 text-muted hover:text-accent"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-surface rounded-full h-1">
                        <div
                          className={`h-1 rounded-full transition-all duration-500 ${
                            todo.completed ? "bg-success" : "bg-primary"
                          }`}
                          style={{ width: todo.completed ? "100%" : "0%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Statistics */}
        <Card className="mt-8 p-6 shadow-material">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{totalTodos}</div>
              <div className="text-sm text-muted mt-1">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">{activeTodos}</div>
              <div className="text-sm text-muted mt-1">Active Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-success">{completedTodos}</div>
              <div className="text-sm text-muted mt-1">Completed Tasks</div>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-muted mb-2">
              <span>Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </Card>
      </main>

      {/* Floating Action Button */}
      <Button
        onClick={() => {
          const input = document.querySelector('input[name="title"]') as HTMLInputElement;
          if (input) {
            input.focus();
            input.scrollIntoView({ behavior: "smooth" });
          }
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary-dark text-white rounded-full shadow-material-lg hover:shadow-xl transition-all duration-200 md:hidden"
      >
        <Plus className="text-xl" />
      </Button>
    </div>
  );
}
