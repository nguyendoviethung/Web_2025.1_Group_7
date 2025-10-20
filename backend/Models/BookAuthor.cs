using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class BookAuthor
    {
        public int BookId { get; set; }
        public int AuthorId { get; set; }

        public AuthorRole AuthorRole { get; set; } = AuthorRole.Main;

        [ForeignKey("BookId")]
        public virtual Book Book { get; set; }

        [ForeignKey("AuthorId")]
        public virtual Author Author { get; set; }
    }
}
