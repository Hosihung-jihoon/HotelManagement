using HotelManagement.API.DTOs;
using HotelManagement.API.Models;
using HotelManagement.API.Repositories;
using HotelManagement.API.Data;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Services;

/// <summary>
/// RoomType Service - Mẫu cho team copy.
/// Chứa business logic + mapping Entity <-> DTO.
/// </summary>
public class RoomTypeService : IRoomTypeService
{
    private readonly IRoomTypeRepository _repository;
    private readonly ICloudinaryService _cloudinaryService;
    private readonly HotelDbContext _context;

    public RoomTypeService(IRoomTypeRepository repository, ICloudinaryService cloudinaryService, HotelDbContext context)
    {
        _repository = repository;
        _cloudinaryService = cloudinaryService;
        _context = context;
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
            SizeSqm = rt.SizeSqm,
            Description = rt.Description,
            PrimaryImageUrl = rt.RoomImages
                .FirstOrDefault(img => img.IsActive != false && img.IsPrimary == true)?.ImageUrl
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
            SizeSqm = roomType.SizeSqm,
            Description = roomType.Description,
            TotalRooms = roomType.Rooms.Count,
            Images = roomType.RoomImages
                .Where(img => img.IsActive != false)
                .Select(img => new RoomImageDto
            {
                Id = img.Id,
                ImageUrl = img.ImageUrl,
                IsPrimary = img.IsPrimary ?? false
            }).ToList(),
            AmenityIds = roomType.RoomTypeAmenities.Select(rta => rta.AmenityId).ToList(),
            Amenities = roomType.RoomTypeAmenities.Select(rta => new AmenityDto
            {
                Id = rta.Amenity.Id,
                Name = rta.Amenity.Name,
                IconUrl = rta.Amenity.IconUrl
            }).ToList(),
            RecommendedServiceIds = roomType.RoomTypeServices.Select(rts => rts.ServiceId).ToList(),
            RecommendedServices = roomType.RoomTypeServices.Select(rts => new ServiceDto
            {
                Id = rts.Service.Id,
                CategoryId = rts.Service.CategoryId,
                CategoryName = rts.Service.Category?.Name,
                Name = rts.Service.Name,
                Price = rts.Service.Price,
                Unit = rts.Service.Unit
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
            SizeSqm = dto.SizeSqm,
            Description = dto.Description
        };

        var created = await _repository.CreateAsync(entity);
        await SyncAmenitiesAsync(created.Id, dto.AmenityIds);
        await SyncRecommendedServicesAsync(created.Id, dto.RecommendedServiceIds);

        return new RoomTypeDto
        {
            Id = created.Id,
            Name = created.Name,
            BasePrice = created.BasePrice,
            CapacityAdults = created.CapacityAdults,
            CapacityChildren = created.CapacityChildren,
            SizeSqm = created.SizeSqm,
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
        entity.SizeSqm = dto.SizeSqm;
        entity.Description = dto.Description;

        await _repository.UpdateAsync(entity);
        await SyncAmenitiesAsync(id, dto.AmenityIds);
        await SyncRecommendedServicesAsync(id, dto.RecommendedServiceIds);
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        if (!await _repository.ExistsAsync(id)) return false;

        await _repository.DeleteAsync(id);
        return true;
    }

    public async Task<List<RoomImageDto>> UploadImagesAsync(UploadRoomTypeImagesDto dto)
    {
        var uploadedImages = new List<RoomImageDto>();
        var roomType = await _repository.GetByIdAsync(dto.RoomTypeId);
        if (roomType == null) return uploadedImages;

        if (dto.ReplaceExisting)
        {
            var existingImages = await _repository.GetImagesByRoomTypeIdAsync(dto.RoomTypeId);
            foreach (var existingImage in existingImages)
            {
                existingImage.IsActive = false;
                existingImage.IsPrimary = false;
            }
            if (existingImages.Count > 0)
            {
                await _repository.UpdateImagesAsync(existingImages);
            }
        }

        foreach (var file in dto.Images)
        {
            var url = await _cloudinaryService.UploadImageAsync(file);
            if (!string.IsNullOrEmpty(url))
            {
                var imageEntity = new RoomImage
                {
                    RoomTypeId = dto.RoomTypeId,
                    ImageUrl = url,
                    IsPrimary = false,
                    IsActive = true
                };
                await _repository.AddImageAsync(imageEntity);

                uploadedImages.Add(new RoomImageDto
                {
                    Id = imageEntity.Id,
                    ImageUrl = imageEntity.ImageUrl,
                    IsPrimary = false
                });
            }
        }
        return uploadedImages;
    }

    public async Task<(bool success, string? error)> SetPrimaryImageAsync(SetPrimaryImageDto dto)
    {
        var image = await _repository.GetImageByIdAsync(dto.ImageId);
        if (image == null || image.RoomTypeId != dto.RoomTypeId) 
            return (false, "Không tìm thấy ảnh hoặc ảnh không thuộc loại phòng này.");

        var images = (await _repository.GetImagesByRoomTypeIdAsync(dto.RoomTypeId))
            .Where(img => img.IsActive != false)
            .ToList();
        
        foreach(var img in images)
        {
            if (img.Id == dto.ImageId)
            {
                img.IsPrimary = true;
            }
            else
            {
                img.IsPrimary = false;
            }
            await _repository.UpdateImageAsync(img);
        }

        return (true, null);
    }

    private async Task SyncAmenitiesAsync(int roomTypeId, IEnumerable<int>? amenityIds)
    {
        var ids = (amenityIds ?? Enumerable.Empty<int>()).Distinct().ToHashSet();
        var current = await _context.RoomTypeAmenities.Where(item => item.RoomTypeId == roomTypeId).ToListAsync();
        var toRemove = current.Where(item => !ids.Contains(item.AmenityId)).ToList();
        if (toRemove.Count > 0)
        {
            _context.RoomTypeAmenities.RemoveRange(toRemove);
        }

        var currentIds = current.Select(item => item.AmenityId).ToHashSet();
        var toAdd = ids.Where(id => !currentIds.Contains(id))
            .Select(id => new RoomTypeAmenity { RoomTypeId = roomTypeId, AmenityId = id });
        await _context.RoomTypeAmenities.AddRangeAsync(toAdd);
        await _context.SaveChangesAsync();
    }

    private async Task SyncRecommendedServicesAsync(int roomTypeId, IEnumerable<int>? serviceIds)
    {
        var ids = (serviceIds ?? Enumerable.Empty<int>()).Distinct().ToHashSet();
        var current = await _context.RoomTypeServices.Where(item => item.RoomTypeId == roomTypeId).ToListAsync();
        var toRemove = current.Where(item => !ids.Contains(item.ServiceId)).ToList();
        if (toRemove.Count > 0)
        {
            _context.RoomTypeServices.RemoveRange(toRemove);
        }

        var currentIds = current.Select(item => item.ServiceId).ToHashSet();
        var toAdd = ids.Where(id => !currentIds.Contains(id))
            .Select(id => new HotelManagement.API.Models.RoomTypeService { RoomTypeId = roomTypeId, ServiceId = id });
        await _context.RoomTypeServices.AddRangeAsync(toAdd);
        await _context.SaveChangesAsync();
    }
}
