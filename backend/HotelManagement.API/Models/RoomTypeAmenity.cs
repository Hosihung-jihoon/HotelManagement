using System.ComponentModel.DataAnnotations.Schema;

namespace HotelManagement.API.Models;

[Table("RoomType_Amenities")]
public class RoomTypeAmenity
{
    [Column("room_type_id")]
    public int RoomTypeId { get; set; }

    [Column("amenity_id")]
    public int AmenityId { get; set; }

    // Navigation
    [ForeignKey("RoomTypeId")]
    public RoomType RoomType { get; set; } = null!;

    [ForeignKey("AmenityId")]
    public Amenity Amenity { get; set; } = null!;
}
