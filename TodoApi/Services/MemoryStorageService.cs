using TodoApi.Models;

namespace TodoApi.Services
{
    public class MemoryStorageService : IStorageService
    {
        private readonly Dictionary<int, User> _users;
        private readonly Dictionary<int, Todo> _todos;
        private int _currentUserId;
        private int _currentTodoId;

        public MemoryStorageService()
        {
            _users = new Dictionary<int, User>();
            _todos = new Dictionary<int, Todo>();
            _currentUserId = 1;
            _currentTodoId = 1;
        }

        // User methods
        public Task<User?> GetUserAsync(int id)
        {
            _users.TryGetValue(id, out var user);
            return Task.FromResult(user);
        }

        public Task<User?> GetUserByUsernameAsync(string username)
        {
            var user = _users.Values.FirstOrDefault(u => u.Username == username);
            return Task.FromResult(user);
        }

        public Task<User> CreateUserAsync(CreateUserDto userDto)
        {
            var id = _currentUserId++;
            var user = new User
            {
                Id = id,
                Username = userDto.Username,
                Password = userDto.Password
            };
            
            _users[id] = user;
            return Task.FromResult(user);
        }

        // Todo methods
        public Task<IEnumerable<Todo>> GetAllTodosAsync()
        {
            var todos = _todos.Values
                .OrderByDescending(t => t.CreatedAt)
                .ToList();
                
            return Task.FromResult<IEnumerable<Todo>>(todos);
        }

        public Task<Todo?> GetTodoAsync(int id)
        {
            _todos.TryGetValue(id, out var todo);
            return Task.FromResult(todo);
        }

        public Task<Todo> CreateTodoAsync(CreateTodoDto todoDto)
        {
            var id = _currentTodoId++;
            var now = DateTime.UtcNow;
            
            var todo = new Todo
            {
                Id = id,
                Title = todoDto.Title,
                Completed = todoDto.Completed,
                CreatedAt = now,
                UpdatedAt = now
            };
            
            _todos[id] = todo;
            return Task.FromResult(todo);
        }

        public Task<Todo?> UpdateTodoAsync(int id, UpdateTodoDto updates)
        {
            if (!_todos.TryGetValue(id, out var existingTodo))
            {
                return Task.FromResult<Todo?>(null);
            }

            if (updates.Title != null)
            {
                existingTodo.Title = updates.Title;
            }
            
            if (updates.Completed.HasValue)
            {
                existingTodo.Completed = updates.Completed.Value;
            }
            
            existingTodo.UpdatedAt = DateTime.UtcNow;
            _todos[id] = existingTodo;
            
            return Task.FromResult<Todo?>(existingTodo);
        }

        public Task<bool> DeleteTodoAsync(int id)
        {
            var result = _todos.Remove(id);
            return Task.FromResult(result);
        }

        public Task<int> ClearCompletedTodosAsync()
        {
            var completedTodos = _todos.Values.Where(t => t.Completed).ToList();
            
            foreach (var todo in completedTodos)
            {
                _todos.Remove(todo.Id);
            }
            
            return Task.FromResult(completedTodos.Count);
        }
    }
}
