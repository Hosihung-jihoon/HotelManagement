using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelManagement.API.Models;

[Table("Room_Types")]
public class RoomType
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [Column("name")]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [Column("base_price", TypeName = "decimal(18,2)")]
    public decimal BasePrice { get; set; }

    [Required]
    [Column("capacity_adults")]
    public int CapacityAdults { get; set; }

    [Required]
    [Column("capacity_children")]
    public int CapacityChildren { get; set; }

    [Column("description")]
    public string? Description { get; set; }

    // ===== Các cột bổ sung trong DB =====
    [Column("size_sqm")]
    public decimal? SizeSqm { get; set; }

    [Column("bed_type")]
    [MaxLength(100)]
    public string? BedType { get; set; }

    [Column("view_type")]
    [MaxLength(100)]
    public string? ViewType { get; set; }

    [Column("is_active")]
    public bool? IsActive { get; set; } = true;

    [Column("slug")]
    [MaxLength(255)]
    public string? Slug { get; set; }

    [Column("content")]
    public string? Content { get; set; }

    // Navigation
    public ICollection<Room> Rooms { get; set; } = new List<Room>();
    public ICollection<RoomImage> RoomImages { get; set; } = new List<RoomImage>();
    public ICollection<RoomTypeAmenity> RoomTypeAmenities { get; set; } = new List<RoomTypeAmenity>();
    public ICollection<RoomTypeService> RoomTypeServices { get; set; } = new List<RoomTypeService>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<BookingDetail> BookingDetails { get; set; } = new List<BookingDetail>();
}

