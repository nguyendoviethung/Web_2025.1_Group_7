using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Reservation
    {
        [Key]
        public int ReservationId { get; set; }

        [Required]
        public int MemberId { get; set; }

        [Required]
        public int BookId { get; set; }

        [Required]
        public DateTime ReservationDate { get; set; }

        public DateTime? ExpiryDate { get; set; }

        public ReservationStatus Status { get; set; } = ReservationStatus.Pending;

        public bool Notified { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navigation
        [ForeignKey("MemberId")]
        public virtual Member Member { get; set; }

        [ForeignKey("BookId")]
        public virtual Book Book { get; set; }
    }
}
