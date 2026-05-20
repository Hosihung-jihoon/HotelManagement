namespace HotelManagement.API.DTOs;

public class HotelBranchDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? GoogleMapsUrl { get; set; }
    public string? MapEmbedLink { get; set; }
    public string? MapPreviewImageUrl { get; set; }
    public string? GooglePlaceId { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public string? Phone { get; set; }
    public bool IsMain { get; set; }
    public bool IsActive { get; set; }
}

public class CreateHotelBranchDto
{
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? GoogleMapsUrl { get; set; }
    public string? MapEmbedLink { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public string? Phone { get; set; }
    public bool IsMain { get; set; } = false;
    public bool IsActive { get; set; } = true;
}

public class UpdateHotelBranchDto
{
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? GoogleMapsUrl { get; set; }
    public string? MapEmbedLink { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public string? Phone { get; set; }
    public bool IsMain { get; set; }
    public bool IsActive { get; set; }
}

public class AttractionDistanceDto
{
    public int AttractionId { get; set; }
    public string AttractionName { get; set; } = string.Empty;
    public List<BranchDistanceItem> Distances { get; set; } = new();
    public decimal? NearestDistanceKm { get; set; }
    public string? NearestBranchName { get; set; }
    public bool Updated { get; set; }
    public string? SkipReason { get; set; }
}

public class BranchDistanceItem
{
    public int BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public decimal? DistanceKm { get; set; }
}
