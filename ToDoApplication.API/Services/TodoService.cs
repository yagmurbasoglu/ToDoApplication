using ToDoApplication.API.DTOs;
using ToDoApplication.API.Models;
using ToDoApplication.API.Repositories;

namespace ToDoApplication.API.Services
{
    public class TodoService : ITodoService
    {
        private readonly ITodoRepository _repository;

        public TodoService(ITodoRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<TodoDto>> GetAllAsync()
        {
            var todos = await _repository.GetAllAsync();
            return todos.Select(todo => new TodoDto
            {
                Id = todo.Id,
                Title = todo.Title,
                IsCompleted = todo.IsCompleted
            }).ToList();
        }

        public async Task<TodoDto?> GetByIdAsync(int id)
        {
            var todo = await _repository.GetByIdAsync(id);
            if (todo == null) return null;

            return new TodoDto
            {
                Id = todo.Id,
                Title = todo.Title,
                IsCompleted = todo.IsCompleted
            };
        }

        public async Task<TodoDto> CreateAsync(TodoCreateDto dto)
        {
            var todo = new Todo
            {
                Title = dto.Title,
                IsCompleted = false
            };

            var created = await _repository.CreateAsync(todo);
            return new TodoDto
            {
                Id = created.Id,
                Title = created.Title,
                IsCompleted = created.IsCompleted
            };
        }

        public async Task<bool> UpdateAsync(int id, TodoCreateDto dto)
        {
            var todo = await _repository.GetByIdAsync(id);
            if (todo == null) return false;

            todo.Title = dto.Title;
            await _repository.UpdateAsync(todo);
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var todo = await _repository.GetByIdAsync(id);
            if (todo == null) return false;

            await _repository.DeleteAsync(todo);
            return true;
        }
    }
}
