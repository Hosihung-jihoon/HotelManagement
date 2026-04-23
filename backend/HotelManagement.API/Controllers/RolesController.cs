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

    /// <summary>Lấy danh sách tất cả roles</summary>
    [HttpGet]
    [PermissionAuthorize("manage_roles", "view_roles", "edit_roles")]
    public async Task<ActionResult<IEnumerable<RoleDto>>> GetAll()
    {
        var result = await _roleService.GetAllRolesAsync();
        return Ok(result);
    }

    /// <summary>Lấy role kèm danh sách permissions</summary>
    [HttpGet("{id}/permissions")]
    [PermissionAuthorize("manage_roles", "view_roles", "edit_roles")]
    public async Task<ActionResult<RoleWithPermissionsDto>> GetRoleWithPermissions(int id)
    {
        var result = await _roleService.GetRoleWithPermissionsAsync(id);
        if (result == null)
            return NotFound(new { message = $"Không tìm thấy role với ID = {id}" });
        return Ok(result);
    }

    /// <summary>Lấy tất cả permissions (để hiển thị khi gán)</summary>
    [HttpGet("all-permissions")]
    [PermissionAuthorize("manage_roles", "view_roles", "edit_roles")]
    public async Task<ActionResult<IEnumerable<PermissionDto>>> GetAllPermissions()
    {
        var result = await _roleService.GetAllPermissionsAsync();
        return Ok(result);
    }

    /// <summary>Tạo role mới</summary>
    [HttpPost]
    [PermissionAuthorize("manage_roles")]
    public async Task<ActionResult<RoleDto>> Create([FromBody] CreateRoleDto dto)
    {
        try
        {
            var result = await _roleService.CreateRoleAsync(dto);
            return CreatedAtAction(nameof(GetRoleWithPermissions), new { id = result.Id }, result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Cập nhật role</summary>
    [HttpPut("{id}")]
    [PermissionAuthorize("manage_roles")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateRoleDto dto)
    {
        try
        {
            var success = await _roleService.UpdateRoleAsync(id, dto);
            if (!success)
                return NotFound(new { message = $"Không tìm thấy role với ID = {id}" });
            return Ok(new { message = "Cập nhật vai trò thành công." });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Xóa role</summary>
    [HttpDelete("{id}")]
    [PermissionAuthorize("manage_roles")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var success = await _roleService.DeleteRoleAsync(id);
            if (!success)
                return NotFound(new { message = $"Không tìm thấy role với ID = {id}" });
            return Ok(new { message = "Đã xóa vai trò." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Gán permissions cho role (replace all)</summary>
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

    /// <summary>Lấy danh sách permissions của user hiện tại</summary>
    [HttpGet("my-permissions")]
    public async Task<ActionResult<IEnumerable<PermissionDto>>> GetMyPermissions()
    {
        var userIdClaim = User.FindFirst("userId")?.Value;
        var userId = int.Parse(userIdClaim!);

        var result = await _roleService.GetMyPermissionsAsync(userId);
        return Ok(result);
    }
}
