using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Publisher
{
    public class PublisherDto
    {
        public int PublisherId { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
        public string Website { get; set; }
    }

    public class CreatePublisherDto
    {
        [Required]
        [MaxLength(255)]
        public string Name { get; set; }

        public string Address { get; set; }

        [MaxLength(20)]
        public string Phone { get; set; }

        [MaxLength(100)]
        [EmailAddress]
        public string Email { get; set; }

        [MaxLength(255)]
        [Url]
        public string Website { get; set; }
    }

    public class UpdatePublisherDto
    {
        [Required]
        [MaxLength(255)]
        public string Name { get; set; }

        public string Address { get; set; }

        [MaxLength(20)]
        public string Phone { get; set; }

        [MaxLength(100)]
        [EmailAddress]
        public string Email { get; set; }

        [MaxLength(255)]
        [Url]
        public string Website { get; set; }
    }
}