using HotelManagement.API.DTOs;
using HotelManagement.API.Models;
using HotelManagement.API.Repositories;

namespace HotelManagement.API.Services;

/// <summary>
/// ServiceCategory Service.
/// Chứa business logic + mapping Entity <-> DTO.
/// </summary>
public class ServiceCategoryService : IServiceCategoryService
{
    private readonly IServiceCategoryRepository _repository;

    public ServiceCategoryService(IServiceCategoryRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<ServiceCategoryDto>> GetAllAsync()
    {
        var categories = await _repository.GetAllAsync();

        return categories.Select(c => new ServiceCategoryDto
        {
            Id = c.Id,
            Name = c.Name
        });
    }

    public async Task<ServiceCategoryDetailDto?> GetByIdAsync(int id)
    {
        var category = await _repository.GetByIdWithServicesAsync(id);
        if (category == null) return null;

        return new ServiceCategoryDetailDto
        {
            Id = category.Id,
            Name = category.Name,
            Services = category.Services.Select(s => new ServiceDto
            {
                Id = s.Id,
                CategoryId = s.CategoryId,
                CategoryName = category.Name,
                Name = s.Name,
                Price = s.Price,
                Unit = s.Unit
            }).ToList()
        };
    }

    public async Task<ServiceCategoryDto> CreateAsync(CreateServiceCategoryDto dto)
    {
        var entity = new ServiceCategory
        {
            Name = dto.Name
        };

        var created = await _repository.CreateAsync(entity);

        return new ServiceCategoryDto
        {
            Id = created.Id,
            Name = created.Name
        };
    }

    public async Task<bool> UpdateAsync(int id, UpdateServiceCategoryDto dto)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return false;

        entity.Name = dto.Name;

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
