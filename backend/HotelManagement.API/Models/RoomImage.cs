using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelManagement.API.Models;

[Table("Room_Images")]
public class RoomImage
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("room_type_id")]
    public int? RoomTypeId { get; set; }

    [Required]
    [Column("image_url")]
    public string ImageUrl { get; set; } = string.Empty;

    [Column("is_primary")]
    public bool? IsPrimary { get; set; } = false;

    // Navigation
    [ForeignKey("RoomTypeId")]
    public RoomType? RoomType { get; set; }
}
