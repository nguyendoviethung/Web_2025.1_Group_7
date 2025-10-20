using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Review
    {
        [Key]
        public int ReviewId { get; set; }

        [Required]
        public int BookId { get; set; }

        [Required]
        public int MemberId { get; set; }

        [Range(1, 5)]
        public int? Rating { get; set; }

        public string Comment { get; set; }

        public DateTime ReviewDate { get; set; } = DateTime.Now;

        public bool IsApproved { get; set; } = false;

        // Navigation
        [ForeignKey("BookId")]
        public virtual Book Book { get; set; }

        [ForeignKey("MemberId")]
        public virtual Member Member { get; set; }
    }
}
