using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelManagement.API.Models;

[Table("Loss_And_Damages")]
public class LossAndDamage
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("booking_detail_id")]
    public int? BookingDetailId { get; set; }

    [Column("room_inventory_id")]
    public int? RoomInventoryId { get; set; }

    [Required]
    [Column("quantity")]
    public int Quantity { get; set; }

    [Required]
    [Column("penalty_amount", TypeName = "decimal(18,2)")]
    public decimal PenaltyAmount { get; set; }

    [Column("description")]
    public string? Description { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    // Navigation
    [ForeignKey("BookingDetailId")]
    public BookingDetail? BookingDetail { get; set; }

    [ForeignKey("RoomInventoryId")]
    public RoomInventory? RoomInventory { get; set; }
}
