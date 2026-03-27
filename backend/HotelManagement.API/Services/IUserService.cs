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

    // Admin - Quản lý nhân viên
    Task<IEnumerable<UserListDto>> GetAllUsersAsync();
    Task<UserListDto?> GetUserByIdAsync(int userId);
    Task<UserListDto> CreateUserAsync(CreateUserDto dto);
    Task<bool> UpdateUserAsync(int userId, UpdateUserDto dto);
    Task<bool> ToggleStatusAsync(int userId, bool status);
    Task<bool> DeleteUserAsync(int userId);
    Task<bool> ChangeRoleAsync(ChangeRoleDto dto);
}
