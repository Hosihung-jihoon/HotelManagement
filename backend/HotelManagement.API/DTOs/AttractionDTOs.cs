namespace HotelManagement.API.DTOs;

public class AttractionDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal? DistanceKm { get; set; }
    public string? Description { get; set; }
    public string? MapEmbedLink { get; set; }
}

public class CreateAttractionDto
{
    public string Name { get; set; } = string.Empty;
    public decimal? DistanceKm { get; set; }
    public string? Description { get; set; }
    public string? MapEmbedLink { get; set; }
}

public class UpdateAttractionDto
{
    public string Name { get; set; } = string.Empty;
    public decimal? DistanceKm { get; set; }
    public string? Description { get; set; }
    public string? MapEmbedLink { get; set; }
}
