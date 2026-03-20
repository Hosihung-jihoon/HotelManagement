namespace HotelManagement.API.DTOs;

// ========== Response DTOs ==========

/// <summary>
/// DTO trả về thông tin tiện nghi
/// </summary>
public class AmenityDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? IconUrl { get; set; }
}

// ========== Request DTOs ==========

/// <summary>
/// DTO để tạo mới tiện nghi
/// </summary>
public class CreateAmenityDto
{
    public string Name { get; set; } = string.Empty;
    public string? IconUrl { get; set; }
}

/// <summary>
/// DTO để cập nhật tiện nghi
/// </summary>
public class UpdateAmenityDto
{
    public string Name { get; set; } = string.Empty;
    public string? IconUrl { get; set; }
}
