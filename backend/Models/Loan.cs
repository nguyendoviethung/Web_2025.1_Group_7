using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Loan
    {
        [Key]
        public int LoanId { get; set; }

        [Required]
        public int MemberId { get; set; }

        [Required]
        public int CopyId { get; set; }

        public int? StaffId { get; set; }

        [Required]
        public DateTime LoanDate { get; set; }

        [Required]
        public DateTime DueDate { get; set; }

        public DateTime? ReturnDate { get; set; }
        public LoanStatus Status { get; set; } = LoanStatus.Borrowing;
        public int RenewalCount { get; set; } = 0;
        public string Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navigation Properties
        [ForeignKey("MemberId")]
        public virtual Member Member { get; set; }

        [ForeignKey("CopyId")]
        public virtual BookCopy BookCopy { get; set; }

        [ForeignKey("StaffId")]
        public virtual Staff Staff { get; set; }

        public virtual ICollection<Fine> Fines { get; set; }
    }
}
