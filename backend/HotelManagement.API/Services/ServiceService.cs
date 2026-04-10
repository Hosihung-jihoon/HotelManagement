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
            Unit = s.Unit
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
            Unit = service.Unit
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
            Unit = created.Unit
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
}
