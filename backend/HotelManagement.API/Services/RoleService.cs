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

    // ========== Query ==========

    public async Task<IEnumerable<RoleDto>> GetAllRolesAsync()
    {
        return await _context.Roles
            .OrderBy(r => r.Id)
            .Select(r => new RoleDto
            {
                Id = r.Id,
                Name = r.Name,
                Description = r.Description
            })
            .ToListAsync();
    }

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

    public async Task<IEnumerable<PermissionDto>> GetAllPermissionsAsync()
    {
        return await _context.Permissions
            .OrderBy(p => p.Name)
            .Select(p => new PermissionDto
            {
                Id = p.Id,
                Name = p.Name
            })
            .ToListAsync();
    }

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

    // ========== CRUD Roles ==========

    public async Task<RoleDto> CreateRoleAsync(CreateRoleDto dto)
    {
        var nameExists = await _context.Roles.AnyAsync(r => r.Name == dto.Name);
        if (nameExists)
            throw new ArgumentException($"Tên vai trò '{dto.Name}' đã tồn tại.");

        var role = new Role
        {
            Name = dto.Name,
            Description = dto.Description
        };

        _context.Roles.Add(role);
        await _context.SaveChangesAsync();

        return new RoleDto { Id = role.Id, Name = role.Name, Description = role.Description };
    }

    public async Task<bool> UpdateRoleAsync(int roleId, UpdateRoleDto dto)
    {
        var role = await _context.Roles.FindAsync(roleId);
        if (role == null) return false;

        var nameExists = await _context.Roles.AnyAsync(r => r.Name == dto.Name && r.Id != roleId);
        if (nameExists)
            throw new ArgumentException($"Tên vai trò '{dto.Name}' đã tồn tại.");

        role.Name = dto.Name;
        role.Description = dto.Description;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteRoleAsync(int roleId)
    {
        var role = await _context.Roles.FindAsync(roleId);
        if (role == null) return false;

        // Kiểm tra có user nào đang dùng role này không
        var hasUsers = await _context.Users.AnyAsync(u => u.RoleId == roleId);
        if (hasUsers)
            throw new InvalidOperationException("Không thể xóa vai trò đang được gán cho nhân viên. Hãy đổi role cho nhân viên trước.");

        // Xóa permissions liên kết trước
        var rolePermissions = await _context.RolePermissions.Where(rp => rp.RoleId == roleId).ToListAsync();
        _context.RolePermissions.RemoveRange(rolePermissions);

        _context.Roles.Remove(role);
        await _context.SaveChangesAsync();
        return true;
    }

    // ========== Permissions ==========

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
}
