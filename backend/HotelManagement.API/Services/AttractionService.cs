using HotelManagement.API.DTOs;
using HotelManagement.API.Models;
using HotelManagement.API.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Services;

public class AttractionService : IAttractionService
{
    private readonly IAttractionRepository _repository;
    private readonly HotelManagement.API.Data.HotelDbContext _context;
    private readonly IGoogleMapsMetadataService _googleMapsMetadataService;

    public AttractionService(
        IAttractionRepository repository,
        HotelManagement.API.Data.HotelDbContext context,
        IGoogleMapsMetadataService googleMapsMetadataService)
    {
        _repository = repository;
        _context = context;
        _googleMapsMetadataService = googleMapsMetadataService;
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
            GoogleMapsUrl = e.GoogleMapsUrl,
            MapEmbedLink = e.MapEmbedLink,
            MapPreviewImageUrl = e.MapPreviewImageUrl,
            GooglePlaceId = e.GooglePlaceId,
            Latitude = e.Latitude,
            Longitude = e.Longitude,
            Address = e.Address,
            IsActive = e.IsActive
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
            GoogleMapsUrl = e.GoogleMapsUrl,
            MapEmbedLink = e.MapEmbedLink,
            MapPreviewImageUrl = e.MapPreviewImageUrl,
            GooglePlaceId = e.GooglePlaceId,
            Latitude = e.Latitude,
            Longitude = e.Longitude,
            Address = e.Address,
            IsActive = e.IsActive
        };
    }

    public async Task<AttractionDto> CreateAsync(CreateAttractionDto dto)
    {
        var metadata = await _googleMapsMetadataService.ResolveAsync(dto.GoogleMapsUrl, dto.MapEmbedLink, dto.Name);
        var entity = new Attraction
        {
            Name = dto.Name,
            DistanceKm = dto.DistanceKm,
            Description = dto.Description,
            GoogleMapsUrl = metadata.GoogleMapsUrl ?? dto.GoogleMapsUrl,
            MapEmbedLink = metadata.MapEmbedLink ?? dto.MapEmbedLink,
            MapPreviewImageUrl = metadata.MapPreviewImageUrl,
            GooglePlaceId = metadata.GooglePlaceId,
            Latitude = metadata.Latitude ?? dto.Latitude,
            Longitude = metadata.Longitude ?? dto.Longitude,
            Address = metadata.Address ?? dto.Address,
            IsActive = dto.IsActive ?? true
        };

        entity.DistanceKm = await CalculateNearestDistanceKmAsync(entity.Latitude, entity.Longitude, entity.DistanceKm);

        var created = await _repository.CreateAsync(entity);

        return new AttractionDto
        {
            Id = created.Id,
            Name = created.Name,
            DistanceKm = created.DistanceKm,
            Description = created.Description,
            GoogleMapsUrl = created.GoogleMapsUrl,
            MapEmbedLink = created.MapEmbedLink,
            MapPreviewImageUrl = created.MapPreviewImageUrl,
            GooglePlaceId = created.GooglePlaceId,
            Latitude = created.Latitude,
            Longitude = created.Longitude,
            Address = created.Address,
            IsActive = created.IsActive
        };
    }

    public async Task<bool> UpdateAsync(int id, UpdateAttractionDto dto)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return false;

        var metadata = await _googleMapsMetadataService.ResolveAsync(dto.GoogleMapsUrl, dto.MapEmbedLink, dto.Name);
        entity.Name = dto.Name;
        entity.Description = dto.Description;
        entity.GoogleMapsUrl = metadata.GoogleMapsUrl ?? dto.GoogleMapsUrl;
        entity.MapEmbedLink = metadata.MapEmbedLink ?? dto.MapEmbedLink;
        entity.MapPreviewImageUrl = metadata.MapPreviewImageUrl;
        entity.GooglePlaceId = metadata.GooglePlaceId;
        entity.Latitude = metadata.Latitude ?? dto.Latitude;
        entity.Longitude = metadata.Longitude ?? dto.Longitude;
        entity.Address = metadata.Address ?? dto.Address;
        entity.DistanceKm = await CalculateNearestDistanceKmAsync(entity.Latitude, entity.Longitude, dto.DistanceKm);
        if (dto.IsActive.HasValue) entity.IsActive = dto.IsActive.Value;

        await _repository.UpdateAsync(entity);
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        if (!await _repository.ExistsAsync(id)) return false;

        await _repository.DeleteAsync(id);
        return true;
    }

    private async Task<decimal?> CalculateNearestDistanceKmAsync(decimal? latitude, decimal? longitude, decimal? fallbackDistanceKm)
    {
        if (!latitude.HasValue || !longitude.HasValue)
        {
            return fallbackDistanceKm;
        }

        var branches = await _context.HotelBranches
            .Where(branch => branch.IsActive && branch.Latitude.HasValue && branch.Longitude.HasValue)
            .ToListAsync();

        decimal? nearest = null;
        foreach (var branch in branches)
        {
            var km = HotelBranchService.Haversine(
                (double)branch.Latitude!.Value,
                (double)branch.Longitude!.Value,
                (double)latitude.Value,
                (double)longitude.Value
            );
            var rounded = Math.Round((decimal)km, 2);
            if (!nearest.HasValue || rounded < nearest.Value)
            {
                nearest = rounded;
            }
        }

        return nearest ?? fallbackDistanceKm;
    }
}
