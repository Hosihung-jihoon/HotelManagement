using HotelManagement.API.DTOs;
using HotelManagement.API.Middleware;
using HotelManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

/// <summary>
/// UserManagement Controller - Quản lý users (admin, cần permission manage_users)
/// </summary>
[ApiController]
[Route("api/user-management")]
[Authorize]
public class UserManagementController : ControllerBase
{
    private readonly IUserService _userService;

    public UserManagementController(IUserService userService)
    {
        _userService = userService;
    }

    /// <summary>
    /// Lấy danh sách tất cả users
    /// </summary>
    [HttpGet]
    [PermissionAuthorize("manage_users")]
    public async Task<ActionResult<IEnumerable<UserListDto>>> GetAll()
    {
        var result = await _userService.GetAllUsersAsync();
        return Ok(result);
    }

    /// <summary>
    /// Đổi role cho user
    /// </summary>
    [HttpPut("change-role")]
    [PermissionAuthorize("manage_users")]
    public async Task<IActionResult> ChangeRole([FromBody] ChangeRoleDto dto)
    {
        try
        {
            await _userService.ChangeRoleAsync(dto);
            return Ok(new { message = "Đổi role thành công." });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
