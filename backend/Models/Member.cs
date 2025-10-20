using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Member
    {
        [Key]
        public int MemberId { get; set; }

        [Required]
        [MaxLength(20)]
        public string MemberCode { get; set; }

        [Required]
        [MaxLength(255)]
        public string FullName { get; set; }

        [MaxLength(100)]
        public string Email { get; set; }

        [MaxLength(20)]
        public string Phone { get; set; }

        public string Address { get; set; }
        public DateTime? DateOfBirth { get; set; }

        [MaxLength(20)]
        public string IdCard { get; set; }

        public MembershipType MembershipType { get; set; } = MembershipType.Community;

        [Required]
        public DateTime RegistrationDate { get; set; }

        public DateTime? ExpiryDate { get; set; }
        public MemberStatus Status { get; set; } = MemberStatus.Active;

        [MaxLength(255)]
        public string PasswordHash { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        // Navigation Properties
        public virtual ICollection<Loan> Loans { get; set; }
        public virtual ICollection<Reservation> Reservations { get; set; }
        public virtual ICollection<Fine> Fines { get; set; }
        public virtual ICollection<Review> Reviews { get; set; }
    }
}
