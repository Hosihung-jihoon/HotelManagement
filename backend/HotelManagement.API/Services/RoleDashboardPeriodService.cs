using System.Text.Json;
using HotelManagement.API.Data;
using HotelManagement.API.DTOs;
using HotelManagement.API.Helpers;
using HotelManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Services;

/// <summary>
/// Implementation theo chuẩn giảng viên, thích nghi với schema DB thực tế của dự án.
/// Khác biệt so với mẫu: Room.CleanStatus (thay CleaningStatus), AuditLog đơn giản hơn, không có Reviews table riêng.
/// </summary>
public sealed class RoleDashboardPeriodService : IRoleDashboardPeriodService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        WriteIndented = false
    };

    private readonly HotelDbContext _context;

    public RoleDashboardPeriodService(HotelDbContext context)
    {
        _context = context;
    }

    // ── Get ──────────────────────────────────────────────────────────────────

    public async Task<DashboardPeriodResponseDto?> GetDashboardAsync(
        string roleName, string periodType, string? periodKey, bool currentOnly,
        CancellationToken cancellationToken = default)
    {
        var normalizedType  = DashboardPeriodHelper.NormalizePeriodType(periodType);
        var dashboardCode   = DashboardPeriodHelper.GetDashboardCode(roleName);

        var query = _context.DashboardSnapshots
            .AsNoTracking()
            .Where(x => x.RoleName == roleName
                && x.DashboardCode == dashboardCode
                && x.PeriodType == normalizedType);

        query = currentOnly || string.IsNullOrWhiteSpace(periodKey)
            ? query.Where(x => x.IsCurrent)
            : query.Where(x => x.PeriodKey == periodKey);

        var entity = await query
            .OrderByDescending(x => x.PeriodStart)
            .FirstOrDefaultAsync(cancellationToken);

        return entity == null ? null : ToResponseDto(entity);
    }

    public async Task<IReadOnlyList<DashboardHistoryItemDto>> GetHistoryAsync(
        string roleName, string periodType, int take,
        CancellationToken cancellationToken = default)
    {
        var normalizedType = DashboardPeriodHelper.NormalizePeriodType(periodType);
        var dashboardCode  = DashboardPeriodHelper.GetDashboardCode(roleName);
        var safeTake       = Math.Clamp(take, 1, 36);

        return await _context.DashboardSnapshots
            .AsNoTracking()
            .Where(x => x.RoleName == roleName
                && x.DashboardCode == dashboardCode
                && x.PeriodType == normalizedType)
            .OrderByDescending(x => x.PeriodStart)
            .Take(safeTake)
            .Select(x => new DashboardHistoryItemDto
            {
                Id            = x.Id,
                RoleName      = x.RoleName,
                DashboardCode = x.DashboardCode,
                PeriodType    = x.PeriodType,
                PeriodKey     = x.PeriodKey,
                PeriodStart   = x.PeriodStart,
                PeriodEnd     = x.PeriodEnd,
                Status        = x.Status,
                IsCurrent     = x.IsCurrent,
                UpdatedAt     = x.UpdatedAt
            })
            .ToListAsync(cancellationToken);
    }

    // ── Rebuild ──────────────────────────────────────────────────────────────

    public async Task RebuildDashboardAsync(
        string roleName, string periodType, DateTime occurredAtUtc,
        int? updatedByUserId, string eventType, int? eventRefId,
        CancellationToken cancellationToken = default)
    {
        var period = DashboardPeriodHelper.Resolve(periodType, occurredAtUtc);
        var role   = await _context.Roles.FirstOrDefaultAsync(x => x.Name == roleName, cancellationToken);
        if (role == null) return;

        var dashboardCode  = DashboardPeriodHelper.GetDashboardCode(role.Name);
        var dashboardTitle = role.Name + " Dashboard";

        var periodMetrics   = await BuildMetricsAsync(period.PeriodStart, period.PeriodEnd, cancellationToken);
        var previousMetrics = await BuildMetricsAsync(period.PreviousPeriodStart, period.PreviousPeriodEnd, cancellationToken);

        var dashboardJson  = BuildDashboardJson(role.Name, dashboardCode, period, periodMetrics);
        var comparisonJson = BuildComparisonJson(period, periodMetrics, previousMetrics);

        var existing = await _context.DashboardSnapshots.FirstOrDefaultAsync(x =>
            x.RoleId        == role.Id
            && x.DashboardCode == dashboardCode
            && x.PeriodType    == period.PeriodType
            && x.PeriodKey     == period.PeriodKey,
            cancellationToken);

        await ClearCurrentFlagAsync(role.Id, dashboardCode, period.PeriodType, period.IsCurrent, cancellationToken);

        if (existing == null)
        {
            existing = new RoleDashboardPeriodState
            {
                RoleId    = role.Id,
                RoleName  = role.Name,
                CreatedAt = DateTime.UtcNow
            };
            _context.DashboardSnapshots.Add(existing);
        }

        existing.RoleName        = role.Name;
        existing.DashboardCode   = dashboardCode;
        existing.DashboardTitle  = dashboardTitle;
        existing.PeriodType      = period.PeriodType;
        existing.PeriodKey       = period.PeriodKey;
        existing.PeriodStart     = period.PeriodStart;
        existing.PeriodEnd       = period.PeriodEnd;
        existing.DashboardJson   = dashboardJson;
        existing.ComparisonJson  = comparisonJson;
        existing.Status          = period.IsCurrent ? "OPEN" : "CLOSED";
        existing.IsCurrent       = period.IsCurrent;
        existing.LastEventType   = eventType;
        existing.LastEventSource = "RoleDashboardPeriodService";
        existing.LastEventRefId  = eventRefId;
        existing.Version        += existing.Id == 0 ? 0 : 1;
        existing.UpdatedAt       = DateTime.UtcNow;
        existing.ClosedAt        = period.IsCurrent ? null : existing.ClosedAt ?? DateTime.UtcNow;
        existing.UpdatedBy       = updatedByUserId;

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task RebuildAffectedDashboardsAsync(
        string eventType, DateTime occurredAtUtc, int? updatedByUserId, int? eventRefId,
        CancellationToken cancellationToken = default)
    {
        var affectedRoles = ResolveAffectedRoles(eventType);
        var existingRoles = await _context.Roles
            .AsNoTracking()
            .Where(x => affectedRoles.Contains(x.Name))
            .Select(x => x.Name)
            .ToListAsync(cancellationToken);

        foreach (var roleName in existingRoles)
            foreach (var pt in DashboardPeriodHelper.DefaultEventPeriods)
                await RebuildDashboardAsync(roleName, pt, occurredAtUtc, updatedByUserId, eventType, eventRefId, cancellationToken);
    }

    public async Task RebuildAllCurrentDashboardsAsync(
        int? updatedByUserId, CancellationToken cancellationToken = default)
    {
        // Chỉ rebuild các role thực sự có trong DB
        var roles = await _context.Roles
            .AsNoTracking()
            .Where(x => x.Name == "Admin" || x.Name == "Receptionist" || x.Name == "Housekeeping")
            .Select(x => x.Name)
            .ToListAsync(cancellationToken);

        var now = DateTime.UtcNow;
        foreach (var roleName in roles)
            foreach (var pt in DashboardPeriodHelper.DefaultEventPeriods)
                await RebuildDashboardAsync(roleName, pt, now, updatedByUserId, "MANUAL_REBUILD", null, cancellationToken);
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private async Task ClearCurrentFlagAsync(
        int roleId, string dashboardCode, string periodType,
        bool shouldClear, CancellationToken cancellationToken)
    {
        if (!shouldClear) return;

        var currentRows = await _context.DashboardSnapshots
            .Where(x => x.RoleId == roleId
                && x.DashboardCode == dashboardCode
                && x.PeriodType    == periodType
                && x.IsCurrent)
            .ToListAsync(cancellationToken);

        foreach (var row in currentRows)
        {
            row.IsCurrent = false;
            if (row.Status == "OPEN") { row.Status = "CLOSED"; row.ClosedAt = DateTime.UtcNow; }
        }
    }

    private static IReadOnlyList<string> ResolveAffectedRoles(string eventType)
    {
        return eventType.Trim().ToUpperInvariant() switch
        {
            "DAMAGE_REPORTED" or "DAMAGE_UPDATED" or "DAMAGE_CANCELLED"
                => new[] { "Housekeeping", "Admin" },
            "PAYMENT_CREATED" or "INVOICE_CREATED" or "INVOICE_UPDATED"
                => new[] { "Receptionist", "Admin" },
            "BOOKING_CREATED" or "BOOKING_UPDATED" or "BOOKING_STATUS_CHANGED" or "BOOKING_CANCELLED"
                => new[] { "Receptionist", "Admin" },
            "CHECK_IN" or "CHECK_OUT" or "ROOM_ASSIGNED"
                => new[] { "Receptionist", "Housekeeping", "Admin" },
            "ROOM_CLEANING_UPDATED"
                => new[] { "Housekeeping", "Admin" },
            _ => new[] { "Admin", "Receptionist", "Housekeeping" }
        };
    }

    // ── Metrics aggregation ──────────────────────────────────────────────────

    private async Task<DashboardMetrics> BuildMetricsAsync(
        DateTime start, DateTime end, CancellationToken cancellationToken)
    {
        // Users
        var totalUsers  = await _context.Users.CountAsync(cancellationToken);
        var activeUsers = await _context.Users.CountAsync(x => x.Status == true, cancellationToken);
        var lockedUsers = await _context.Users.CountAsync(x => x.Status == false, cancellationToken);

        // Bookings
        var bookingGroups = await _context.Bookings
            .Where(x => x.CreatedAt >= start && x.CreatedAt <= end)
            .GroupBy(x => x.Status ?? "Unknown")
            .Select(g => new { Status = g.Key, Total = g.Count() })
            .ToListAsync(cancellationToken);

        var totalBookings     = bookingGroups.Sum(x => x.Total);
        var completedBookings = bookingGroups.Where(x => x.Status == "Completed").Sum(x => x.Total);
        var cancelledBookings = bookingGroups.Where(x => x.Status == "Cancelled").Sum(x => x.Total);
        var pendingBookings   = bookingGroups.Where(x => x.Status == "Pending").Sum(x => x.Total);
        var confirmedBookings = bookingGroups.Where(x => x.Status == "Confirmed").Sum(x => x.Total);

        // Check-in / out (từ BookingDetail)
        var checkIns  = await _context.BookingDetails.CountAsync(
            x => x.CheckInDate >= start && x.CheckInDate <= end, cancellationToken);
        var checkOuts = await _context.BookingDetails.CountAsync(
            x => x.CheckOutDate >= start && x.CheckOutDate <= end, cancellationToken);

        // Revenue từ Payments
        var totalRevenue = await _context.Payments
            .Where(x => x.PaymentDate.HasValue && x.PaymentDate.Value >= start && x.PaymentDate.Value <= end)
            .SumAsync(x => (decimal?)x.AmountPaid, cancellationToken) ?? 0m;

        // Invoice metrics
        var invoiceMetrics = await _context.Invoices
            .Where(x => x.CreatedAt >= start && x.CreatedAt <= end)
            .GroupBy(_ => 1)
            .Select(g => new
            {
                RoomRevenue          = g.Sum(x => x.Status == "Cancelled" ? 0m : (x.TotalRoomAmount ?? 0m)),
                ServiceRevenue       = g.Sum(x => x.Status == "Cancelled" ? 0m : (x.TotalServiceAmount ?? 0m)),
                PendingPaymentAmount = g.Sum(x => x.Status == "Unpaid" ? (x.FinalTotal ?? 0m) : 0m),
                PaidInvoices         = g.Count(x => x.Status == "Paid"),
                UnpaidInvoices       = g.Count(x => x.Status == "Unpaid")
            })
            .FirstOrDefaultAsync(cancellationToken);

        // Rooms — dùng CleanStatus (tên field thực tế trong DB)
        var totalRooms       = await _context.Rooms.CountAsync(cancellationToken);
        var availableRooms   = await _context.Rooms.CountAsync(x => x.Status == "Available", cancellationToken);
        var occupiedRooms    = await _context.Rooms.CountAsync(x => x.Status == "Occupied", cancellationToken);
        var maintenanceRooms = await _context.Rooms.CountAsync(x => x.Status == "Maintenance", cancellationToken);
        var dirtyRooms       = await _context.Rooms.CountAsync(x => (x.CleanStatus ?? "clean").ToLower() == "dirty", cancellationToken);
        var cleaningRooms    = await _context.Rooms.CountAsync(x => (x.CleanStatus ?? "clean").ToLower() == "cleaning", cancellationToken);
        var occupancyRate    = totalRooms == 0 ? 0m : Math.Round((decimal)occupiedRooms / totalRooms * 100m, 2);

        // Damage
        var damageMetrics = await _context.LossAndDamages
            .Where(x => x.CreatedAt.HasValue && x.CreatedAt.Value >= start && x.CreatedAt.Value <= end)
            .GroupBy(_ => 1)
            .Select(g => new
            {
                Reports       = g.Count(),
                Quantity      = g.Sum(x => x.Quantity),
                PenaltyAmount = g.Sum(x => x.PenaltyAmount)
            })
            .FirstOrDefaultAsync(cancellationToken);

        return new DashboardMetrics
        {
            TotalUsers           = totalUsers,
            ActiveUsers          = activeUsers,
            LockedUsers          = lockedUsers,
            TotalBookings        = totalBookings,
            CompletedBookings    = completedBookings,
            CancelledBookings    = cancelledBookings,
            PendingBookings      = pendingBookings,
            ConfirmedBookings    = confirmedBookings,
            CheckIns             = checkIns,
            CheckOuts            = checkOuts,
            TotalRevenue         = totalRevenue,
            RoomRevenue          = invoiceMetrics?.RoomRevenue ?? 0m,
            ServiceRevenue       = invoiceMetrics?.ServiceRevenue ?? 0m,
            PendingPaymentAmount = invoiceMetrics?.PendingPaymentAmount ?? 0m,
            PaidInvoices         = invoiceMetrics?.PaidInvoices ?? 0,
            UnpaidInvoices       = invoiceMetrics?.UnpaidInvoices ?? 0,
            TotalRooms           = totalRooms,
            AvailableRooms       = availableRooms,
            OccupiedRooms        = occupiedRooms,
            MaintenanceRooms     = maintenanceRooms,
            DirtyRooms           = dirtyRooms,
            CleaningRooms        = cleaningRooms,
            OccupancyRate        = occupancyRate,
            DamageReports        = damageMetrics?.Reports ?? 0,
            DamagedQuantity      = damageMetrics?.Quantity ?? 0,
            PenaltyAmount        = damageMetrics?.PenaltyAmount ?? 0m
        };
    }

    private string BuildDashboardJson(
        string roleName, string dashboardCode,
        DashboardPeriodInfo period, DashboardMetrics m)
    {
        var alerts = new List<object>();
        if (m.PendingPaymentAmount > 0)
            alerts.Add(new { level = "warning", code = "PENDING_PAYMENT", message = "Có hóa đơn chưa thanh toán.", value = m.PendingPaymentAmount });
        if (m.DirtyRooms > 0)
            alerts.Add(new { level = "warning", code = "DIRTY_ROOMS", message = "Có phòng cần dọn dẹp.", value = m.DirtyRooms });

        var payload = new
        {
            meta = new
            {
                schemaVersion = 1, dashboardCode, roleName,
                periodType  = period.PeriodType,
                periodKey   = period.PeriodKey,
                periodStart = period.PeriodStart,
                periodEnd   = period.PeriodEnd,
                status      = period.IsCurrent ? "OPEN" : "CLOSED",
                generatedAt = DateTime.UtcNow
            },
            summary = new
            {
                booking = new
                {
                    m.TotalBookings, m.CompletedBookings, m.CancelledBookings,
                    m.PendingBookings, m.ConfirmedBookings, m.CheckIns, m.CheckOuts
                },
                revenue = new
                {
                    m.TotalRevenue, m.RoomRevenue, m.ServiceRevenue,
                    m.PendingPaymentAmount, m.PaidInvoices, m.UnpaidInvoices
                },
                rooms = new
                {
                    m.TotalRooms, m.AvailableRooms, m.OccupiedRooms,
                    m.MaintenanceRooms, m.DirtyRooms, m.CleaningRooms, m.OccupancyRate
                },
                damage = new { m.DamageReports, m.DamagedQuantity, m.PenaltyAmount },
                system = new { m.TotalUsers, m.ActiveUsers, m.LockedUsers }
            },
            widgets = new
            {
                kpiCards = BuildKpiCards(roleName, m)
            },
            alerts
        };

        return JsonSerializer.Serialize(payload, JsonOptions);
    }

    private string BuildComparisonJson(
        DashboardPeriodInfo period, DashboardMetrics current, DashboardMetrics previous)
    {
        var payload = new
        {
            baseInfo = new
            {
                comparisonType      = "PREVIOUS_PERIOD",
                currentPeriodKey    = period.PeriodKey,
                currentPeriodStart  = period.PeriodStart,
                currentPeriodEnd    = period.PeriodEnd,
                previousPeriodStart = period.PreviousPeriodStart,
                previousPeriodEnd   = period.PreviousPeriodEnd
            },
            metrics = new
            {
                totalBookings        = Compare(current.TotalBookings,        previous.TotalBookings,        "higher_is_better"),
                totalRevenue         = Compare(current.TotalRevenue,         previous.TotalRevenue,         "higher_is_better"),
                occupancyRate        = Compare(current.OccupancyRate,        previous.OccupancyRate,        "higher_is_better"),
                damageReports        = Compare(current.DamageReports,        previous.DamageReports,        "lower_is_better"),
                penaltyAmount        = Compare(current.PenaltyAmount,        previous.PenaltyAmount,        "lower_is_better"),
                pendingPaymentAmount = Compare(current.PendingPaymentAmount, previous.PendingPaymentAmount, "lower_is_better"),
                dirtyRooms           = Compare(current.DirtyRooms,           previous.DirtyRooms,           "lower_is_better")
            }
        };

        return JsonSerializer.Serialize(payload, JsonOptions);
    }

    private static object Compare(decimal current, decimal previous, string directionMeaning) => new
    {
        current,
        previous,
        difference      = current - previous,
        growthRate      = DashboardPeriodHelper.CalculateGrowthRate(current, previous),
        trend           = DashboardPeriodHelper.ResolveTrend(current, previous),
        directionMeaning
    };

    private static object Compare(int current, int previous, string d)
        => Compare((decimal)current, previous, d);

    private static IReadOnlyList<object> BuildKpiCards(string roleName, DashboardMetrics m)
    {
        return roleName switch
        {
            "Housekeeping" => new object[]
            {
                new { code = "dirtyRooms",    title = "Phòng cần dọn",      value = m.DirtyRooms,    unit = "room"   },
                new { code = "cleaningRooms", title = "Đang dọn",           value = m.CleaningRooms, unit = "room"   },
                new { code = "damageReports", title = "Báo cáo hỏng",       value = m.DamageReports, unit = "report" }
            },
            "Receptionist" => new object[]
            {
                new { code = "totalBookings",   title = "Đặt phòng",        value = m.TotalBookings,   unit = "booking" },
                new { code = "checkIns",        title = "Check-in",         value = m.CheckIns,        unit = "lần"     },
                new { code = "pendingBookings", title = "Chờ xử lý",        value = m.PendingBookings, unit = "booking" }
            },
            _ => new object[]
            {
                new { code = "totalBookings",  title = "Tổng đặt phòng",   value = m.TotalBookings,  unit = "booking" },
                new { code = "totalRevenue",   title = "Doanh thu",        value = m.TotalRevenue,   unit = "VND"     },
                new { code = "occupancyRate",  title = "Tỷ lệ lấp đầy",   value = m.OccupancyRate,  unit = "%"       }
            }
        };
    }

    private static DashboardPeriodResponseDto ToResponseDto(RoleDashboardPeriodState e)
    {
        return new DashboardPeriodResponseDto
        {
            Id             = e.Id,
            RoleId         = e.RoleId,
            RoleName       = e.RoleName,
            DashboardCode  = e.DashboardCode,
            DashboardTitle = e.DashboardTitle,
            PeriodType     = e.PeriodType,
            PeriodKey      = e.PeriodKey,
            PeriodStart    = e.PeriodStart,
            PeriodEnd      = e.PeriodEnd,
            Status         = e.Status,
            IsCurrent      = e.IsCurrent,
            Version        = e.Version,
            UpdatedAt      = e.UpdatedAt,
            Dashboard      = DeserializeJson(e.DashboardJson),
            Comparison     = DeserializeJson(e.ComparisonJson)
        };
    }

    private static JsonElement? DeserializeJson(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return null;
        using var doc = JsonDocument.Parse(json);
        return doc.RootElement.Clone();
    }

    // ── Inner types ──────────────────────────────────────────────────────────

    private sealed class DashboardMetrics
    {
        public int TotalUsers { get; init; }
        public int ActiveUsers { get; init; }
        public int LockedUsers { get; init; }
        public int TotalBookings { get; init; }
        public int CompletedBookings { get; init; }
        public int CancelledBookings { get; init; }
        public int PendingBookings { get; init; }
        public int ConfirmedBookings { get; init; }
        public int CheckIns { get; init; }
        public int CheckOuts { get; init; }
        public decimal TotalRevenue { get; init; }
        public decimal RoomRevenue { get; init; }
        public decimal ServiceRevenue { get; init; }
        public decimal PendingPaymentAmount { get; init; }
        public int PaidInvoices { get; init; }
        public int UnpaidInvoices { get; init; }
        public int TotalRooms { get; init; }
        public int AvailableRooms { get; init; }
        public int OccupiedRooms { get; init; }
        public int MaintenanceRooms { get; init; }
        public int DirtyRooms { get; init; }
        public int CleaningRooms { get; init; }
        public decimal OccupancyRate { get; init; }
        public int DamageReports { get; init; }
        public int DamagedQuantity { get; init; }
        public decimal PenaltyAmount { get; init; }
    }
}
