using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelManagement.API.Models;

[Table("Reviews")]
public class Review
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("user_id")]
    public int? UserId { get; set; }

    [Column("room_type_id")]
    public int? RoomTypeId { get; set; }

    [Column("rating")]
    [Range(1, 5)]
    public int? Rating { get; set; }

    [Column("comment")]
    public string? Comment { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    // Navigation
    [ForeignKey("UserId")]
    public User? User { get; set; }

    [ForeignKey("RoomTypeId")]
    public RoomType? RoomType { get; set; }
}
