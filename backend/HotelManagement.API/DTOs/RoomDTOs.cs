namespace HotelManagement.API.DTOs;

// ========== Response DTOs ==========

/// <summary>
/// DTO trả về danh sách phòng (kèm tên loại phòng)
/// </summary>
public class RoomDto
{
    public int Id { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public int? Floor { get; set; }
    public string? Status { get; set; }
    public int? RoomTypeId { get; set; }
    public string? RoomTypeName { get; set; }
}

/// <summary>
/// DTO trả về chi tiết 1 phòng (kèm thông tin loại phòng đầy đủ)
/// </summary>
public class RoomDetailDto
{
    public int Id { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public int? Floor { get; set; }
    public string? Status { get; set; }
    public int? RoomTypeId { get; set; }
    public string? RoomTypeName { get; set; }
    public decimal? BasePrice { get; set; }
    public int? CapacityAdults { get; set; }
    public int? CapacityChildren { get; set; }
    public string? RoomTypeDescription { get; set; }
}

// ========== Request DTOs ==========

/// <summary>
/// DTO để tạo phòng mới
/// </summary>
public class CreateRoomDto
{
    public string RoomNumber { get; set; } = string.Empty;
    public int? Floor { get; set; }
    public string? Status { get; set; } = "Available";
    public int? RoomTypeId { get; set; }
}

/// <summary>
/// DTO để cập nhật phòng
/// </summary>
public class UpdateRoomDto
{
    public string RoomNumber { get; set; } = string.Empty;
    public int? Floor { get; set; }
    public string? Status { get; set; }
    public int? RoomTypeId { get; set; }
}
