using TodoApi.Models;

namespace TodoApi.Services
{
    public interface IStorageService
    {
        // User methods
        Task<User?> GetUserAsync(int id);
        Task<User?> GetUserByUsernameAsync(string username);
        Task<User> CreateUserAsync(CreateUserDto user);
        
        // Todo methods
        Task<IEnumerable<Todo>> GetAllTodosAsync();
        Task<Todo?> GetTodoAsync(int id);
        Task<Todo> CreateTodoAsync(CreateTodoDto todo);
        Task<Todo?> UpdateTodoAsync(int id, UpdateTodoDto updates);
        Task<bool> DeleteTodoAsync(int id);
        Task<int> ClearCompletedTodosAsync();
    }
}
