using HotelManagement.API.DTOs;
using HotelManagement.API.Middleware;
using HotelManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

/// <summary>
/// Roles Controller - Quản lý roles, permissions
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RolesController : ControllerBase
{
    private readonly IRoleService _roleService;

    public RolesController(IRoleService roleService)
    {
        _roleService = roleService;
    }

    /// <summary>
    /// Lấy danh sách tất cả roles
    /// </summary>
    [HttpGet]
    [PermissionAuthorize("manage_roles")]
    public async Task<ActionResult<IEnumerable<RoleDto>>> GetAll()
    {
        var result = await _roleService.GetAllRolesAsync();
        return Ok(result);
    }

    /// <summary>
    /// Lấy role kèm danh sách permissions
    /// </summary>
    [HttpGet("{id}/permissions")]
    [PermissionAuthorize("manage_roles")]
    public async Task<ActionResult<RoleWithPermissionsDto>> GetRoleWithPermissions(int id)
    {
        var result = await _roleService.GetRoleWithPermissionsAsync(id);
        if (result == null)
            return NotFound(new { message = $"Không tìm thấy role với ID = {id}" });

        return Ok(result);
    }

    /// <summary>
    /// Lấy tất cả permissions (để hiển thị khi gán)
    /// </summary>
    [HttpGet("all-permissions")]
    [PermissionAuthorize("manage_roles")]
    public async Task<ActionResult<IEnumerable<PermissionDto>>> GetAllPermissions()
    {
        var result = await _roleService.GetAllPermissionsAsync();
        return Ok(result);
    }

    /// <summary>
    /// Gán permissions cho role
    /// </summary>
    [HttpPost("assign-permission")]
    [PermissionAuthorize("manage_roles")]
    public async Task<IActionResult> AssignPermission([FromBody] AssignPermissionDto dto)
    {
        try
        {
            await _roleService.AssignPermissionsAsync(dto);
            return Ok(new { message = "Gán permissions thành công." });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Lấy danh sách permissions của user hiện tại
    /// </summary>
    [HttpGet("my-permissions")]
    public async Task<ActionResult<IEnumerable<PermissionDto>>> GetMyPermissions()
    {
        var userIdClaim = User.FindFirst("userId")?.Value;
        var userId = int.Parse(userIdClaim!);

        var result = await _roleService.GetMyPermissionsAsync(userId);
        return Ok(result);
    }
}
