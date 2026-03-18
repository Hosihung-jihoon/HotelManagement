using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HotelManagement.API.Data;
using HotelManagement.API.DTOs;
using HotelManagement.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace HotelManagement.API.Services;

/// <summary>
/// Auth Service - Xử lý business logic đăng ký, đăng nhập, tạo JWT token.
/// </summary>
public class AuthService : IAuthService
{
    private readonly HotelDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(HotelDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    /// <summary>
    /// Đăng ký tài khoản mới - mặc định role "Guest" (id=4)
    /// </summary>
    public async Task<TokenResponseDto> RegisterAsync(RegisterDto dto)
    {
        // Validate confirm password
        if (dto.Password != dto.ConfirmPassword)
            throw new ArgumentException("Mật khẩu xác nhận không khớp.");

        // Kiểm tra email đã tồn tại
        var existingUser = await _context.Users.AnyAsync(u => u.Email == dto.Email);
        if (existingUser)
            throw new ArgumentException("Email đã được sử dụng.");

        // Tạo user mới
        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            Phone = dto.Phone,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            RoleId = 4, // Guest role
            Status = true
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Load role để tạo token
        await _context.Entry(user).Reference(u => u.Role).LoadAsync();

        return GenerateTokenResponse(user);
    }

    /// <summary>
    /// Đăng nhập - verify password và trả JWT token
    /// </summary>
    public async Task<TokenResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (user == null)
            throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng.");

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng.");

        if (user.Status != true)
            throw new UnauthorizedAccessException("Tài khoản đã bị khóa.");

        return GenerateTokenResponse(user);
    }

    // ===== Private Helpers =====

    private TokenResponseDto GenerateTokenResponse(User user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"]!;
        var issuer = jwtSettings["Issuer"]!;
        var audience = jwtSettings["Audience"]!;
        var expirationMinutes = int.Parse(jwtSettings["ExpirationInMinutes"]!);

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiration = DateTime.UtcNow.AddMinutes(expirationMinutes);

        var claims = new List<Claim>
        {
            new("userId", user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Role, user.Role?.Name ?? "Guest")
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expiration,
            signingCredentials: credentials
        );

        return new TokenResponseDto
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            Expiration = expiration,
            UserInfo = new UserInfoDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                RoleName = user.Role?.Name
            }
        };
    }
}
