using HotelManagement.API.Data;
using HotelManagement.API.DTOs;
using HotelManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Services;

/// <summary>
/// Role Service - Quản lý roles, gán permissions, lấy permissions user.
/// </summary>
public class RoleService : IRoleService
{
    private readonly HotelDbContext _context;

    public RoleService(HotelDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lấy danh sách tất cả roles
    /// </summary>
    public async Task<IEnumerable<RoleDto>> GetAllRolesAsync()
    {
        return await _context.Roles
            .Select(r => new RoleDto
            {
                Id = r.Id,
                Name = r.Name,
                Description = r.Description
            })
            .ToListAsync();
    }

    /// <summary>
    /// Lấy role kèm danh sách permissions
    /// </summary>
    public async Task<RoleWithPermissionsDto?> GetRoleWithPermissionsAsync(int roleId)
    {
        var role = await _context.Roles
            .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(r => r.Id == roleId);

        if (role == null) return null;

        return new RoleWithPermissionsDto
        {
            Id = role.Id,
            Name = role.Name,
            Description = role.Description,
            Permissions = role.RolePermissions.Select(rp => new PermissionDto
            {
                Id = rp.Permission.Id,
                Name = rp.Permission.Name
            }).ToList()
        };
    }

    /// <summary>
    /// Gán permissions cho role - xóa cũ, thêm mới
    /// </summary>
    public async Task<bool> AssignPermissionsAsync(AssignPermissionDto dto)
    {
        var role = await _context.Roles.FindAsync(dto.RoleId);
        if (role == null)
            throw new ArgumentException($"Không tìm thấy role với ID = {dto.RoleId}");

        // Xóa tất cả permissions cũ
        var existingPermissions = await _context.RolePermissions
            .Where(rp => rp.RoleId == dto.RoleId)
            .ToListAsync();
        _context.RolePermissions.RemoveRange(existingPermissions);

        // Thêm permissions mới
        foreach (var permissionId in dto.PermissionIds)
        {
            var permissionExists = await _context.Permissions.AnyAsync(p => p.Id == permissionId);
            if (!permissionExists)
                throw new ArgumentException($"Không tìm thấy permission với ID = {permissionId}");

            _context.RolePermissions.Add(new RolePermission
            {
                RoleId = dto.RoleId,
                PermissionId = permissionId
            });
        }

        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Lấy danh sách permissions của user hiện tại (qua role)
    /// </summary>
    public async Task<IEnumerable<PermissionDto>> GetMyPermissionsAsync(int userId)
    {
        var user = await _context.Users
            .Include(u => u.Role)
                .ThenInclude(r => r!.RolePermissions)
                    .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user?.Role == null)
            return Enumerable.Empty<PermissionDto>();

        return user.Role.RolePermissions.Select(rp => new PermissionDto
        {
            Id = rp.Permission.Id,
            Name = rp.Permission.Name
        });
    }

    /// <summary>
    /// Lấy tất cả permissions (để hiển thị khi gán cho role)
    /// </summary>
    public async Task<IEnumerable<PermissionDto>> GetAllPermissionsAsync()
    {
        return await _context.Permissions
            .Select(p => new PermissionDto
            {
                Id = p.Id,
                Name = p.Name
            })
            .ToListAsync();
    }
}
