using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Author
{
    public class AuthorDto
    {
        public int AuthorId { get; set; }
        public string FullName { get; set; }
        public string Biography { get; set; }
        public string? DateOfBirth { get; set; }
        public string Nationality { get; set; }
    }

    public class CreateAuthorDto
    {
        [Required]
        [MaxLength(255)]
        public string FullName { get; set; }

        public string Biography { get; set; }

        public DateTime? DateOfBirth { get; set; }

        [MaxLength(100)]
        public string Nationality { get; set; }
    }

    public class UpdateAuthorDto
    {
        [Required]
        [MaxLength(255)]
        public string FullName { get; set; }

        public string Biography { get; set; }

        public DateTime? DateOfBirth { get; set; }

        [MaxLength(100)]
        public string Nationality { get; set; }
    }
}