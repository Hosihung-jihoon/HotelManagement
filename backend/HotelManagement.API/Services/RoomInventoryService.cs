using HotelManagement.API.Data;
using HotelManagement.API.DTOs;
using HotelManagement.API.Models;
using HotelManagement.API.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Services;

public class RoomInventoryService : IRoomInventoryService
{
    private readonly IRoomInventoryRepository _repository;
    private readonly HotelDbContext _db;

    public RoomInventoryService(IRoomInventoryRepository repository, HotelDbContext db)
    {
        _repository = repository;
        _db = db;
    }

    private static RoomInventoryDto ToDto(RoomInventory e) => new()
    {
        Id              = e.Id,
        RoomId          = e.RoomId,
        RoomNumber      = e.Room?.RoomNumber,
        ItemName        = e.ItemName,
        Unit            = e.Unit,
        Quantity        = e.Quantity,
        QuantityInUse   = e.QuantityInUse,
        QuantityDamaged = e.QuantityDamaged,
        PriceIfLost     = e.PriceIfLost,
        ImageUrl        = e.ImageUrl,
        Note            = e.Note,
        ItemType        = e.ItemType,
    };

    public async Task<IEnumerable<RoomInventoryDto>> GetAllAsync()
    {
        var entities = await _db.Set<RoomInventory>()
            .Include(e => e.Room)
            .OrderBy(e => e.ItemName)
            .ToListAsync();

        return entities.Select(ToDto);
    }

    public async Task<RoomInventoryDto?> GetByIdAsync(int id)
    {
        var e = await _db.Set<RoomInventory>()
            .Include(e => e.Room)
            .FirstOrDefaultAsync(e => e.Id == id);
        return e == null ? null : ToDto(e);
    }

    public async Task<IEnumerable<RoomInventoryDto>> GetByRoomIdAsync(int roomId)
    {
        var entities = await _db.Set<RoomInventory>()
            .Include(e => e.Room)
            .Where(e => e.RoomId == roomId)
            .ToListAsync();
        return entities.Select(ToDto);
    }

    public async Task<RoomInventoryDto> CreateAsync(CreateRoomInventoryDto dto)
    {
        var entity = new RoomInventory
        {
            RoomId          = dto.RoomId,
            ItemName        = dto.ItemName,
            Unit            = dto.Unit,
            Quantity        = dto.Quantity,
            QuantityInUse   = dto.QuantityInUse,
            QuantityDamaged = dto.QuantityDamaged,
            PriceIfLost     = dto.PriceIfLost,
            ImageUrl        = dto.ImageUrl,
            Note            = dto.Note,
            ItemType        = dto.ItemType,
        };

        var created = await _repository.CreateAsync(entity);
        // reload with Room nav
        return (await GetByIdAsync(created.Id))!;
    }

    public async Task<bool> UpdateAsync(int id, UpdateRoomInventoryDto dto)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return false;

        var originalName = entity.ItemName;

        entity.RoomId          = dto.RoomId;
        entity.ItemName        = dto.ItemName;
        entity.Unit            = dto.Unit;
        entity.Quantity        = dto.Quantity;
        entity.QuantityInUse   = dto.QuantityInUse;
        entity.QuantityDamaged = dto.QuantityDamaged;
        entity.PriceIfLost     = dto.PriceIfLost;
        entity.ImageUrl        = dto.ImageUrl;
        entity.Note            = dto.Note;
        entity.ItemType        = dto.ItemType;

        await _repository.UpdateAsync(entity);

        // Sync shared properties across all instances of this item in other rooms
        var relatedItems = await _db.Set<RoomInventory>()
            .Where(r => r.Id != id && (r.ItemName == originalName || r.ItemName == dto.ItemName))
            .ToListAsync();
            
        foreach(var item in relatedItems)
        {
            item.ItemName = dto.ItemName;
            item.ImageUrl = dto.ImageUrl;
            item.Unit = dto.Unit;
            item.PriceIfLost = dto.PriceIfLost;
            item.ItemType = dto.ItemType;
        }

        if(relatedItems.Any())
        {
            await _db.SaveChangesAsync();
        }

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
        var sourceItems = await _repository.GetByRoomIdAsync(fromRoomId);
        if (!sourceItems.Any()) return false;

        var clonedItems = sourceItems.Select(item => new RoomInventory
        {
            RoomId          = toRoomId,
            ItemName        = item.ItemName,
            Unit            = item.Unit,
            Quantity        = item.Quantity,
            QuantityInUse   = 0,
            QuantityDamaged = 0,
            PriceIfLost     = item.PriceIfLost,
            ImageUrl        = item.ImageUrl,
            ItemType        = item.ItemType,
        }).ToList();

        await _repository.CreateRangeAsync(clonedItems);
        return true;
    }
}

