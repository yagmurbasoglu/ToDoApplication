using System.ComponentModel.DataAnnotations;

namespace ToDoApplication.API.Models
{
    public class User // yalnızca 1 kez tanımlı olmalı
    {
        public int Id { get; set; }

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;
        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        //Navigation property
        public ICollection<Todo> Todos { get; set; } = new List<Todo>();

    }
}
