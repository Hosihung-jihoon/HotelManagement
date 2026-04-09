using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelManagement.API.Models;

[Table("Equipments")]
public class Equipment
{
    [Key]
    [Column("Id")]
    public int Id { get; set; }

    [Column("ItemCode")]
    [MaxLength(50)]
    public string? ItemCode { get; set; }

    [Required]
    [Column("Name")]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    [Column("Category")]
    [MaxLength(100)]
    public string? Category { get; set; }

    [Column("Unit")]
    [MaxLength(50)]
    public string? Unit { get; set; }

    [Column("TotalQuantity")]
    public int? TotalQuantity { get; set; } = 0;

    [Column("InUseQuantity")]
    public int? InUseQuantity { get; set; } = 0;

    [Column("DamagedQuantity")]
    public int? DamagedQuantity { get; set; } = 0;

    [Column("LiquidatedQuantity")]
    public int? LiquidatedQuantity { get; set; } = 0;

    [Column("InStockQuantity")]
    public int? InStockQuantity { get; set; } = 0;

    [Column("BasePrice", TypeName = "decimal(18,2)")]
    public decimal? BasePrice { get; set; } = 0;

    [Column("DefaultPriceIfLost", TypeName = "decimal(18,2)")]
    public decimal? DefaultPriceIfLost { get; set; } = 0;

    [Column("Supplier")]
    [MaxLength(255)]
    public string? Supplier { get; set; }

    [Column("IsActive")]
    public bool? IsActive { get; set; } = true;

    [Column("CreatedAt")]
    public DateTime? CreatedAt { get; set; }

    [Column("UpdatedAt")]
    public DateTime? UpdatedAt { get; set; }

    [Column("ImageUrl")]
    [MaxLength(500)]
    public string? ImageUrl { get; set; }
}
