using HotelManagement.API.DTOs;
using HotelManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

/// <summary>
/// UserProfile Controller - Profile cá nhân (cần JWT)
/// </summary>
[ApiController]
[Route("api/user-profile")]
[Authorize]
public class UserProfileController : ControllerBase
{
    private readonly IUserService _userService;

    public UserProfileController(IUserService userService)
    {
        _userService = userService;
    }

    /// <summary>
    /// Lấy profile user hiện tại
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<UserProfileDto>> GetProfile()
    {
        var userId = GetCurrentUserId();
        var result = await _userService.GetProfileAsync(userId);

        if (result == null)
            return NotFound(new { message = "Không tìm thấy user." });

        return Ok(result);
    }

    /// <summary>
    /// Cập nhật profile (tên, sdt)
    /// </summary>
    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var userId = GetCurrentUserId();
        var success = await _userService.UpdateProfileAsync(userId, dto);

        if (!success)
            return NotFound(new { message = "Không tìm thấy user." });

        return Ok(new { message = "Cập nhật profile thành công." });
    }

    /// <summary>
    /// Đổi mật khẩu
    /// </summary>
    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var success = await _userService.ChangePasswordAsync(userId, dto);

            if (!success)
                return NotFound(new { message = "Không tìm thấy user." });

            return Ok(new { message = "Đổi mật khẩu thành công." });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ===== Helper =====
    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst("userId")?.Value;
        return int.Parse(userIdClaim!);
    }
}
