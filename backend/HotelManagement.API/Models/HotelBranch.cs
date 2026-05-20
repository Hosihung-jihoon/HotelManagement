using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelManagement.API.Models;

/// <summary>
/// Vị trí chi nhánh khách sạn — dùng để tính khoảng cách thực tế đến các địa điểm tham quan.
/// </summary>
[Table("HotelBranches")]
public class HotelBranch
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [Column("name")]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    [Column("address")]
    [MaxLength(500)]
    public string? Address { get; set; }

    [Column("google_maps_url")]
    [MaxLength(2000)]
    public string? GoogleMapsUrl { get; set; }

    [Column("map_embed_link")]
    [MaxLength(2000)]
    public string? MapEmbedLink { get; set; }

    [Column("map_preview_image_url")]
    [MaxLength(2000)]
    public string? MapPreviewImageUrl { get; set; }

    [Column("google_place_id")]
    [MaxLength(255)]
    public string? GooglePlaceId { get; set; }

    [Column("latitude", TypeName = "decimal(10,8)")]
    public decimal? Latitude { get; set; }

    [Column("longitude", TypeName = "decimal(11,8)")]
    public decimal? Longitude { get; set; }

    [Column("phone")]
    [MaxLength(50)]
    public string? Phone { get; set; }

    [Column("is_main")]
    public bool IsMain { get; set; } = false;

    [Column("is_active")]
    public bool IsActive { get; set; } = true;
}
