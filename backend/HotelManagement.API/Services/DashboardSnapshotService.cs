using HotelManagement.API.Data;
using HotelManagement.API.DTOs;
using HotelManagement.API.Helpers;
using HotelManagement.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace HotelManagement.API.Services;

/// <summary>
/// DashboardSnapshotService — đọc / ghi bảng Role_Dashboard_Period_States.
/// Tách biệt hoàn toàn với DashboardService (truy vấn trực tiếp).
/// </summary>
public class DashboardSnapshotService
{
    private readonly HotelDbContext _context;
    private readonly ILogger<DashboardSnapshotService> _logger;

    private static readonly JsonSerializerOptions _jsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };

    public DashboardSnapshotService(HotelDbContext context, ILogger<DashboardSnapshotService> logger)
    {
        _context = context;
        _logger  = logger;
    }

    // ── Read ──────────────────────────────────────────────────────────────────

    /// <summary>
    /// Đọc snapshot cho role + kỳ cụ thể.
    /// Nếu chưa có, tự động Rebuild rồi trả về.
    /// </summary>
    public async Task<DashboardSnapshotResultDto?> GetOrRebuildAsync(
        int roleId, string dashboardCode, string periodType, string periodKey)
    {
        var snapshot = await _context.Set<RoleDashboardPeriodState>()
            .AsNoTracking()
            .FirstOrDefaultAsync(s =>
                s.RoleId        == roleId &&
                s.DashboardCode == dashboardCode &&
                s.PeriodType    == periodType &&
                s.PeriodKey     == periodKey);

        if (snapshot == null)
        {
            // Chưa có → tự rebuild
            _logger.LogInformation("Snapshot missing for role={RoleId} code={Code} {Type}/{Key}. Rebuilding...",
                roleId, dashboardCode, periodType, periodKey);
            await RebuildAsync(roleId, dashboardCode, periodType, periodKey);
            snapshot = await _context.Set<RoleDashboardPeriodState>()
                .AsNoTracking()
                .FirstOrDefaultAsync(s =>
                    s.RoleId        == roleId &&
                    s.DashboardCode == dashboardCode &&
                    s.PeriodType    == periodType &&
                    s.PeriodKey     == periodKey);
        }

        if (snapshot == null) return null;

        return new DashboardSnapshotResultDto
        {
            RoleId         = snapshot.RoleId,
            DashboardCode  = snapshot.DashboardCode,
            PeriodType     = snapshot.PeriodType,
            PeriodKey      = snapshot.PeriodKey,
            PeriodStart    = snapshot.PeriodStart,
            PeriodEnd      = snapshot.PeriodEnd,
            Status         = snapshot.Status,
            DashboardJson  = snapshot.DashboardJson,
            ComparisonJson = snapshot.ComparisonJson,
            UpdatedAt      = snapshot.UpdatedAt,
            Version        = snapshot.Version
        };
    }

    // ── Rebuild ───────────────────────────────────────────────────────────────

    public async Task RebuildAsync(int roleId, string dashboardCode, string periodType, string periodKey)
    {
        // Xác định kỳ (period boundaries)
        if (!DateOnly.TryParseExact(periodKey + "-01", "yyyy-MM-dd", out var firstDay))
        {
            firstDay = DateOnly.FromDateTime(DateTime.UtcNow);
        }
        var periodInfo = PeriodHelper.Resolve(firstDay.ToDateTime(TimeOnly.MinValue), periodType);
        var prevKey    = PeriodHelper.GetPreviousPeriodKey(periodType, periodKey);

        // Tính dashboard_json và comparison_json theo dashboardCode
        string? dashJson  = null;
        string? compJson  = null;

        switch (dashboardCode)
        {
            case "ADMIN_MAIN":
                (dashJson, compJson) = await BuildAdminDashboardAsync(periodInfo, prevKey);
                break;
            case "RECEPTIONIST_MAIN":
                (dashJson, compJson) = await BuildReceptionistDashboardAsync(periodInfo, prevKey);
                break;
            case "HOUSEKEEPING_MAIN":
                (dashJson, compJson) = await BuildHousekeepingDashboardAsync(periodInfo, prevKey);
                break;
            default:
                dashJson = "{}";
                compJson = "{}";
                break;
        }

        // Upsert với Optimistic Concurrency
        var existing = await _context.Set<RoleDashboardPeriodState>()
            .FirstOrDefaultAsync(s =>
                s.RoleId        == roleId &&
                s.DashboardCode == dashboardCode &&
                s.PeriodType    == periodType &&
                s.PeriodKey     == periodKey);

        if (existing == null)
        {
            _context.Set<RoleDashboardPeriodState>().Add(new RoleDashboardPeriodState
            {
                RoleId         = roleId,
                DashboardCode  = dashboardCode,
                PeriodType     = periodType,
                PeriodKey      = periodKey,
                PeriodStart    = periodInfo.PeriodStart.ToDateTime(TimeOnly.MinValue),
                PeriodEnd      = periodInfo.PeriodEnd.ToDateTime(TimeOnly.MaxValue),
                Status         = "OPEN",
                DashboardJson  = dashJson ?? "{}",
                ComparisonJson = compJson,
                LastEventType  = "REBUILD",
                UpdatedAt      = DateTime.UtcNow,
                UpdatedBy      = null,
                Version        = 1
            });
        }
        else
        {
            existing.DashboardJson  = dashJson ?? "{}";
            existing.ComparisonJson = compJson;
            existing.LastEventType  = "REBUILD";
            existing.UpdatedAt      = DateTime.UtcNow;
            existing.Version++;
        }

        await _context.SaveChangesAsync();
    }

    // ── Admin Dashboard ───────────────────────────────────────────────────────
    private async Task<(string? dash, string? comp)> BuildAdminDashboardAsync(
        PeriodHelper.PeriodInfo period, string prevKey)
    {
        var start = period.PeriodStart.ToDateTime(TimeOnly.MinValue);
        var end   = period.PeriodEnd.ToDateTime(TimeOnly.MaxValue);

        // Kỳ hiện tại
        var revenue  = await _context.Invoices
            .Where(i => i.Status == "Paid" && i.CreatedAt >= start && i.CreatedAt <= end)
            .SumAsync(i => i.FinalTotal ?? 0);

        var bookings = await _context.Bookings
            .CountAsync(b => b.CreatedAt >= start && b.CreatedAt <= end);

        var totalRooms   = await _context.Rooms.CountAsync();
        var occupiedRooms = await _context.Rooms.CountAsync(r => r.Status == "Occupied");
        var occupancyRate = totalRooms > 0 ? Math.Round((double)occupiedRooms / totalRooms * 100, 1) : 0;

        // Revenue by day trong kỳ
        var revenueByDay = await _context.Invoices
            .Where(i => i.Status == "Paid" && i.CreatedAt >= start && i.CreatedAt <= end)
            .GroupBy(i => i.CreatedAt.Day)
            .Select(g => new { Day = g.Key, Amount = g.Sum(i => i.FinalTotal ?? 0) })
            .OrderBy(x => x.Day)
            .ToListAsync();

        var alerts = new List<object>();
        if (occupancyRate < 40) alerts.Add(new { level = "warning", message = $"Tỷ lệ lấp đầy thấp: {occupancyRate}%" });

        var dash = new
        {
            summary = new { totalRevenue = revenue, totalBookings = bookings, occupancyRate, totalRooms, occupiedRooms },
            charts  = new { revenueByDay = revenueByDay.Select(r => new { label = $"D{r.Day}", value = r.Amount }) },
            alerts
        };

        // Kỳ trước
        if (!DateOnly.TryParseExact(prevKey + "-01", "yyyy-MM-dd", out var prevFirst))
            prevFirst = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(-1));
        var prevInfo = PeriodHelper.Resolve(prevFirst.ToDateTime(TimeOnly.MinValue), "Monthly");
        var prevStart = prevInfo.PeriodStart.ToDateTime(TimeOnly.MinValue);
        var prevEnd   = prevInfo.PeriodEnd.ToDateTime(TimeOnly.MaxValue);

        var prevRevenue  = await _context.Invoices
            .Where(i => i.Status == "Paid" && i.CreatedAt >= prevStart && i.CreatedAt <= prevEnd)
            .SumAsync(i => i.FinalTotal ?? 0);
        var prevBookings = await _context.Bookings
            .CountAsync(b => b.CreatedAt >= prevStart && b.CreatedAt <= prevEnd);

        var revenueComp  = ComparisonHelper.Calculate(revenue, prevRevenue, "Positive");
        var bookingsComp = ComparisonHelper.Calculate(bookings, prevBookings, "Positive");

        var comp = new
        {
            previousPeriodKey = prevKey,
            metrics = new
            {
                totalRevenue  = ComparisonHelper.ToDict(revenueComp),
                totalBookings = ComparisonHelper.ToDict(bookingsComp)
            }
        };

        return (
            JsonSerializer.Serialize(dash, _jsonOpts),
            JsonSerializer.Serialize(comp, _jsonOpts)
        );
    }

    // ── Receptionist Dashboard ────────────────────────────────────────────────
    private async Task<(string? dash, string? comp)> BuildReceptionistDashboardAsync(
        PeriodHelper.PeriodInfo period, string prevKey)
    {
        var today = DateTime.UtcNow.Date;

        // CheckInDate / CheckOutDate are on BookingDetail, not Booking
        var todayArrivals   = await _context.BookingDetails
            .CountAsync(bd => bd.CheckInDate.Date == today);
        var todayDepartures = await _context.BookingDetails
            .CountAsync(bd => bd.CheckOutDate.Date == today);
        var currentGuests   = await _context.Rooms.CountAsync(r => r.Status == "Occupied");
        var pendingCheckIn  = await _context.BookingDetails
            .Where(bd => bd.CheckInDate.Date == today)
            .Join(_context.Bookings, bd => bd.BookingId, b => b.Id, (bd, b) => b.Status)
            .CountAsync(status => status == "Confirmed");

        var dash = new
        {
            summary = new { todayArrivals, todayDepartures, currentGuests, pendingCheckIn }
        };

        return (JsonSerializer.Serialize(dash, _jsonOpts), "{}");
    }

    // ── Housekeeping Dashboard ────────────────────────────────────────────────
    private async Task<(string? dash, string? comp)> BuildHousekeepingDashboardAsync(
        PeriodHelper.PeriodInfo period, string prevKey)
    {
        var start = period.PeriodStart.ToDateTime(TimeOnly.MinValue);
        var end   = period.PeriodEnd.ToDateTime(TimeOnly.MaxValue);

        var roomsCleaning      = await _context.Rooms.CountAsync(r => (r.CleanStatus ?? "clean").ToLower() == "cleaning");
        var roomsNeedCleaning  = await _context.Rooms.CountAsync(r => (r.CleanStatus ?? "clean").ToLower() == "dirty");
        var roomsInspecting    = await _context.Rooms.CountAsync(r => (r.CleanStatus ?? "clean").ToLower() == "inspecting");
        var damageReportCount  = await _context.LossAndDamages
            .CountAsync(l => l.CreatedAt.HasValue && l.CreatedAt >= start && l.CreatedAt <= end);

        // Kỳ trước
        if (!DateOnly.TryParseExact(prevKey + "-01", "yyyy-MM-dd", out var prevFirst))
            prevFirst = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(-1));
        var prevInfo = PeriodHelper.Resolve(prevFirst.ToDateTime(TimeOnly.MinValue), "Monthly");
        var prevStart = prevInfo.PeriodStart.ToDateTime(TimeOnly.MinValue);
        var prevEnd   = prevInfo.PeriodEnd.ToDateTime(TimeOnly.MaxValue);

        var prevDamageCount = await _context.LossAndDamages
            .CountAsync(l => l.CreatedAt.HasValue && l.CreatedAt >= prevStart && l.CreatedAt <= prevEnd);

        var alerts = new List<object>();
        if (roomsCleaning > 5) alerts.Add(new { level = "warning", message = $"{roomsCleaning} phòng đang dọn dẹp" });

        var dash = new
        {
            summary = new { roomsCleaning, roomsNeedCleaning, roomsInspecting, damageReportCount },
            alerts
        };

        var damageComp = ComparisonHelper.Calculate(damageReportCount, prevDamageCount, "Negative");
        var comp = new
        {
            previousPeriodKey = prevKey,
            metrics = new { damageReports = ComparisonHelper.ToDict(damageComp) }
        };

        return (
            JsonSerializer.Serialize(dash, _jsonOpts),
            JsonSerializer.Serialize(comp, _jsonOpts)
        );
    }
}
