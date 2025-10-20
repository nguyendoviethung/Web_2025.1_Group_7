using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class BookDto
    {
        public int BookId { get; set; }
        public string ISBN { get; set; }
        public string Title { get; set; }
        public string PublisherName { get; set; }
        public int? PublicationYear { get; set; }
        public string Language { get; set; }
        public string CoverImageUrl { get; set; }
        public List<string> Authors { get; set; }
        public List<string> Categories { get; set; }
        public int AvailableCopies { get; set; }
        public int TotalCopies { get; set; }
    }

    public class CreateBookDto
    {
        [Required]
        public string Title { get; set; }

        public string ISBN { get; set; }
        public int? PublisherId { get; set; }
        public int? PublicationYear { get; set; }
        public string Description { get; set; }
        public List<int> AuthorIds { get; set; }
        public List<int> CategoryIds { get; set; }
    }

    public class UpdateBookDto
    {
        public string Title { get; set; }
        public string ISBN { get; set; }
        public string Description { get; set; }
        public int? PublicationYear { get; set; }
    }
}
