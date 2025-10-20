using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Book
    {
        [Key]
        public int BookId { get; set; }

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
        public string Language { get; set; } = "Vietnamese";

        public int? Pages { get; set; }
        public string Description { get; set; }

        [MaxLength(255)]
        public string CoverImageUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        // Navigation Properties
        [ForeignKey("PublisherId")]
        public virtual Publisher Publisher { get; set; }

        public virtual ICollection<BookAuthor> BookAuthors { get; set; }
        public virtual ICollection<BookCategory> BookCategories { get; set; }
        public virtual ICollection<BookCopy> BookCopies { get; set; }
        public virtual ICollection<Reservation> Reservations { get; set; }
        public virtual ICollection<Review> Reviews { get; set; }
    }

    public class BookCopy
    {
        [Key]
        public int CopyId { get; set; }

        [Required]
        public int BookId { get; set; }

        [MaxLength(50)]
        public string Barcode { get; set; }

        public CopyStatus Status { get; set; } = CopyStatus.Available;

        [MaxLength(100)]
        public string Location { get; set; }

        public DateTime? AcquisitionDate { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal? Price { get; set; }

        public string ConditionNote { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [ForeignKey("BookId")]
        public virtual Book Book { get; set; }

        public virtual ICollection<Loan> Loans { get; set; }
    }
}
