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

    [Column("note")]
    public string? Note { get; set; }

    [Column("is_active")]
    public bool? IsActive { get; set; } = true;

    [Column("item_type")]
    [MaxLength(100)]
    public string? ItemType { get; set; }

    // Cột mới thêm
    [Column("unit")]
    [MaxLength(50)]
    public string? Unit { get; set; }

    [Column("quantity_in_use")]
    public int QuantityInUse { get; set; } = 0;

    [Column("quantity_damaged")]
    public int QuantityDamaged { get; set; } = 0;

    [Column("image_url")]
    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    // Navigation
    [ForeignKey("RoomId")]
    public Room? Room { get; set; }

    public ICollection<LossAndDamage> LossAndDamages { get; set; } = new List<LossAndDamage>();
}

