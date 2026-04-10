using HotelManagement.API.DTOs;
using HotelManagement.API.Models;
using HotelManagement.API.Repositories;

namespace HotelManagement.API.Services;

public class AttractionService : IAttractionService
{
    private readonly IAttractionRepository _repository;

    public AttractionService(IAttractionRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<AttractionDto>> GetAllAsync()
    {
        var entities = await _repository.GetAllAsync();

        return entities.Select(e => new AttractionDto
        {
            Id = e.Id,
            Name = e.Name,
            DistanceKm = e.DistanceKm,
            Description = e.Description,
            MapEmbedLink = e.MapEmbedLink
        });
    }

    public async Task<AttractionDto?> GetByIdAsync(int id)
    {
        var e = await _repository.GetByIdAsync(id);
        if (e == null) return null;

        return new AttractionDto
        {
            Id = e.Id,
            Name = e.Name,
            DistanceKm = e.DistanceKm,
            Description = e.Description,
            MapEmbedLink = e.MapEmbedLink
        };
    }

    public async Task<AttractionDto> CreateAsync(CreateAttractionDto dto)
    {
        var entity = new Attraction
        {
            Name = dto.Name,
            DistanceKm = dto.DistanceKm,
            Description = dto.Description,
            MapEmbedLink = dto.MapEmbedLink
        };

        var created = await _repository.CreateAsync(entity);

        return new AttractionDto
        {
            Id = created.Id,
            Name = created.Name,
            DistanceKm = created.DistanceKm,
            Description = created.Description,
            MapEmbedLink = created.MapEmbedLink
        };
    }

    public async Task<bool> UpdateAsync(int id, UpdateAttractionDto dto)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return false;

        entity.Name = dto.Name;
        entity.DistanceKm = dto.DistanceKm;
        entity.Description = dto.Description;
        entity.MapEmbedLink = dto.MapEmbedLink;

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
