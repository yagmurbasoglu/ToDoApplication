using ToDoApplication.API.DTOs;

namespace ToDoApplication.API.Services
{
    public interface ITodoService
    {
        Task<List<TodoDto>> GetAllAsync();
        Task<TodoDto?> GetByIdAsync(int id);
        Task<TodoDto> CreateAsync(TodoCreateDto dto);
        Task<bool> UpdateAsync(int id, TodoCreateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
