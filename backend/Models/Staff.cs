using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Staff
    {
        [Key]
        public int StaffId { get; set; }

        [Required]
        [MaxLength(20)]
        public string StaffCode { get; set; }

        [Required]
        [MaxLength(255)]
        public string FullName { get; set; }

        [Required]
        [MaxLength(100)]
        public string Email { get; set; }

        [MaxLength(20)]
        public string Phone { get; set; }

        [MaxLength(100)]
        public string Position { get; set; }

        public StaffRole Role { get; set; } = StaffRole.Staff;

        [Required]
        [MaxLength(255)]
        public string PasswordHash { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navigation
        public virtual ICollection<Loan> Loans { get; set; }
        public virtual ICollection<Fine> Fines { get; set; }
    }
}
