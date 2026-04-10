using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelManagement.API.Models;

[Table("Notifications")]
public class Notification
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    /// <summary>
    /// Nullable: null = broadcast cho tất cả, có giá trị = gửi cho user cụ thể
    /// </summary>
    [Column("user_id")]
    public int? UserId { get; set; }

    [Required]
    [MaxLength(200)]
    [Column("title")]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(1000)]
    [Column("content")]
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Loại notification: info, warning, success, error
    /// </summary>
    [MaxLength(20)]
    [Column("type")]
    public string Type { get; set; } = "info";

    [Column("reference_link")]
    public string? ReferenceLink { get; set; }

    [Column("is_read")]
    public bool IsRead { get; set; } = false;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("UserId")]
    public User? User { get; set; }
}
