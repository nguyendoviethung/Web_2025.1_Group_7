using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Auth
{
    public class StaffRegisterDto
    {
        [Required, MaxLength(20)]
        public string StaffCode { get; set; } = default!;
        [Required, MaxLength(255)]
        public string FullName { get; set; } = default!;
        [Required, EmailAddress, MaxLength(100)]
        public string Email { get; set; } = default!;
        [Required, MinLength(6)]
        public string Password { get; set; } = default!;
        [MaxLength(20)]
        public string IdCard { get; set; }
    }

    public class LoginDto
    {
        [Required, EmailAddress]
        public string Email { get; set; } = default!;
        [Required]
        public string Password { get; set; } = default!;
    }

    public class AuthResponseDto
    {
        public string Token { get; set; } = default!;
        public DateTime ExpiresAt { get; set; }
    }

    // NEW: Member registration
    public class MemberRegisterDto
    {
        [MaxLength(20)]
        public string? MemberCode { get; set; } // nếu không gửi, hệ thống sẽ tự tạo
        [Required, MaxLength(255)]
        public string FullName { get; set; } = default!;
        [Required, EmailAddress, MaxLength(100)]
        public string Email { get; set; } = default!;
        [MaxLength(20)]
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public DateTime? DateOfBirth { get; set; }
        [MinLength(6)]
        public string Password { get; set; } = default!;
        [MaxLength(20)]
        public string IdCard { get; set; }
    }

    // NEW: Member login bằng Email hoặc MemberCode
    public class MemberLoginDto
    {
        [Required]
        public string Identifier { get; set; } = default!; // Email hoặc MemberCode
        [Required]
        public string Password { get; set; } = default!;
    }
}
