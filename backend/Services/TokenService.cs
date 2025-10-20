using backend.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Services
{
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _config;
        public TokenService(IConfiguration config)
        {
            _config = config;
        }

        public (string token, DateTime expiresAt) CreateTokenForStaff(Staff staff)
        {
            return CreateToken(
                new[]
                {
                    new Claim(JwtRegisteredClaimNames.Sub, staff.StaffId.ToString()),
                    new Claim(JwtRegisteredClaimNames.Email, staff.Email),
                    new Claim(ClaimTypes.Name, staff.FullName),
                    new Claim(ClaimTypes.Role, staff.Role.ToString()),
                    new Claim("user_type", "Staff"),
                    new Claim("staff_code", staff.StaffCode)
                }
            );
        }

        public (string token, DateTime expiresAt) CreateTokenForMember(Member member)
        {
            // Role cố định: "Member"
            return CreateToken(
                new[]
                {
                    new Claim(JwtRegisteredClaimNames.Sub, member.MemberId.ToString()),
                    new Claim(JwtRegisteredClaimNames.Email, member.Email ?? string.Empty),
                    new Claim(ClaimTypes.Name, member.FullName),
                    new Claim(ClaimTypes.Role, "Member"),
                    new Claim("user_type", "Member"),
                    new Claim("member_code", member.MemberCode)
                }
            );
        }

        private (string token, DateTime expiresAt) CreateToken(IEnumerable<Claim> claims)
        {
            var jwtSection = _config.GetSection("Jwt");
            var key = jwtSection.GetValue<string>("Key")!;
            var issuer = jwtSection.GetValue<string>("Issuer");
            var audience = jwtSection.GetValue<string>("Audience");
            var expireMinutes = jwtSection.GetValue<int>("ExpireMinutes", 120);

            var creds = new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
                SecurityAlgorithms.HmacSha256
            );

            var expires = DateTime.UtcNow.AddMinutes(expireMinutes);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                notBefore: DateTime.UtcNow,
                expires: expires,
                signingCredentials: creds
            );

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);
            return (jwt, expires);
        }
    }
}
