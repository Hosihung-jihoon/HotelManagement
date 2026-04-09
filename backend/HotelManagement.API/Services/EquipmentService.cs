using HotelManagement.API.Data;
using HotelManagement.API.DTOs;
using HotelManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Services;

public interface IEquipmentService
{
    Task<IEnumerable<EquipmentDto>> GetAllAsync();
    Task<EquipmentDto?> GetByIdAsync(int id);
    Task<EquipmentDto> CreateAsync(CreateEquipmentDto dto);
    Task<bool> UpdateAsync(int id, UpdateEquipmentDto dto);
    Task<bool> DeleteAsync(int id);
}

public class EquipmentService : IEquipmentService
{
    private readonly HotelDbContext _db;

    public EquipmentService(HotelDbContext db)
    {
        _db = db;
    }

    private EquipmentDto ToDto(Equipment e) => new()
    {
        Id = e.Id,
        ItemCode = e.ItemCode,
        Name = e.Name,
        Category = e.Category,
        Unit = e.Unit,
        TotalQuantity = e.TotalQuantity,
        InUseQuantity = e.InUseQuantity,
        DamagedQuantity = e.DamagedQuantity,
        LiquidatedQuantity = e.LiquidatedQuantity,
        InStockQuantity = e.InStockQuantity,
        BasePrice = e.BasePrice,
        DefaultPriceIfLost = e.DefaultPriceIfLost,
        Supplier = e.Supplier,
        IsActive = e.IsActive,
        ImageUrl = e.ImageUrl,
        CreatedAt = e.CreatedAt,
        UpdatedAt = e.UpdatedAt
    };

    public async Task<IEnumerable<EquipmentDto>> GetAllAsync()
    {
        var list = await _db.Equipments.OrderByDescending(e => e.Id).ToListAsync();
        return list.Select(ToDto);
    }

    public async Task<EquipmentDto?> GetByIdAsync(int id)
    {
        var e = await _db.Equipments.FindAsync(id);
        return e == null ? null : ToDto(e);
    }

    public async Task<EquipmentDto> CreateAsync(CreateEquipmentDto dto)
    {
        var e = new Equipment
        {
            ItemCode = dto.ItemCode,
            Name = dto.Name,
            Category = dto.Category,
            Unit = dto.Unit,
            TotalQuantity = dto.TotalQuantity,
            InUseQuantity = 0,
            DamagedQuantity = 0,
            LiquidatedQuantity = 0,
            InStockQuantity = dto.TotalQuantity,
            BasePrice = dto.BasePrice,
            DefaultPriceIfLost = dto.DefaultPriceIfLost,
            Supplier = dto.Supplier,
            ImageUrl = dto.ImageUrl,
            IsActive = true,
            CreatedAt = DateTime.Now
        };

        _db.Equipments.Add(e);
        await _db.SaveChangesAsync();
        return ToDto(e);
    }

    public async Task<bool> UpdateAsync(int id, UpdateEquipmentDto dto)
    {
        var e = await _db.Equipments.FindAsync(id);
        if (e == null) return false;

        e.ItemCode = dto.ItemCode;
        e.Name = dto.Name;
        e.Category = dto.Category;
        e.Unit = dto.Unit;
        e.TotalQuantity = dto.TotalQuantity;
        e.InUseQuantity = dto.InUseQuantity;
        e.DamagedQuantity = dto.DamagedQuantity;
        e.LiquidatedQuantity = dto.LiquidatedQuantity;
        e.InStockQuantity = (dto.TotalQuantity ?? 0) - (dto.InUseQuantity ?? 0) - (dto.DamagedQuantity ?? 0) - (dto.LiquidatedQuantity ?? 0);
        e.BasePrice = dto.BasePrice;
        e.DefaultPriceIfLost = dto.DefaultPriceIfLost;
        e.Supplier = dto.Supplier;
        e.IsActive = dto.IsActive;
        e.ImageUrl = dto.ImageUrl;
        e.UpdatedAt = DateTime.Now;

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var e = await _db.Equipments.FindAsync(id);
        if (e == null) return false;

        _db.Equipments.Remove(e);
        await _db.SaveChangesAsync();
        return true;
    }
}
