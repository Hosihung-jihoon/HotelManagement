using HotelManagement.API.DTOs;

namespace HotelManagement.API.Services;

/// <summary>
/// Interface Auth Service - Xử lý đăng ký, đăng nhập.
/// </summary>
public interface IAuthService
{
    Task<TokenResponseDto> LoginAsync(LoginDto dto);
    Task<TokenResponseDto> RegisterAsync(RegisterDto dto);
}
