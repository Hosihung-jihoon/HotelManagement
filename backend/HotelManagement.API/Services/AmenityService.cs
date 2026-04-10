using HotelManagement.API.DTOs;
using HotelManagement.API.Models;
using HotelManagement.API.Repositories;

namespace HotelManagement.API.Services;

/// <summary>
/// Amenity Service.
/// Chứa business logic + mapping Entity <-> DTO.
/// DeleteAsync sử dụng cơ chế Soft Delete (IsDeleted = true).
/// </summary>
public class AmenityService : IAmenityService
{
    private readonly IAmenityRepository _repository;

    public AmenityService(IAmenityRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<AmenityDto>> GetAllAsync()
    {
        var amenities = await _repository.GetAllAsync();

        return amenities.Select(a => new AmenityDto
        {
            Id = a.Id,
            Name = a.Name,
            IconUrl = a.IconUrl
        });
    }

    public async Task<AmenityDto?> GetByIdAsync(int id)
    {
        var amenity = await _repository.GetByIdAsync(id);
        if (amenity == null) return null;

        return new AmenityDto
        {
            Id = amenity.Id,
            Name = amenity.Name,
            IconUrl = amenity.IconUrl
        };
    }

    public async Task<AmenityDto> CreateAsync(CreateAmenityDto dto)
    {
        var entity = new Amenity
        {
            Name = dto.Name,
            IconUrl = dto.IconUrl
        };

        var created = await _repository.CreateAsync(entity);

        return new AmenityDto
        {
            Id = created.Id,
            Name = created.Name,
            IconUrl = created.IconUrl
        };
    }

    public async Task<bool> UpdateAsync(int id, UpdateAmenityDto dto)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return false;

        entity.Name = dto.Name;
        entity.IconUrl = dto.IconUrl;

        await _repository.UpdateAsync(entity);
        return true;
    }

    /// <summary>
    /// Xóa mềm tiện nghi (IsDeleted = true)
    /// </summary>
    public async Task<bool> DeleteAsync(int id)
    {
        return await _repository.SoftDeleteAsync(id);
    }
}
