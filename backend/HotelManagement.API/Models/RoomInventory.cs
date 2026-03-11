using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelManagement.API.Models;

[Table("Room_Inventory")]
public class RoomInventory
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("room_id")]
    public int? RoomId { get; set; }

    [Required]
    [Column("item_name")]
    [MaxLength(255)]
    public string ItemName { get; set; } = string.Empty;

    [Column("quantity")]
    public int? Quantity { get; set; } = 1;

    [Column("price_if_lost", TypeName = "decimal(18,2)")]
    public decimal? PriceIfLost { get; set; } = 0;

    // Navigation
    [ForeignKey("RoomId")]
    public Room? Room { get; set; }

    public ICollection<LossAndDamage> LossAndDamages { get; set; } = new List<LossAndDamage>();
}
