namespace ToDoApplication.API.DTOs
{
    public class TodoUpdateDto
    {
        public string Title { get; set; } = default!;
        public bool IsCompleted { get; set; }
    }
}
