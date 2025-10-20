using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class ActivityLog
    {
        [Key]
        public int LogId { get; set; }

        [Required]
        public ActivityUserType UserType { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Action { get; set; }

        [MaxLength(50)]
        public string TableName { get; set; }

        public int? RecordId { get; set; }

        public string Description { get; set; }

        [MaxLength(45)]
        public string IpAddress { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
