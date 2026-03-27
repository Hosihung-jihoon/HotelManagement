using HotelManagement.API.DTOs;

namespace HotelManagement.API.Services;

/// <summary>
/// Interface Service cho ServiceCategory.
/// Service chứa business logic, Controller chỉ gọi Service.
/// </summary>
public interface IServiceCategoryService
{
    Task<IEnumerable<ServiceCategoryDto>> GetAllAsync();
    Task<ServiceCategoryDetailDto?> GetByIdAsync(int id);
    Task<ServiceCategoryDto> CreateAsync(CreateServiceCategoryDto dto);
    Task<bool> UpdateAsync(int id, UpdateServiceCategoryDto dto);
    Task<bool> DeleteAsync(int id);
}
