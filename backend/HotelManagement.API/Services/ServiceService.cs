using HotelManagement.API.DTOs;
using HotelManagement.API.Models;
using HotelManagement.API.Repositories;

namespace HotelManagement.API.Services;

/// <summary>
/// Service Service (danh mục dịch vụ).
/// Chứa business logic + mapping Entity <-> DTO.
/// </summary>
public class ServiceService : IServiceService
{
    private readonly IServiceRepository _repository;

    public ServiceService(IServiceRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<ServiceDto>> GetAllAsync()
    {
        var services = await _repository.GetAllWithCategoryAsync();

        return services.Select(s => new ServiceDto
        {
            Id = s.Id,
            CategoryId = s.CategoryId,
            CategoryName = s.Category?.Name,
            Name = s.Name,
            Price = s.Price,
            Unit = s.Unit,
            Description = BuildDescription(s),
            ImageUrl = BuildImageUrl(s)
        });
    }

    public async Task<ServiceDetailDto?> GetByIdAsync(int id)
    {
        var service = await _repository.GetByIdWithCategoryAsync(id);
        if (service == null) return null;

        return new ServiceDetailDto
        {
            Id = service.Id,
            CategoryId = service.CategoryId,
            CategoryName = service.Category?.Name,
            Name = service.Name,
            Price = service.Price,
            Unit = service.Unit,
            Description = BuildDescription(service),
            ImageUrl = BuildImageUrl(service)
        };
    }

    public async Task<ServiceDto> CreateAsync(CreateServiceDto dto)
    {
        var entity = new Service
        {
            CategoryId = dto.CategoryId,
            Name = dto.Name,
            Price = dto.Price,
            Unit = dto.Unit
        };

        var created = await _repository.CreateAsync(entity);

        return new ServiceDto
        {
            Id = created.Id,
            CategoryId = created.CategoryId,
            Name = created.Name,
            Price = created.Price,
            Unit = created.Unit,
            Description = BuildDescription(created),
            ImageUrl = BuildImageUrl(created)
        };
    }

    public async Task<bool> UpdateAsync(int id, UpdateServiceDto dto)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return false;

        entity.CategoryId = dto.CategoryId;
        entity.Name = dto.Name;
        entity.Price = dto.Price;
        entity.Unit = dto.Unit;

        await _repository.UpdateAsync(entity);
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        if (!await _repository.ExistsAsync(id)) return false;

        await _repository.DeleteAsync(id);
        return true;
    }

    private static string BuildDescription(Service service)
    {
        var category = service.Category?.Name?.Trim();
        if (!string.IsNullOrWhiteSpace(category))
        {
            return $"{service.Name} - dich vu thuoc nhom {category.ToLowerInvariant()} tai khach san.";
        }

        return $"{service.Name} - dich vu bo sung danh cho khach luu tru va su dung tai khach san.";
    }

    private static string BuildImageUrl(Service service)
    {
        var key = $"{service.Category?.Name} {service.Name}".ToLowerInvariant();
        if (key.Contains("spa"))
            return "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80";
        if (key.Contains("laundry") || key.Contains("giat"))
            return "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=800&q=80";
        if (key.Contains("breakfast") || key.Contains("restaurant") || key.Contains("dining") || key.Contains("f&b"))
            return "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80";
        if (key.Contains("transfer") || key.Contains("airport") || key.Contains("car"))
            return "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80";
        if (key.Contains("tour"))
            return "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80";
        if (key.Contains("gym") || key.Contains("fitness"))
            return "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80";
        if (key.Contains("pool"))
            return "https://images.unsplash.com/photo-1501117716987-c8c394bb29df?w=800&q=80";
        return "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80";
    }
}
