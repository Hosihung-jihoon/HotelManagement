using HotelManagement.API.DTOs;
using HotelManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HotelManagement.API.Controllers;

/// <summary>
/// Nhật ký hoạt động hệ thống.
/// Admin: xem tất cả log. Các role khác: chỉ xem log của chính mình.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AuditLogsController : ControllerBase
{
    private readonly IAuditLogService _service;

    public AuditLogsController(IAuditLogService service)
    {
        _service = service;
    }

    /// <summary>
    /// GET /api/AuditLogs?action=CREATE&amp;tableName=Rooms
    /// Admin thấy tất cả, user thường chỉ thấy log của mình.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AuditLogDto>>> GetAll(
        [FromQuery] string? action = null,
        [FromQuery] string? tableName = null,
        [FromQuery] int? userId = null)
    {
        var currentUserId = GetCurrentUserId();
        var roleName = User.FindFirst(ClaimTypes.Role)?.Value ?? "";
        var isAdmin = roleName.Equals("Admin", StringComparison.OrdinalIgnoreCase);

        if (isAdmin)
        {
            // Admin: filter by specific userId nếu có, hoặc lấy tất cả
            if (userId.HasValue)
            {
                var filtered = await _service.GetByUserIdAsync(userId.Value, action, tableName);
                return Ok(filtered);
            }
            var all = await _service.GetAllAsync(action, tableName);
            return Ok(all);
        }
        else
        {
            // Non-admin: chỉ thấy log của mình
            var own = await _service.GetByUserIdAsync(currentUserId, action, tableName);
            return Ok(own);
        }
    }

    // ===== Helper =====
    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst("userId")?.Value;
        return int.TryParse(userIdClaim, out var id) ? id : 0;
    }
}
