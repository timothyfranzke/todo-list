using Microsoft.AspNetCore.Mvc;
using TodoApi.Models;
using TodoApi.Services;

namespace TodoApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TodosController : ControllerBase
    {
        private readonly IStorageService _storage;
        private readonly ILogger<TodosController> _logger;

        public TodosController(IStorageService storage, ILogger<TodosController> logger)
        {
            _storage = storage;
            _logger = logger;
        }

        // GET: api/todos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Todo>>> GetAllTodos()
        {
            try
            {
                var todos = await _storage.GetAllTodosAsync();
                return Ok(todos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to fetch todos");
                return StatusCode(500, new { message = "Failed to fetch todos" });
            }
        }

        // GET: api/todos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Todo>> GetTodo(int id)
        {
            try
            {
                var todo = await _storage.GetTodoAsync(id);
                
                if (todo == null)
                {
                    return NotFound(new { message = "Todo not found" });
                }

                return Ok(todo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to fetch todo with ID {Id}", id);
                return StatusCode(500, new { message = "Failed to fetch todo" });
            }
        }

        // POST: api/todos
        [HttpPost]
        public async Task<ActionResult<Todo>> CreateTodo(CreateTodoDto todoDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { 
                        message = "Invalid todo data",
                        errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)
                    });
                }

                var todo = await _storage.CreateTodoAsync(todoDto);
                return CreatedAtAction(nameof(GetTodo), new { id = todo.Id }, todo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create todo");
                return StatusCode(500, new { message = "Failed to create todo" });
            }
        }

        // PATCH: api/todos/5
        [HttpPatch("{id}")]
        public async Task<ActionResult<Todo>> UpdateTodo(int id, UpdateTodoDto todoDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { 
                        message = "Invalid todo data",
                        errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)
                    });
                }

                var todo = await _storage.UpdateTodoAsync(id, todoDto);
                
                if (todo == null)
                {
                    return NotFound(new { message = "Todo not found" });
                }

                return Ok(todo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update todo with ID {Id}", id);
                return StatusCode(500, new { message = "Failed to update todo" });
            }
        }

        // DELETE: api/todos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTodo(int id)
        {
            try
            {
                var deleted = await _storage.DeleteTodoAsync(id);
                
                if (!deleted)
                {
                    return NotFound(new { message = "Todo not found" });
                }

                return Ok(new { message = "Todo deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete todo with ID {Id}", id);
                return StatusCode(500, new { message = "Failed to delete todo" });
            }
        }

        // DELETE: api/todos/completed/clear
        [HttpDelete("completed/clear")]
        public async Task<IActionResult> ClearCompletedTodos()
        {
            try
            {
                var count = await _storage.ClearCompletedTodosAsync();
                return Ok(new { message = $"Cleared {count} completed todos", count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to clear completed todos");
                return StatusCode(500, new { message = "Failed to clear completed todos" });
            }
        }
    }
}
