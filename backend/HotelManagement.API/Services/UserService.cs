using HotelManagement.API.Data;
using HotelManagement.API.DTOs;
using HotelManagement.API.Models;
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

    // ========== Profile ==========

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

    public async Task<bool> UpdateProfileAsync(int userId, UpdateProfileDto dto)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;

        user.FullName = dto.FullName;
        user.Phone = dto.Phone;

        await _context.SaveChangesAsync();
        return true;
    }

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

    // ========== Admin - Quản lý nhân viên ==========

    /// <summary>
    /// Lấy danh sách tất cả users (admin), kèm theo tổng chi tiêu để xác định hạng VIP.
    /// </summary>
    public async Task<IEnumerable<UserListDto>> GetAllUsersAsync()
    {
        var users = await _context.Users
            .Include(u => u.Role)
            .Include(u => u.Membership)
            .Include(u => u.Bookings)
                .ThenInclude(b => b.Invoice)
            .ToListAsync();

        var memberships = await _context.Memberships
            .IgnoreQueryFilters()
            .Where(m => !m.IsDeleted)
            .OrderBy(m => m.MinPoints)
            .ToListAsync();

        var userDtos = new List<UserListDto>();

        foreach (var u in users)
        {
            var totalSpent = u.Bookings
                .Where(b => b.Invoice != null && b.Invoice.Status == "Paid")
                .Sum(b => b.Invoice.FinalTotal ?? 0);

            // MinPoints stores VND threshold as int; cast to decimal for comparison
            var nextTier = memberships.FirstOrDefault(m => m.MinPoints.HasValue && (decimal)m.MinPoints.Value > totalSpent);
            decimal? remainingToNextTier = null;
            string? nextTierName = null;
            if (nextTier != null && nextTier.MinPoints.HasValue)
            {
                remainingToNextTier = (decimal)nextTier.MinPoints.Value - totalSpent;
                nextTierName = nextTier.TierName;
            }

            userDtos.Add(new UserListDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                Phone = u.Phone,
                Status = u.Status,
                RoleName = u.Role != null ? u.Role.Name : null,
                MembershipName = u.Membership != null ? u.Membership.TierName : null,
                TotalSpent = totalSpent,
                RemainingToNextTier = remainingToNextTier,
                NextTierName = nextTierName
            });
        }

        return userDtos;
    }

    public async Task<UserListDto?> GetUserByIdAsync(int userId)
    {
        var u = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (u == null) return null;

        return new UserListDto
        {
            Id = u.Id,
            FullName = u.FullName,
            Email = u.Email,
            Phone = u.Phone,
            Status = u.Status,
            RoleId = u.RoleId,
            RoleName = u.Role?.Name
        };
    }

    public async Task<UserListDto> CreateUserAsync(CreateUserDto dto)
    {
        // Kiểm tra email trùng
        var emailExists = await _context.Users.AnyAsync(u => u.Email == dto.Email);
        if (emailExists)
            throw new ArgumentException($"Email '{dto.Email}' đã được sử dụng.");

        // Kiểm tra role hợp lệ
        if (dto.RoleId.HasValue)
        {
            var roleExists = await _context.Roles.AnyAsync(r => r.Id == dto.RoleId);
            if (!roleExists)
                throw new ArgumentException($"Không tìm thấy role với ID = {dto.RoleId}");
        }

        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            Phone = dto.Phone,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            RoleId = dto.RoleId,
            Status = true
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Reload với role
        await _context.Entry(user).Reference(u => u.Role).LoadAsync();

        return new UserListDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Phone = user.Phone,
            Status = user.Status,
            RoleId = user.RoleId,
            RoleName = user.Role?.Name
        };
    }

    public async Task<bool> UpdateUserAsync(int userId, UpdateUserDto dto)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;

        if (dto.RoleId.HasValue)
        {
            var roleExists = await _context.Roles.AnyAsync(r => r.Id == dto.RoleId);
            if (!roleExists)
                throw new ArgumentException($"Không tìm thấy role với ID = {dto.RoleId}");
        }

        user.FullName = dto.FullName;
        user.Phone = dto.Phone;
        user.RoleId = dto.RoleId;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ToggleStatusAsync(int userId, bool status)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;

        user.Status = status;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteUserAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return true;
    }

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

    /// <summary>
    /// Thống kê phân bổ Membership
    /// </summary>
    public async Task<IEnumerable<MembershipStatDto>> GetMembershipStatsAsync()
    {
        return await _context.Users
            .Where(u => u.MembershipId != null && u.Membership != null)
            .GroupBy(u => new { u.MembershipId, u.Membership!.TierName })
            .Select(g => new MembershipStatDto
            {
                MembershipId = g.Key.MembershipId!.Value,
                TierName = g.Key.TierName,
                MemberCount = g.Count()
            })
            .ToListAsync();
    }
}
