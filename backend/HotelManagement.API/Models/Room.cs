using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelManagement.API.Models;

[Table("Rooms")]
public class Room
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("room_type_id")]
    public int? RoomTypeId { get; set; }

    [Required]
    [Column("room_number")]
    [MaxLength(50)]
    public string RoomNumber { get; set; } = string.Empty;

    [Column("floor")]
    public int? Floor { get; set; }

    [Column("status")]
    [MaxLength(50)]
    public string? Status { get; set; } = "Available";

    // Navigation
    [ForeignKey("RoomTypeId")]
    public RoomType? RoomType { get; set; }

    public ICollection<RoomInventory> RoomInventories { get; set; } = new List<RoomInventory>();
    public ICollection<BookingDetail> BookingDetails { get; set; } = new List<BookingDetail>();
}
