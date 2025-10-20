using backend.Data;
using backend.DTOs.Auth;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly LibraryDbContext _db;
        private readonly ITokenService _tokenService;

        public AuthController(LibraryDbContext db, ITokenService tokenService)
        {
            _db = db;
            _tokenService = tokenService;
        }
        [HttpPost("register-staff")]
        public async Task<ActionResult> RegisterStaff([FromBody] StaffRegisterDto dto, CancellationToken ct)
        {
            if (await _db.Staffs.AnyAsync(x => x.Email == dto.Email, ct))
                return Conflict("Email đã tồn tại");

            if (await _db.Staffs.AnyAsync(x => x.StaffCode == dto.StaffCode, ct))
                return Conflict("Mã nhân viên đã tồn tại");

            var staff = new Staff
            {
                StaffCode = dto.StaffCode,
                FullName = dto.FullName,
                Email = dto.Email,
                Role = StaffRole.Staff,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                IsActive = true
            };

            _db.Staffs.Add(staff);
            await _db.SaveChangesAsync(ct);

            return CreatedAtAction(nameof(Login), new { email = dto.Email }, new { staffId = staff.StaffId, staff.Email });
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto, CancellationToken ct)
        {
            var staff = await _db.Staffs.FirstOrDefaultAsync(x => x.Email == dto.Email, ct);
            if (staff == null || !staff.IsActive)
                return Unauthorized("Thông tin đăng nhập không hợp lệ");

            var ok = BCrypt.Net.BCrypt.Verify(dto.Password, staff.PasswordHash);
            if (!ok) return Unauthorized("Thông tin đăng nhập không hợp lệ");

            var (token, expiresAt) = _tokenService.CreateTokenForStaff(staff);
            return new AuthResponseDto { Token = token, ExpiresAt = expiresAt };
        }

        // NEW: Đăng ký Member
        [HttpPost("register-member")]
        public async Task<ActionResult> RegisterMember([FromBody] MemberRegisterDto dto, CancellationToken ct)
        {
            // Email có thể unique theo business; kiểm tra trùng
            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                var emailExists = await _db.Members.AnyAsync(m => m.Email == dto.Email, ct);
                if (emailExists) return Conflict("Email đã tồn tại");
            }

            string memberCode = !string.IsNullOrWhiteSpace(dto.MemberCode)
                ? dto.MemberCode!
                : GenerateMemberCode();

            // MemberCode unique
            if (await _db.Members.AnyAsync(m => m.MemberCode == memberCode, ct))
                return Conflict("Mã thành viên đã tồn tại, vui lòng thử lại");

            var member = new Member
            {
                MemberCode = memberCode,
                FullName = dto.FullName,
                Email = dto.Email,
                Phone = dto.Phone,
                Address = dto.Address,
                DateOfBirth = dto.DateOfBirth,
                IdCard = dto.IdCard,
                MembershipType = MembershipType.Community,
                RegistrationDate = DateTime.UtcNow,
                ExpiryDate = null,
                Status = MemberStatus.Active,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.Members.Add(member);
            await _db.SaveChangesAsync(ct);

            return CreatedAtAction(nameof(LoginMember), new { identifier = member.Email ?? member.MemberCode }, new { memberId = member.MemberId, member.MemberCode, member.Email });
        }

        // NEW: Đăng nhập Member bằng Email hoặc MemberCode
        [HttpPost("login-member")]
        public async Task<ActionResult<AuthResponseDto>> LoginMember([FromBody] MemberLoginDto dto, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(dto.Identifier))
                return BadRequest("Thiếu thông tin đăng nhập");

            var identifier = dto.Identifier.Trim();
            Member? member;

            if (identifier.Contains('@'))
            {
                member = await _db.Members.FirstOrDefaultAsync(m => m.Email == identifier, ct);
            }
            else
            {
                member = await _db.Members.FirstOrDefaultAsync(m => m.MemberCode == identifier, ct);
            }

            if (member == null) return Unauthorized("Thông tin đăng nhập không hợp lệ");
            if (member.Status != MemberStatus.Active) return Forbid("Tài khoản không ở trạng thái hoạt động");

            var ok = !string.IsNullOrEmpty(member.PasswordHash) && BCrypt.Net.BCrypt.Verify(dto.Password, member.PasswordHash);
            if (!ok) return Unauthorized("Thông tin đăng nhập không hợp lệ");

            var (token, expiresAt) = _tokenService.CreateTokenForMember(member);
            return new AuthResponseDto { Token = token, ExpiresAt = expiresAt };
        }

        private static string GenerateMemberCode()
        {
            var rnd = Random.Shared.Next(1000, 9999);
            return $"MB{DateTime.UtcNow:yyyyMMddHHmmss}{rnd}";
        }
    }
}
