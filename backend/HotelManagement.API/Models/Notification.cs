using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelManagement.API.Models;

public class Notification
{
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// Nullable: null = broadcast cho tất cả, có giá trị = gửi cho user cụ thể
    /// </summary>
    public int? UserId { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(1000)]
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Loại notification: info, warning, success, error
    /// </summary>
    [MaxLength(20)]
    public string Type { get; set; } = "info";

    public bool IsRead { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("UserId")]
    public User? User { get; set; }
}
