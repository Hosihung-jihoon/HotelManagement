using HotelManagement.API.DTOs;

namespace HotelManagement.API.Services;

/// <summary>
/// Interface chuẩn theo mẫu giảng viên.
/// </summary>
public interface IRoleDashboardPeriodService
{
    /// <summary>Lấy dashboard hiện tại hoặc theo periodKey cụ thể.</summary>
    Task<DashboardPeriodResponseDto?> GetDashboardAsync(
        string roleName,
        string periodType,
        string? periodKey,
        bool currentOnly,
        CancellationToken cancellationToken = default);

    /// <summary>Lấy lịch sử các kỳ của một role.</summary>
    Task<IReadOnlyList<DashboardHistoryItemDto>> GetHistoryAsync(
        string roleName,
        string periodType,
        int take,
        CancellationToken cancellationToken = default);

    /// <summary>Rebuild dashboard cho một role + kỳ cụ thể.</summary>
    Task RebuildDashboardAsync(
        string roleName,
        string periodType,
        DateTime occurredAtUtc,
        int? updatedByUserId,
        string eventType,
        int? eventRefId,
        CancellationToken cancellationToken = default);

    /// <summary>Rebuild tất cả các role bị ảnh hưởng bởi một event.</summary>
    Task RebuildAffectedDashboardsAsync(
        string eventType,
        DateTime occurredAtUtc,
        int? updatedByUserId,
        int? eventRefId,
        CancellationToken cancellationToken = default);

    /// <summary>Rebuild toàn bộ dashboard kỳ hiện tại cho tất cả roles.</summary>
    Task RebuildAllCurrentDashboardsAsync(
        int? updatedByUserId,
        CancellationToken cancellationToken = default);
}
