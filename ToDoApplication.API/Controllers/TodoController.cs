using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ToDoApplication.API.Data;
using ToDoApplication.API.DTOs;
using ToDoApplication.API.Models;
using Microsoft.Extensions.Logging;

namespace ToDoApplication.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TodoController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<TodoController> _logger;

        public TodoController(AppDbContext context, ILogger<TodoController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET /api/todo
        [HttpGet]
        public async Task<IActionResult> GetTodos()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            _logger.LogInformation("Kullanıcı {UserId} için tüm todos listeleniyor.", userId);

            var todos = await _context.Todos
                .Where(t => t.UserId == userId)
                .Select(t => new TodoDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    IsCompleted = t.IsCompleted
                })
                .ToListAsync();

            return Ok(todos);
        }

        // GET /api/todo/{id}
        [HttpGet("{id:int}", Name = "GetTodoById")]
        public async Task<ActionResult<TodoDto>> GetTodoById(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            _logger.LogInformation("Kullanıcı {UserId}, todo {TodoId} detayını istedi.", userId, id);

            var todo = await _context.Todos
                .Where(t => t.Id == id && t.UserId == userId)
                .Select(t => new TodoDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    IsCompleted = t.IsCompleted
                })
                .FirstOrDefaultAsync();

            return todo is null ? NotFound() : Ok(todo);
        }

        // POST /api/todo
        [HttpPost]
        public async Task<IActionResult> CreateTodo([FromBody] TodoCreateDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            _logger.LogInformation("Kullanıcı {UserId}, yeni todo oluşturuyor: {Title}", userId, dto.Title);

            var entity = new Todo
            {
                Title = dto.Title,
                IsCompleted = false,
                UserId = userId
            };

            _context.Todos.Add(entity);
            await _context.SaveChangesAsync();

            var result = new TodoDto
            {
                Id = entity.Id,
                Title = entity.Title,
                IsCompleted = entity.IsCompleted
            };

            _logger.LogInformation("Kullanıcı {UserId}, todo {TodoId} oluşturdu.", userId, entity.Id);

            return CreatedAtAction(nameof(GetTodoById), new { id = entity.Id }, result);
        }

        // PUT /api/todo/{id}
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateTodo(int id, [FromBody] TodoUpdateDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            _logger.LogInformation("Kullanıcı {UserId}, todo {TodoId} güncelliyor.", userId, id);

            var todo = await _context.Todos.FindAsync(id);
            if (todo is null || todo.UserId != userId)
            {
                _logger.LogWarning("Kullanıcı {UserId}, todo {TodoId} güncelleyemedi. Bulunamadı.", userId, id);
                return NotFound();
            }

            todo.Title = dto.Title;
            todo.IsCompleted = dto.IsCompleted;

            await _context.SaveChangesAsync();
            _logger.LogInformation("Kullanıcı {UserId}, todo {TodoId} başarıyla güncelledi.", userId, id);

            return NoContent();
        }

        // DELETE /api/todo/{id}
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteTodo(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            _logger.LogInformation("Kullanıcı {UserId}, todo {TodoId} silmek istiyor.", userId, id);

            var todo = await _context.Todos.FindAsync(id);
            if (todo is null || todo.UserId != userId)
            {
                _logger.LogWarning("Kullanıcı {UserId}, todo {TodoId} silinemedi. Bulunamadı.", userId, id);
                return NotFound();
            }

            _context.Todos.Remove(todo);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Kullanıcı {UserId}, todo {TodoId} başarıyla sildi.", userId, id);

            return NoContent();
        }

        // GET /api/todo/test-log
        [HttpGet("test-log")]
        [AllowAnonymous]
        public IActionResult TestLog()
        {
            _logger.LogInformation(" TestLog endpointi çağrıldı");
            _logger.LogWarning(" Bu bir uyarı logudur");
            _logger.LogError(" Bu bir hata logudur");

            return Ok(new { Message = "Log testi tamamlandı. Console ve logs klasörüne bak!" });
        }

        //GET /api/todo/crash-test
        [HttpGet("crash-test")]
        [AllowAnonymous]
        public IActionResult CrashTest()
        {
            throw new Exception("Bu bir test exception’dır!");
        }

    }
}
