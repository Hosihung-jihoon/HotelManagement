using HotelManagement.API.DTOs;

namespace HotelManagement.API.Services;

/// <summary>
/// Interface User Service - Profile, change password, quản lý user (admin).
/// </summary>
public interface IUserService
{
    Task<UserProfileDto?> GetProfileAsync(int userId);
    Task<bool> UpdateProfileAsync(int userId, UpdateProfileDto dto);
    Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto dto);
    Task<IEnumerable<UserListDto>> GetAllUsersAsync();
    Task<bool> ChangeRoleAsync(ChangeRoleDto dto);
}
