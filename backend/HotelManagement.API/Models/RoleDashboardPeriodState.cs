using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelManagement.API.Models;

/// <summary>
/// Bảng lưu snapshot Dashboard theo Role và Kỳ thời gian.
/// Schema chuẩn từ giảng viên.
/// </summary>
[Table("Role_Dashboard_Period_States")]
public class RoleDashboardPeriodState
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("role_id")]
    public int RoleId { get; set; }

    [Required]
    [Column("role_name")]
    [MaxLength(100)]
    public string RoleName { get; set; } = string.Empty;

    [Required]
    [Column("dashboard_code")]
    [MaxLength(100)]
    public string DashboardCode { get; set; } = string.Empty;

    [Required]
    [Column("dashboard_title")]
    [MaxLength(255)]
    public string DashboardTitle { get; set; } = string.Empty;

    [Required]
    [Column("period_type")]
    [MaxLength(20)]
    public string PeriodType { get; set; } = string.Empty;

    [Required]
    [Column("period_key")]
    [MaxLength(30)]
    public string PeriodKey { get; set; } = string.Empty;

    [Column("period_start")]
    public DateTime PeriodStart { get; set; }

    [Column("period_end")]
    public DateTime PeriodEnd { get; set; }

    [Required]
    [Column("dashboard_json")]
    public string DashboardJson { get; set; } = "{}";

    [Column("comparison_json")]
    public string? ComparisonJson { get; set; }

    [Required]
    [Column("status")]
    [MaxLength(20)]
    public string Status { get; set; } = "OPEN";

    [Column("is_current")]
    public bool IsCurrent { get; set; }

    [Column("last_event_type")]
    [MaxLength(100)]
    public string? LastEventType { get; set; }

    [Column("last_event_source")]
    [MaxLength(100)]
    public string? LastEventSource { get; set; }

    [Column("last_event_ref_id")]
    public int? LastEventRefId { get; set; }

    [Column("version")]
    public int Version { get; set; } = 1;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("closed_at")]
    public DateTime? ClosedAt { get; set; }

    [Column("updated_by")]
    public int? UpdatedBy { get; set; }

    // Navigation
    [ForeignKey("RoleId")]
    public Role? Role { get; set; }
}
