namespace HotelManagement.API.DTOs;

// ========== Response DTOs ==========

/// <summary>
/// DTO trả về danh sách loại phòng (không kèm navigation)
/// </summary>
public class RoomTypeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public int CapacityAdults { get; set; }
    public int CapacityChildren { get; set; }
    public string? Description { get; set; }
    public string? PrimaryImageUrl { get; set; }
}

/// <summary>
/// DTO trả về chi tiết loại phòng (kèm ảnh + tiện nghi)
/// </summary>
public class RoomTypeDetailDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public int CapacityAdults { get; set; }
    public int CapacityChildren { get; set; }
    public string? Description { get; set; }
    public List<RoomImageDto> Images { get; set; } = new();
    public List<AmenityDto> Amenities { get; set; } = new();
    public int TotalRooms { get; set; }
}

public class RoomImageDto
{
    public int Id { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
}

// ========== Request DTOs ==========

/// <summary>
/// DTO để tạo mới hoặc cập nhật loại phòng
/// </summary>
public class CreateRoomTypeDto
{
    public string Name { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public int CapacityAdults { get; set; }
    public int CapacityChildren { get; set; }
    public string? Description { get; set; }
}

public class UpdateRoomTypeDto
{
    public string Name { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public int CapacityAdults { get; set; }
    public int CapacityChildren { get; set; }
    public string? Description { get; set; }
}
