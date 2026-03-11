using HotelManagement.API.DTOs;
using HotelManagement.API.Models;
using HotelManagement.API.Repositories;

namespace HotelManagement.API.Services;

/// <summary>
/// RoomType Service - Mẫu cho team copy.
/// Chứa business logic + mapping Entity <-> DTO.
/// </summary>
public class RoomTypeService : IRoomTypeService
{
    private readonly IRoomTypeRepository _repository;

    public RoomTypeService(IRoomTypeRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<RoomTypeDto>> GetAllAsync()
    {
        var roomTypes = await _repository.GetAllWithImagesAsync();

        return roomTypes.Select(rt => new RoomTypeDto
        {
            Id = rt.Id,
            Name = rt.Name,
            BasePrice = rt.BasePrice,
            CapacityAdults = rt.CapacityAdults,
            CapacityChildren = rt.CapacityChildren,
            Description = rt.Description,
            PrimaryImageUrl = rt.RoomImages
                .FirstOrDefault(img => img.IsPrimary == true)?.ImageUrl
        });
    }

    public async Task<RoomTypeDetailDto?> GetByIdAsync(int id)
    {
        var roomType = await _repository.GetByIdWithDetailsAsync(id);
        if (roomType == null) return null;

        return new RoomTypeDetailDto
        {
            Id = roomType.Id,
            Name = roomType.Name,
            BasePrice = roomType.BasePrice,
            CapacityAdults = roomType.CapacityAdults,
            CapacityChildren = roomType.CapacityChildren,
            Description = roomType.Description,
            TotalRooms = roomType.Rooms.Count,
            Images = roomType.RoomImages.Select(img => new RoomImageDto
            {
                Id = img.Id,
                ImageUrl = img.ImageUrl,
                IsPrimary = img.IsPrimary ?? false
            }).ToList(),
            Amenities = roomType.RoomTypeAmenities.Select(rta => new AmenityDto
            {
                Id = rta.Amenity.Id,
                Name = rta.Amenity.Name,
                IconUrl = rta.Amenity.IconUrl
            }).ToList()
        };
    }

    public async Task<RoomTypeDto> CreateAsync(CreateRoomTypeDto dto)
    {
        var entity = new RoomType
        {
            Name = dto.Name,
            BasePrice = dto.BasePrice,
            CapacityAdults = dto.CapacityAdults,
            CapacityChildren = dto.CapacityChildren,
            Description = dto.Description
        };

        var created = await _repository.CreateAsync(entity);

        return new RoomTypeDto
        {
            Id = created.Id,
            Name = created.Name,
            BasePrice = created.BasePrice,
            CapacityAdults = created.CapacityAdults,
            CapacityChildren = created.CapacityChildren,
            Description = created.Description
        };
    }

    public async Task<bool> UpdateAsync(int id, UpdateRoomTypeDto dto)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return false;

        entity.Name = dto.Name;
        entity.BasePrice = dto.BasePrice;
        entity.CapacityAdults = dto.CapacityAdults;
        entity.CapacityChildren = dto.CapacityChildren;
        entity.Description = dto.Description;

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
