using ToDoApplication.API.Models;

namespace ToDoApplication.API.Repositories
{
    public interface ITodoRepository
    {
        Task<List<Todo>> GetAllAsync();
        Task<Todo?> GetByIdAsync(int id); //null olasılığı belirtilmiştir
        Task<Todo> CreateAsync(Todo todo);
        Task UpdateAsync(Todo todo);
        Task DeleteAsync(Todo todo);
    }
}
