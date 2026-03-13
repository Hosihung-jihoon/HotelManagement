using HotelManagement.API.DTOs;
using HotelManagement.API.Models;
using HotelManagement.API.Repositories;

namespace HotelManagement.API.Services;

/// <summary>
/// Room Service - Chứa business logic + mapping Entity &lt;-&gt; DTO.
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
            Status = r.Status,
            RoomTypeId = r.RoomTypeId,
            RoomTypeName = r.RoomType?.Name
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
            Status = room.Status,
            RoomTypeId = room.RoomTypeId,
            RoomTypeName = room.RoomType?.Name,
            BasePrice = room.RoomType?.BasePrice,
            CapacityAdults = room.RoomType?.CapacityAdults,
            CapacityChildren = room.RoomType?.CapacityChildren,
            RoomTypeDescription = room.RoomType?.Description
        };
    }

    public async Task<(RoomDto? result, string? error)> CreateAsync(CreateRoomDto dto)
    {
        // Business validation: số phòng không được trùng
        if (await _repository.RoomNumberExistsAsync(dto.RoomNumber))
            return (null, $"Số phòng '{dto.RoomNumber}' đã tồn tại.");

        var entity = new Room
        {
            RoomNumber = dto.RoomNumber,
            Floor = dto.Floor,
            Status = dto.Status ?? "Available",
            RoomTypeId = dto.RoomTypeId
        };

        var created = await _repository.CreateAsync(entity);

        var result = new RoomDto
        {
            Id = created.Id,
            RoomNumber = created.RoomNumber,
            Floor = created.Floor,
            Status = created.Status,
            RoomTypeId = created.RoomTypeId
        };

        return (result, null);
    }

    public async Task<(bool success, string? error)> UpdateAsync(int id, UpdateRoomDto dto)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return (false, null);

        // Business validation: số phòng không được trùng với phòng khác
        if (await _repository.RoomNumberExistsAsync(dto.RoomNumber, excludeId: id))
            return (false, $"Số phòng '{dto.RoomNumber}' đã được dùng bởi phòng khác.");

        entity.RoomNumber = dto.RoomNumber;
        entity.Floor = dto.Floor;
        entity.Status = dto.Status;
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
}
