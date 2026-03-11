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

    [Column("distance_km", TypeName = "decimal(5,2)")]
    public decimal? DistanceKm { get; set; }

    [Column("description")]
    public string? Description { get; set; }

    [Column("map_embed_link")]
    public string? MapEmbedLink { get; set; }
}
