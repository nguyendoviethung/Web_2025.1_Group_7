using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Book
{
    public class BookDto
    {
        public int BookId { get; set; }
        public string ISBN { get; set; }
        public string Title { get; set; }
        public int? PublicationYear { get; set; }
        public string Edition { get; set; }
        public string Language { get; set; }
        public int? Pages { get; set; }
        public string Description { get; set; }
        public string CoverImageUrl { get; set; }
        public string PublisherName { get; set; }
        public IEnumerable<string> Authors { get; set; }
        public IEnumerable<string> Categories { get; set; }
    }

    public class CreateBookDto
    {
        [MaxLength(20)]
        public string ISBN { get; set; }

        [Required]
        [MaxLength(255)]
        public string Title { get; set; }

        public int? PublisherId { get; set; }
        public int? PublicationYear { get; set; }

        [MaxLength(50)]
        public string Edition { get; set; }

        [MaxLength(50)]
        public string Language { get; set; }

        public int? Pages { get; set; }
        public string Description { get; set; }

        public IFormFile? CoverImageFile { get; set; }

        [Required]
        public List<int> AuthorIds { get; set; } = new List<int>();

        [Required]
        public List<int> CategoryIds { get; set; } = new List<int>();
    }

    public class UpdateBookDto
    {
        [MaxLength(20)]
        public string ISBN { get; set; }

        [Required]
        [MaxLength(255)]
        public string Title { get; set; }

        public int? PublisherId { get; set; }
        public int? PublicationYear { get; set; }

        [MaxLength(50)]
        public string Edition { get; set; }

        [MaxLength(50)]
        public string Language { get; set; }

        public int? Pages { get; set; }
        public string Description { get; set; }

        [MaxLength(255)]
        public string CoverImageUrl { get; set; }

        [Required]
        public List<int> AuthorIds { get; set; } = new List<int>();

        [Required]
        public List<int> CategoryIds { get; set; } = new List<int>();
    }
}