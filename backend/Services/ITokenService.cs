using backend.Models;

namespace backend.Services
{
    public interface ITokenService
    {
        (string token, DateTime expiresAt) CreateTokenForStaff(Staff staff);
        (string token, DateTime expiresAt) CreateTokenForMember(Member member);
    }
}
