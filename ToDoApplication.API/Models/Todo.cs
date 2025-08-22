using System.ComponentModel.DataAnnotations;

namespace ToDoApplication.API.Models
{
    public class Todo
    {
        public int Id { get; set; }
        [Required]
        public string Title { get; set; } = string.Empty; //buna gerek var mı emin değilim string.Empty kısmına 
        public bool IsCompleted { get; set; }
    
        public int UserId { get; set; }

        // navigation property
        public User? User { get; set; }


    }
}
