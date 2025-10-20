using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Fine
    {
        [Key]
        public int FineId { get; set; }

        public int? LoanId { get; set; }

        [Required]
        public int MemberId { get; set; }

        [Required]
        public FineType FineType { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Amount { get; set; }

        public string Reason { get; set; }

        [Required]
        public DateTime IssueDate { get; set; }

        public DateTime? PaidDate { get; set; }

        public FineStatus Status { get; set; } = FineStatus.Unpaid;

        public int? StaffId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navigation
        [ForeignKey("LoanId")]
        public virtual Loan Loan { get; set; }

        [ForeignKey("MemberId")]
        public virtual Member Member { get; set; }

        [ForeignKey("StaffId")]
        public virtual Staff Staff { get; set; }
    }
}
