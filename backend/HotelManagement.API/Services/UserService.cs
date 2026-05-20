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

    public async Task<UserMembershipDto?> GetMembershipAsync(int userId)
    {
        var user = await _context.Users
            .Include(u => u.Membership)
            .Include(u => u.Bookings)
                .ThenInclude(b => b.Invoice)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return null;

        var totalSpent = user.Bookings
            .Where(b => b.Invoice != null && b.Invoice.Status == "Paid")
            .Sum(b => b.Invoice!.FinalTotal ?? 0m);

        var totalPoints = (int)Math.Floor(totalSpent / 10000m);

        var memberships = await _context.Memberships
            .IgnoreQueryFilters()
            .Where(m => !m.IsDeleted)
            .OrderBy(m => m.DisplayOrder)
            .ThenBy(m => m.MinPoints)
            .ToListAsync();

        var nextTier = memberships.FirstOrDefault(m => m.MinPoints.HasValue && m.MinPoints.Value > totalPoints);

        return new UserMembershipDto
        {
            MembershipId = user.MembershipId,
            Tier = user.Membership?.TierName ?? "Dong",
            TotalSpent = totalSpent,
            TotalPoints = totalPoints,
            NextTierName = nextTier?.TierName,
            RemainingPoints = nextTier?.MinPoints != null
                ? Math.Max(nextTier.MinPoints.Value - totalPoints, 0)
                : null
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
            .OrderBy(m => m.DisplayOrder)
            .ThenBy(m => m.MinPoints)
            .ToListAsync();

        var userDtos = new List<UserListDto>();

        foreach (var u in users)
        {
            var totalSpent = u.Bookings
                .Where(b => b.Invoice != null && b.Invoice.Status == "Paid")
                .Sum(b => b.Invoice!.FinalTotal ?? 0);

            var totalPoints = (int)Math.Floor(totalSpent / 10000m);
            var nextTier = memberships.FirstOrDefault(m => m.MinPoints.HasValue && m.MinPoints.Value > totalPoints);
            int? remainingToNextTier = null;
            string? nextTierName = null;
            if (nextTier != null && nextTier.MinPoints.HasValue)
            {
                remainingToNextTier = Math.Max(nextTier.MinPoints.Value - totalPoints, 0);
                nextTierName = nextTier.TierName;
            }

            userDtos.Add(new UserListDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                Phone = u.Phone,
                Status = u.Status,
                RoleId = u.RoleId,
                RoleName = u.Role != null ? u.Role.Name : null,
                MembershipName = u.Membership != null ? u.Membership.TierName : null,
                TotalSpent = totalSpent,
                TotalPoints = totalPoints,
                RemainingToNextTier = remainingToNextTier,
                NextTierName = nextTierName
            });
        }

        return userDtos;
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

    /// <summary>
    /// Thống kê phân bổ Membership
    /// </summary>
    public async Task<IEnumerable<MembershipStatDto>> GetMembershipStatsAsync()
    {
        var guestRoleIds = await _context.Roles
            .Where(r => r.Name.ToLower() == "guest" || r.Name.ToLower() == "customer")
            .Select(r => r.Id)
            .ToListAsync();

        return await _context.Users
            .Where(u =>
                u.MembershipId != null &&
                (
                    !u.RoleId.HasValue ||
                    guestRoleIds.Contains(u.RoleId.Value)
                ))
            .GroupBy(u => new { u.MembershipId, u.Membership.TierName })
            .Select(g => new MembershipStatDto
            {
                MembershipId = g.Key.MembershipId ?? 0,
                TierName = g.Key.TierName ?? "Unknown",
                MemberCount = g.Count()
            })
            .ToListAsync();
    }
}
