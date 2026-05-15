namespace HotelManagement.API.DTOs;

/// <summary>
/// DTO trả về từ GET /api/Dashboard/snapshot
/// </summary>
public class DashboardSnapshotResultDto
{
    public int RoleId { get; set; }
    public string DashboardCode { get; set; } = string.Empty;
    public string PeriodType { get; set; } = string.Empty;
    public string PeriodKey { get; set; } = string.Empty;
    public DateTime PeriodStart { get; set; }
    public DateTime PeriodEnd { get; set; }
    public string Status { get; set; } = "OPEN";
    public string? DashboardJson { get; set; }
    public string? ComparisonJson { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int Version { get; set; }
}
