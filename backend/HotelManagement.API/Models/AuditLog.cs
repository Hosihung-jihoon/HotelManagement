using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelManagement.API.Models;

[Table("Audit_Logs")]
public class AuditLog
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("user_id")]
    public int? UserId { get; set; }

    [Required]
    [Column("action")]
    [MaxLength(50)]
    public string Action { get; set; } = string.Empty;

    [Required]
    [Column("table_name")]
    [MaxLength(100)]
    public string TableName { get; set; } = string.Empty;

    [Column("record_id")]
    public int RecordId { get; set; }

    [Column("old_value")]
    public string? OldValue { get; set; }

    [Column("new_value")]
    public string? NewValue { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    // Navigation
    [ForeignKey("UserId")]
    public User? User { get; set; }
}
