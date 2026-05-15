using HotelManagement.API.DTOs;
using HotelManagement.API.Helpers;
using HotelManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HotelManagement.API.Controllers;

/// <summary>
/// Dashboard Controller:
///   GET  /api/Dashboard/stats     — Legacy: trực tiếp từ DB (giữ lại tương thích)
///   GET  /api/Dashboard/snapshot  — Mới: đọc từ Snapshot table theo role + kỳ
///   POST /api/Dashboard/rebuild   — Rebuild snapshot thủ công (Admin only)
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _service;
    private readonly DashboardSnapshotService _snapshotService;

    // Map role name → dashboard_code
    private static readonly Dictionary<string, string> RoleToDashboardCode = new(StringComparer.OrdinalIgnoreCase)
    {
        ["Admin"]       = "ADMIN_MAIN",
        ["Manager"]     = "ADMIN_MAIN",
        ["Receptionist"]= "RECEPTIONIST_MAIN",
        ["Staff"]       = "RECEPTIONIST_MAIN",
        ["Housekeeping"]= "HOUSEKEEPING_MAIN",
    };

    public DashboardController(IDashboardService service, DashboardSnapshotService snapshotService)
    {
        _service         = service;
        _snapshotService = snapshotService;
    }

    /// <summary>Legacy: trực tiếp từ DB</summary>
    [HttpGet("stats")]
    public async Task<ActionResult<DashboardStatsDto>> GetStats([FromQuery] int? month, [FromQuery] int? year)
    {
        var result = await _service.GetStatsAsync(month, year);
        return Ok(result);
    }

    /// <summary>
    /// Mới: Đọc Snapshot theo role hiện tại + kỳ.
    /// Nếu chưa có snapshot sẽ tự động Rebuild rồi trả về.
    /// </summary>
    [HttpGet("snapshot")]
    public async Task<ActionResult<DashboardSnapshotResultDto>> GetSnapshot(
        [FromQuery] string periodType = "Monthly",
        [FromQuery] string? periodKey = null)
    {
        // Lấy role từ JWT
        var roleName = User.FindFirstValue(ClaimTypes.Role)
                    ?? User.FindFirstValue("role")
                    ?? "Admin";
        var roleIdStr = User.FindFirstValue("roleId") ?? "1";
        int.TryParse(roleIdStr, out int roleId);

        var dashCode = RoleToDashboardCode.GetValueOrDefault(roleName, "ADMIN_MAIN");
        var key      = periodKey ?? PeriodHelper.Resolve(DateTime.UtcNow, periodType).PeriodKey;

        var result = await _snapshotService.GetOrRebuildAsync(roleId, dashCode, periodType, key);
        if (result == null) return NotFound(new { message = "Không thể tạo snapshot." });
        return Ok(result);
    }

    /// <summary>Rebuild snapshot thủ công (Admin only).</summary>
    [HttpPost("rebuild")]
    public async Task<IActionResult> RebuildSnapshot(
        [FromQuery] string periodType = "Monthly",
        [FromQuery] string? periodKey = null)
    {
        var roleName = User.FindFirstValue(ClaimTypes.Role)
                    ?? User.FindFirstValue("role")
                    ?? "Admin";
        var roleIdStr = User.FindFirstValue("roleId") ?? "1";
        int.TryParse(roleIdStr, out int roleId);

        var dashCode = RoleToDashboardCode.GetValueOrDefault(roleName, "ADMIN_MAIN");
        var key      = periodKey ?? PeriodHelper.Resolve(DateTime.UtcNow, periodType).PeriodKey;

        await _snapshotService.RebuildAsync(roleId, dashCode, periodType, key);
        return Ok(new { message = "Rebuild thành công.", periodKey = key });
    }
}
