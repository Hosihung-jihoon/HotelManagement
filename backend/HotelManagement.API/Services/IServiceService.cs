using HotelManagement.API.DTOs;

namespace HotelManagement.API.Services;

/// <summary>
/// Interface Service cho Service (danh mục dịch vụ).
/// Service chứa business logic, Controller chỉ gọi Service.
/// </summary>
public interface IServiceService
{
    Task<IEnumerable<ServiceDto>> GetAllAsync();
    Task<ServiceDetailDto?> GetByIdAsync(int id);
    Task<ServiceDto> CreateAsync(CreateServiceDto dto);
    Task<bool> UpdateAsync(int id, UpdateServiceDto dto);
    Task<bool> DeleteAsync(int id);
}
