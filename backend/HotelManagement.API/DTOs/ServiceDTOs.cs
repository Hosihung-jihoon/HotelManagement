namespace HotelManagement.API.DTOs;

// ========== Response DTOs ==========

/// <summary>
/// DTO trả về danh sách dịch vụ (kèm tên phân loại)
/// </summary>
public class ServiceDto
{
    public int Id { get; set; }
    public int? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? Unit { get; set; }
}

/// <summary>
/// DTO trả về chi tiết dịch vụ
/// </summary>
public class ServiceDetailDto
{
    public int Id { get; set; }
    public int? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? Unit { get; set; }
}

// ========== Request DTOs ==========

/// <summary>
/// DTO để tạo mới dịch vụ
/// </summary>
public class CreateServiceDto
{
    public int? CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? Unit { get; set; }
}

/// <summary>
/// DTO để cập nhật dịch vụ
/// </summary>
public class UpdateServiceDto
{
    public int? CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? Unit { get; set; }
}
