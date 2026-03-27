using HotelManagement.API.DTOs;

namespace HotelManagement.API.Services;

/// <summary>
/// Interface Role Service - Quản lý roles, permissions.
/// </summary>
public interface IRoleService
{
    Task<IEnumerable<RoleDto>> GetAllRolesAsync();
    Task<RoleWithPermissionsDto?> GetRoleWithPermissionsAsync(int roleId);
    Task<RoleDto> CreateRoleAsync(CreateRoleDto dto);
    Task<bool> UpdateRoleAsync(int roleId, UpdateRoleDto dto);
    Task<bool> DeleteRoleAsync(int roleId);
    Task<bool> AssignPermissionsAsync(AssignPermissionDto dto);
    Task<IEnumerable<PermissionDto>> GetMyPermissionsAsync(int userId);
    Task<IEnumerable<PermissionDto>> GetAllPermissionsAsync();
}
