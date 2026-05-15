using System.Security.Claims;
using HotelManagement.API.DTOs;
using HotelManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

/// <summary>
/// Controller theo chuẩn giảng viên.
/// Route: /api/dashboard-periods
/// </summary>
[Route("api/dashboard-periods")]
[ApiController]
[Authorize]
public class DashboardPeriodsController : ControllerBase
{
    private readonly IRoleDashboardPeriodService _dashboardService;

    public DashboardPeriodsController(IRoleDashboardPeriodService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    /// <summary>Lấy dashboard kỳ hiện tại của role (tự detect từ JWT hoặc query param).</summary>
    [HttpGet("current")]
    public async Task<IActionResult> GetCurrentDashboard(
        [FromQuery] string? roleName,
        [FromQuery] string periodType = "MONTHLY",
        CancellationToken cancellationToken = default)
    {
        var resolvedRoleName = ResolveRoleName(roleName);
        var dashboard = await _dashboardService.GetDashboardAsync(
            resolvedRoleName, periodType, periodKey: null,
            currentOnly: true, cancellationToken);

        return dashboard == null
            ? NotFound(new { message = "Không tìm thấy dashboard hiện tại. Hãy gọi /rebuild-current trước." })
            : Ok(dashboard);
    }

    /// <summary>Lấy dashboard theo kỳ cụ thể.</summary>
    [HttpGet("{roleName}/{periodType}/{periodKey}")]
    public async Task<IActionResult> GetDashboardByPeriod(
        string roleName, string periodType, string periodKey,
        CancellationToken cancellationToken = default)
    {
        var dashboard = await _dashboardService.GetDashboardAsync(
            roleName, periodType, periodKey,
            currentOnly: false, cancellationToken);

        return dashboard == null
            ? NotFound(new { message = "Không tìm thấy dashboard theo kỳ này." })
            : Ok(dashboard);
    }

    /// <summary>Lấy lịch sử các kỳ của role.</summary>
    [HttpGet("{roleName}/{periodType}/history")]
    public async Task<IActionResult> GetHistory(
        string roleName, string periodType,
        [FromQuery] int take = 12,
        CancellationToken cancellationToken = default)
    {
        var items = await _dashboardService.GetHistoryAsync(roleName, periodType, take, cancellationToken);
        return Ok(items);
    }

    /// <summary>Rebuild dashboard cho một role + kỳ cụ thể (Admin).</summary>
    [HttpPost("rebuild")]
    public async Task<IActionResult> RebuildDashboard(
        [FromBody] DashboardRebuildRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var occurredAt = request.OccurredAtUtc ?? DateTime.UtcNow;
        await _dashboardService.RebuildDashboardAsync(
            request.RoleName, request.PeriodType, occurredAt,
            ResolveUserId(), "MANUAL_REBUILD", null, cancellationToken);

        return Ok(new { message = "Đã rebuild dashboard theo kỳ." });
    }

    /// <summary>Rebuild toàn bộ dashboard kỳ hiện tại (Admin).</summary>
    [HttpPost("rebuild-current")]
    public async Task<IActionResult> RebuildAllCurrent(CancellationToken cancellationToken = default)
    {
        await _dashboardService.RebuildAllCurrentDashboardsAsync(ResolveUserId(), cancellationToken);
        return Ok(new { message = "Đã rebuild toàn bộ dashboard hiện tại." });
    }

    /// <summary>Rebuild các dashboard bị ảnh hưởng bởi một event nghiệp vụ.</summary>
    [HttpPost("events/rebuild-affected")]
    public async Task<IActionResult> RebuildAffectedByEvent(
        [FromBody] DashboardEventRequestDto request,
        CancellationToken cancellationToken = default)
    {
        await _dashboardService.RebuildAffectedDashboardsAsync(
            request.EventType, request.OccurredAtUtc ?? DateTime.UtcNow,
            ResolveUserId(), request.RefId, cancellationToken);

        return Ok(new { message = "Đã cập nhật các dashboard bị ảnh hưởng bởi sự kiện." });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private string ResolveRoleName(string? requestedRoleName)
    {
        if (!string.IsNullOrWhiteSpace(requestedRoleName)) return requestedRoleName.Trim();
        return User.FindFirst(ClaimTypes.Role)?.Value ?? "Admin";
    }

    private int? ResolveUserId()
    {
        var raw = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(raw, out var userId) ? userId : null;
    }
}
