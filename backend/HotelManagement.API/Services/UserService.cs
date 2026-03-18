using HotelManagement.API.Data;
using HotelManagement.API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Services;

/// <summary>
/// User Service - Xử lý profile user, đổi mật khẩu, quản lý user (admin).
/// </summary>
public class UserService : IUserService
{
    private readonly HotelDbContext _context;

    public UserService(HotelDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lấy profile user hiện tại
    /// </summary>
    public async Task<UserProfileDto?> GetProfileAsync(int userId)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .Include(u => u.Membership)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return null;

        return new UserProfileDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Phone = user.Phone,
            Status = user.Status,
            RoleName = user.Role?.Name,
            MembershipName = user.Membership?.TierName
        };
    }

    /// <summary>
    /// Cập nhật profile (tên, sdt)
    /// </summary>
    public async Task<bool> UpdateProfileAsync(int userId, UpdateProfileDto dto)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;

        user.FullName = dto.FullName;
        user.Phone = dto.Phone;

        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Đổi mật khẩu - verify current password trước
    /// </summary>
    public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto dto)
    {
        if (dto.NewPassword != dto.ConfirmNewPassword)
            throw new ArgumentException("Mật khẩu xác nhận không khớp.");

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;

        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            throw new UnauthorizedAccessException("Mật khẩu hiện tại không đúng.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Lấy danh sách tất cả users (admin)
    /// </summary>
    public async Task<IEnumerable<UserListDto>> GetAllUsersAsync()
    {
        return await _context.Users
            .Include(u => u.Role)
            .Select(u => new UserListDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                Phone = u.Phone,
                Status = u.Status,
                RoleName = u.Role != null ? u.Role.Name : null
            })
            .ToListAsync();
    }

    /// <summary>
    /// Đổi role cho user (admin)
    /// </summary>
    public async Task<bool> ChangeRoleAsync(ChangeRoleDto dto)
    {
        var user = await _context.Users.FindAsync(dto.UserId);
        if (user == null)
            throw new ArgumentException($"Không tìm thấy user với ID = {dto.UserId}");

        var roleExists = await _context.Roles.AnyAsync(r => r.Id == dto.NewRoleId);
        if (!roleExists)
            throw new ArgumentException($"Không tìm thấy role với ID = {dto.NewRoleId}");

        user.RoleId = dto.NewRoleId;
        await _context.SaveChangesAsync();
        return true;
    }
}
