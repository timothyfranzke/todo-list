import { todos, type Todo, type InsertTodo, type UpdateTodo, users, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Todo methods
  getAllTodos(): Promise<Todo[]>;
  getTodo(id: number): Promise<Todo | undefined>;
  createTodo(todo: InsertTodo): Promise<Todo>;
  updateTodo(id: number, updates: UpdateTodo): Promise<Todo | undefined>;
  deleteTodo(id: number): Promise<boolean>;
  clearCompletedTodos(): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private todos: Map<number, Todo>;
  private currentUserId: number;
  private currentTodoId: number;

  constructor() {
    this.users = new Map();
    this.todos = new Map();
    this.currentUserId = 1;
    this.currentTodoId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Todo methods
  async getAllTodos(): Promise<Todo[]> {
    return Array.from(this.todos.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getTodo(id: number): Promise<Todo | undefined> {
    return this.todos.get(id);
  }

  async createTodo(insertTodo: InsertTodo): Promise<Todo> {
    const id = this.currentTodoId++;
    const now = new Date();
    const todo: Todo = {
      ...insertTodo,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.todos.set(id, todo);
    return todo;
  }

  async updateTodo(id: number, updates: UpdateTodo): Promise<Todo | undefined> {
    const existing = this.todos.get(id);
    if (!existing) {
      return undefined;
    }

    const updated: Todo = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.todos.set(id, updated);
    return updated;
  }

  async deleteTodo(id: number): Promise<boolean> {
    return this.todos.delete(id);
  }

  async clearCompletedTodos(): Promise<number> {
    const completedTodos = Array.from(this.todos.values()).filter(todo => todo.completed);
    completedTodos.forEach(todo => this.todos.delete(todo.id));
    return completedTodos.length;
  }
}

export const storage = new MemStorage();
