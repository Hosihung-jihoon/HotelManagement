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

    /// <summary>Lấy danh sách tất cả users</summary>
    [HttpGet]
    [PermissionAuthorize("manage_users")]
    public async Task<ActionResult<IEnumerable<UserListDto>>> GetAll()
    {
        var result = await _userService.GetAllUsersAsync();
        return Ok(result);
    }

    /// <summary>Lấy chi tiết một user theo ID</summary>
    [HttpGet("{id}")]
    [PermissionAuthorize("manage_users")]
    public async Task<ActionResult<UserListDto>> GetById(int id)
    {
        var result = await _userService.GetUserByIdAsync(id);
        if (result == null)
            return NotFound(new { message = $"Không tìm thấy user với ID = {id}" });
        return Ok(result);
    }

    /// <summary>Tạo user mới</summary>
    [HttpPost]
    [PermissionAuthorize("manage_users")]
    public async Task<ActionResult<UserListDto>> Create([FromBody] CreateUserDto dto)
    {
        try
        {
            var result = await _userService.CreateUserAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Cập nhật thông tin user</summary>
    [HttpPut("{id}")]
    [PermissionAuthorize("manage_users")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateUserDto dto)
    {
        try
        {
            var success = await _userService.UpdateUserAsync(id, dto);
            if (!success)
                return NotFound(new { message = $"Không tìm thấy user với ID = {id}" });
            return Ok(new { message = "Cập nhật thành công." });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Kích hoạt / vô hiệu hóa user</summary>
    [HttpPut("{id}/toggle-status")]
    [PermissionAuthorize("manage_users")]
    public async Task<IActionResult> ToggleStatus(int id, [FromBody] UpdateUserStatusDto dto)
    {
        var success = await _userService.ToggleStatusAsync(id, dto.Status);
        if (!success)
            return NotFound(new { message = $"Không tìm thấy user với ID = {id}" });

        var statusText = dto.Status ? "kích hoạt" : "vô hiệu hóa";
        return Ok(new { message = $"Đã {statusText} tài khoản." });
    }

    /// <summary>Xóa user</summary>
    [HttpDelete("{id}")]
    [PermissionAuthorize("manage_users")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _userService.DeleteUserAsync(id);
        if (!success)
            return NotFound(new { message = $"Không tìm thấy user với ID = {id}" });
        return Ok(new { message = "Đã xóa người dùng." });
    }

    /// <summary>Đổi role cho user</summary>
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

    /// <summary>
    /// Thống kê phân bổ hạng thành viên
    /// </summary>
    [HttpGet("membership-stats")]
    [PermissionAuthorize("manage_users")]
    public async Task<ActionResult<IEnumerable<MembershipStatDto>>> GetMembershipStats()
    {
        var result = await _userService.GetMembershipStatsAsync();
        return Ok(result);
    }
}
