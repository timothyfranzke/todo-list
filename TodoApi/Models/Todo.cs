using System;
using System.ComponentModel.DataAnnotations;

namespace TodoApi.Models
{
    public class Todo
    {
        public int Id { get; set; }
        
        [Required]
        public string Title { get; set; } = string.Empty;
        
        public bool Completed { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class CreateTodoDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;
        
        public bool Completed { get; set; } = false;
    }

    public class UpdateTodoDto
    {
        public string? Title { get; set; }
        
        public bool? Completed { get; set; }
    }
}
