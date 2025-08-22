using Microsoft.EntityFrameworkCore;
using ToDoApplication.API.Data;
using ToDoApplication.API.Models;

namespace ToDoApplication.API.Repositories
{
    public class TodoRepository : ITodoRepository
    {
        private readonly AppDbContext _context;
        public TodoRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Todo>> GetAllAsync() => await _context.Todos.ToListAsync();
        public async Task<Todo?> GetByIdAsync(int id) => await _context.Todos.FindAsync(id);
        public async Task<Todo> CreateAsync(Todo todo)
        {
            _context.Todos.Add(todo);
            await _context.SaveChangesAsync();
            return todo;
        }
        public async Task UpdateAsync(Todo todo)
        {
            _context.Todos.Update(todo);
            await _context.SaveChangesAsync();
        }
        public async Task DeleteAsync(Todo todo)
        {
            _context.Todos.Remove(todo);
            await _context.SaveChangesAsync();
        }
    }
}
