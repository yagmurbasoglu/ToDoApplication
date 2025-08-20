namespace ToDoApplication.API.DTOs
{
    public class TodoDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = default!;
        public bool IsCompleted { get; set; }
    }
}
