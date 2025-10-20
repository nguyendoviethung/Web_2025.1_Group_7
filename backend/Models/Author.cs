using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Author
    {
        [Key]
        public int AuthorId { get; set; }

        [Required]
        [MaxLength(255)]
        public string FullName { get; set; }

        public string Biography { get; set; }

        public DateTime? DateOfBirth { get; set; }

        [MaxLength(100)]
        public string Nationality { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navigation
        public virtual ICollection<BookAuthor> BookAuthors { get; set; }
    }
}
