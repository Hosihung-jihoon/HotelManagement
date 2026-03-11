using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelManagement.API.Models;

[Table("Booking_Details")]
public class BookingDetail
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("booking_id")]
    public int? BookingId { get; set; }

    [Column("room_id")]
    public int? RoomId { get; set; }

    [Column("room_type_id")]
    public int? RoomTypeId { get; set; }

    [Required]
    [Column("check_in_date")]
    public DateTime CheckInDate { get; set; }

    [Required]
    [Column("check_out_date")]
    public DateTime CheckOutDate { get; set; }

    [Required]
    [Column("price_per_night", TypeName = "decimal(18,2)")]
    public decimal PricePerNight { get; set; }

    // Navigation
    [ForeignKey("BookingId")]
    public Booking? Booking { get; set; }

    [ForeignKey("RoomId")]
    public Room? Room { get; set; }

    [ForeignKey("RoomTypeId")]
    public RoomType? RoomType { get; set; }

    public ICollection<OrderService> OrderServices { get; set; } = new List<OrderService>();
    public ICollection<LossAndDamage> LossAndDamages { get; set; } = new List<LossAndDamage>();
}
