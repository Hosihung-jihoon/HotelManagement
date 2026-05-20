using System.ComponentModel.DataAnnotations.Schema;

namespace HotelManagement.API.Models;

[Table("RoomType_Services")]
public class RoomTypeService
{
    [Column("room_type_id")]
    public int RoomTypeId { get; set; }

    [Column("service_id")]
    public int ServiceId { get; set; }

    [ForeignKey("RoomTypeId")]
    public RoomType RoomType { get; set; } = null!;

    [ForeignKey("ServiceId")]
    public Service Service { get; set; } = null!;
}
