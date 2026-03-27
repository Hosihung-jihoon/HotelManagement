using HotelManagement.API.DTOs;
using HotelManagement.API.Models;
using HotelManagement.API.Repositories;

namespace HotelManagement.API.Services;

public class RoomInventoryService : IRoomInventoryService
{
    private readonly IRoomInventoryRepository _repository;

    public RoomInventoryService(IRoomInventoryRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<RoomInventoryDto>> GetAllAsync()
    {
        var entities = await _repository.GetAllAsync();

        return entities.Select(e => new RoomInventoryDto
        {
            Id = e.Id,
            RoomId = e.RoomId,
            ItemName = e.ItemName,
            Quantity = e.Quantity,
            PriceIfLost = e.PriceIfLost
        });
    }

    public async Task<RoomInventoryDto?> GetByIdAsync(int id)
    {
        var e = await _repository.GetByIdAsync(id);
        if (e == null) return null;

        return new RoomInventoryDto
        {
            Id = e.Id,
            RoomId = e.RoomId,
            ItemName = e.ItemName,
            Quantity = e.Quantity,
            PriceIfLost = e.PriceIfLost
        };
    }

    public async Task<IEnumerable<RoomInventoryDto>> GetByRoomIdAsync(int roomId)
    {
        var entities = await _repository.GetByRoomIdAsync(roomId);

        return entities.Select(e => new RoomInventoryDto
        {
            Id = e.Id,
            RoomId = e.RoomId,
            ItemName = e.ItemName,
            Quantity = e.Quantity,
            PriceIfLost = e.PriceIfLost
        });
    }

    public async Task<RoomInventoryDto> CreateAsync(CreateRoomInventoryDto dto)
    {
        var entity = new RoomInventory
        {
            RoomId = dto.RoomId,
            ItemName = dto.ItemName,
            Quantity = dto.Quantity,
            PriceIfLost = dto.PriceIfLost
        };

        var created = await _repository.CreateAsync(entity);

        return new RoomInventoryDto
        {
            Id = created.Id,
            RoomId = created.RoomId,
            ItemName = created.ItemName,
            Quantity = created.Quantity,
            PriceIfLost = created.PriceIfLost
        };
    }

    public async Task<bool> UpdateAsync(int id, UpdateRoomInventoryDto dto)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return false;

        entity.RoomId = dto.RoomId;
        entity.ItemName = dto.ItemName;
        entity.Quantity = dto.Quantity;
        entity.PriceIfLost = dto.PriceIfLost;

        await _repository.UpdateAsync(entity);
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        if (!await _repository.ExistsAsync(id)) return false;

        await _repository.DeleteAsync(id);
        return true;
    }

    public async Task<bool> CloneAsync(int fromRoomId, int toRoomId)
    {
        // 1. Get all items from the master room
        var sourceItems = await _repository.GetByRoomIdAsync(fromRoomId);
        if (!sourceItems.Any()) return false;

        // 2. Map to new instances targeting the new room
        var clonedItems = sourceItems.Select(item => new RoomInventory
        {
            RoomId = toRoomId,
            ItemName = item.ItemName,
            Quantity = item.Quantity,
            PriceIfLost = item.PriceIfLost
        }).ToList();

        // 3. Save all newly cloned items
        await _repository.CreateRangeAsync(clonedItems);

        return true;
    }
}
