using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelManagement.API.Models;

[Table("Attractions")]
public class Attraction
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [Column("name")]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    [Column("name_vi")]
    [MaxLength(255)]
    public string? NameVi { get; set; }

    [Column("description_vi")]
    public string? DescriptionVi { get; set; }

    [Column("distance_km", TypeName = "decimal(5,2)")]
    public decimal? DistanceKm { get; set; }

    [Column("description")]
    public string? Description { get; set; }

    [Column("map_embed_link")]
    public string? MapEmbedLink { get; set; }

    [Column("google_maps_url")]
    [MaxLength(2000)]
    public string? GoogleMapsUrl { get; set; }

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

    [Column("address")]
    [MaxLength(500)]
    public string? Address { get; set; }

    [Column("is_active")]
    public bool? IsActive { get; set; } = true;
}
