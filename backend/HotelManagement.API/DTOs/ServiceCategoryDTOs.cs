namespace HotelManagement.API.DTOs;

// ========== Response DTOs ==========

/// <summary>
/// DTO trả về thông tin phân loại dịch vụ
/// </summary>
public class ServiceCategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

/// <summary>
/// DTO trả về chi tiết phân loại dịch vụ kèm danh sách dịch vụ
/// </summary>
public class ServiceCategoryDetailDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<ServiceDto> Services { get; set; } = new();
}

// ========== Request DTOs ==========

/// <summary>
/// DTO để tạo mới phân loại dịch vụ
/// </summary>
public class CreateServiceCategoryDto
{
    public string Name { get; set; } = string.Empty;
}

/// <summary>
/// DTO để cập nhật phân loại dịch vụ
/// </summary>
public class UpdateServiceCategoryDto
{
    public string Name { get; set; } = string.Empty;
}
