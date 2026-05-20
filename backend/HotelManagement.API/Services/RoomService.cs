using HotelManagement.API.DTOs;
using HotelManagement.API.Helpers;
using HotelManagement.API.Models;
using HotelManagement.API.Repositories;

namespace HotelManagement.API.Services;

/// <summary>
/// Room service: room business rules and DTO mapping.
/// </summary>
public class RoomService : IRoomService
{
    private readonly IRoomRepository _repository;

    public RoomService(IRoomRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<RoomDto>> GetAllAsync()
    {
        var rooms = await _repository.GetAllWithRoomTypeAsync();

        return rooms.Select(r => new RoomDto
        {
            Id = r.Id,
            RoomNumber = r.RoomNumber,
            Floor = r.Floor,
            Status = RoomStateHelper.NormalizeBusinessStatus(r.Status),
            CleanStatus = RoomStateHelper.NormalizeCleanStatus(r.CleanStatus),
            RoomTypeId = r.RoomTypeId,
            RoomTypeName = r.RoomType?.Name,
            PricePerNight = r.RoomType?.BasePrice,
            CapacityAdults = r.RoomType?.CapacityAdults,
            CapacityChildren = r.RoomType?.CapacityChildren,
            SizeSqm = r.RoomType?.SizeSqm,
            ThumbnailUrl = r.RoomType?.RoomImages.FirstOrDefault(img => img.IsActive != false && img.IsPrimary == true)?.ImageUrl
        });
    }

    public async Task<RoomDetailDto?> GetByIdAsync(int id)
    {
        var room = await _repository.GetByIdWithDetailsAsync(id);
        if (room == null) return null;

        return new RoomDetailDto
        {
            Id = room.Id,
            RoomNumber = room.RoomNumber,
            Floor = room.Floor,
            Status = RoomStateHelper.NormalizeBusinessStatus(room.Status),
            CleanStatus = RoomStateHelper.NormalizeCleanStatus(room.CleanStatus),
            RoomTypeId = room.RoomTypeId,
            RoomTypeName = room.RoomType?.Name,
            BasePrice = room.RoomType?.BasePrice,
            CapacityAdults = room.RoomType?.CapacityAdults,
            CapacityChildren = room.RoomType?.CapacityChildren,
            SizeSqm = room.RoomType?.SizeSqm,
            RoomTypeDescription = room.RoomType?.Description,
            ThumbnailUrl = room.RoomType?.RoomImages.FirstOrDefault(img => img.IsActive != false && img.IsPrimary == true)?.ImageUrl
        };
    }

    public async Task<(RoomDto? result, string? error)> CreateAsync(CreateRoomDto dto)
    {
        if (await _repository.RoomNumberExistsAsync(dto.RoomNumber))
            return (null, $"So phong '{dto.RoomNumber}' da ton tai.");

        if (!RoomStateHelper.IsSupportedBusinessStatus(dto.Status))
            return (null, "Trang thai kinh doanh khong hop le.");

        if (!RoomStateHelper.TryNormalizeCleanStatus(dto.CleanStatus, out var normalizedCleanStatus))
            return (null, "Trang thai ve sinh khong hop le.");

        var entity = new Room
        {
            RoomNumber = dto.RoomNumber,
            Floor = dto.Floor,
            Status = RoomStateHelper.NormalizeBusinessStatus(dto.Status),
            CleanStatus = normalizedCleanStatus,
            RoomTypeId = dto.RoomTypeId
        };

        var created = await _repository.CreateAsync(entity);

        var result = new RoomDto
        {
            Id = created.Id,
            RoomNumber = created.RoomNumber,
            Floor = created.Floor,
            Status = RoomStateHelper.NormalizeBusinessStatus(created.Status),
            CleanStatus = RoomStateHelper.NormalizeCleanStatus(created.CleanStatus),
            RoomTypeId = created.RoomTypeId
        };

        return (result, null);
    }

    public async Task<(bool success, string? error)> UpdateAsync(int id, UpdateRoomDto dto)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return (false, null);

        if (await _repository.RoomNumberExistsAsync(dto.RoomNumber, excludeId: id))
            return (false, $"So phong '{dto.RoomNumber}' da duoc dung boi phong khac.");

        if (!RoomStateHelper.IsSupportedBusinessStatus(dto.Status))
            return (false, "Trang thai kinh doanh khong hop le.");

        if (!RoomStateHelper.TryNormalizeCleanStatus(dto.CleanStatus, out var normalizedCleanStatus))
            return (false, "Trang thai ve sinh khong hop le.");

        entity.RoomNumber = dto.RoomNumber;
        entity.Floor = dto.Floor;
        entity.Status = RoomStateHelper.NormalizeBusinessStatus(dto.Status);
        entity.CleanStatus = normalizedCleanStatus;
        entity.RoomTypeId = dto.RoomTypeId;

        await _repository.UpdateAsync(entity);
        return (true, null);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        if (!await _repository.ExistsAsync(id)) return false;

        await _repository.DeleteAsync(id);
        return true;
    }

    public async Task<(List<RoomDto> created, string? error)> BulkCreateAsync(BulkCreateRoomDto dto)
    {
        var createdRooms = new List<RoomDto>();
        var prefix = string.IsNullOrEmpty(dto.Prefix) ? dto.Floor.ToString() : dto.Prefix;
        var baseIndex = 1;

        for (var i = 0; i < dto.NumberOfRooms; i++)
        {
            string roomNumber;
            while (true)
            {
                roomNumber = $"{prefix}{(baseIndex < 10 ? "0" : "")}{baseIndex}";
                if (!await _repository.RoomNumberExistsAsync(roomNumber))
                    break;
                baseIndex++;
            }

            var entity = new Room
            {
                RoomNumber = roomNumber,
                Floor = dto.Floor,
                Status = RoomStateHelper.StatusAvailable,
                CleanStatus = RoomStateHelper.CleanClean,
                RoomTypeId = dto.RoomTypeId
            };

            var created = await _repository.CreateAsync(entity);
            createdRooms.Add(new RoomDto
            {
                Id = created.Id,
                RoomNumber = created.RoomNumber,
                Floor = created.Floor,
                Status = RoomStateHelper.NormalizeBusinessStatus(created.Status),
                CleanStatus = RoomStateHelper.NormalizeCleanStatus(created.CleanStatus),
                RoomTypeId = created.RoomTypeId
            });
            baseIndex++;
        }

        return (createdRooms, null);
    }

    public async Task<(bool success, string? error)> UpdateStatusAsync(UpdateBlockRoomStatusDto dto)
    {
        var entity = await _repository.GetByIdAsync(dto.RoomId);
        if (entity == null) return (false, null);

        if (!RoomStateHelper.IsSupportedBusinessStatus(dto.Status))
            return (false, "Trang thai kinh doanh khong hop le.");

        entity.Status = RoomStateHelper.NormalizeBusinessStatus(dto.Status);
        await _repository.UpdateAsync(entity);
        return (true, null);
    }

    public async Task<(bool success, string? error)> UpdateCleanStatusAsync(UpdateRoomCleanStatusDto dto)
    {
        var entity = await _repository.GetByIdAsync(dto.RoomId);
        if (entity == null) return (false, null);

        var currentBusinessStatus = RoomStateHelper.NormalizeBusinessStatus(entity.Status);
        if (currentBusinessStatus == RoomStateHelper.StatusOccupied)
            return (false, "Khong the doi trang thai ve sinh khi phong dang co khach.");

        if (currentBusinessStatus == RoomStateHelper.StatusMaintenance)
            return (false, "Khong the doi trang thai ve sinh khi phong dang bao tri.");

        if (!RoomStateHelper.TryNormalizeCleanStatus(dto.CleanStatus, out var normalizedCleanStatus))
            return (false, "Trang thai ve sinh khong hop le.");

        entity.CleanStatus = normalizedCleanStatus;

        await _repository.UpdateAsync(entity);
        return (true, null);
    }
}
