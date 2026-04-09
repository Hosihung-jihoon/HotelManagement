using HotelManagement.API.Data;
using HotelManagement.API.DTOs;
using HotelManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Services;

public interface ILossAndDamageService
{
    Task<IEnumerable<LossAndDamageDto>> GetAllAsync();
    Task<LossAndDamageDto?> GetByIdAsync(int id);
    Task<LossAndDamageDto> CreateAsync(CreateLossAndDamageDto dto);
    Task<bool> UpdateAsync(int id, UpdateLossAndDamageDto dto);
    Task<bool> ToggleStatusAsync(int id);
    Task<bool> DeleteAsync(int id);
}

public class LossAndDamageService : ILossAndDamageService
{
    private readonly HotelDbContext _db;

    public LossAndDamageService(HotelDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<LossAndDamageDto>> GetAllAsync()
    {
        return await _db.LossAndDamages
            .Include(l => l.RoomInventory)
                .ThenInclude(ri => ri != null ? ri.Room : null)
            .Include(l => l.BookingDetail)
                .ThenInclude(bd => bd != null ? bd.Room : null)
            .OrderByDescending(l => l.CreatedAt)
            .Select(l => new LossAndDamageDto
            {
                Id               = l.Id,
                BookingDetailId  = l.BookingDetailId,
                RoomInventoryId  = l.RoomInventoryId,
                ItemName         = l.RoomInventory != null ? l.RoomInventory.ItemName : "Không xác định",
                RoomNumber       = (l.BookingDetail != null && l.BookingDetail.Room != null)
                                    ? l.BookingDetail.Room.RoomNumber
                                    : (l.RoomInventory != null && l.RoomInventory.Room != null)
                                        ? l.RoomInventory.Room.RoomNumber : null,
                Quantity         = l.Quantity,
                PenaltyAmount    = l.PenaltyAmount,
                Description      = l.Description,
                ImageUrl         = l.ImageUrl,
                IsPaid           = l.IsPaid,
                CreatedAt        = l.CreatedAt,
                UpdatedAt        = l.UpdatedAt,
            })
            .ToListAsync();
    }

    public async Task<LossAndDamageDto?> GetByIdAsync(int id)
    {
        var l = await _db.LossAndDamages
            .Include(x => x.RoomInventory).ThenInclude(ri => ri != null ? ri.Room : null)
            .Include(x => x.BookingDetail).ThenInclude(bd => bd != null ? bd.Room : null)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (l == null) return null;

        return new LossAndDamageDto
        {
            Id              = l.Id,
            BookingDetailId = l.BookingDetailId,
            RoomInventoryId = l.RoomInventoryId,
            ItemName        = l.RoomInventory?.ItemName ?? "Không xác định",
            RoomNumber      = l.BookingDetail?.Room?.RoomNumber ?? l.RoomInventory?.Room?.RoomNumber,
            Quantity        = l.Quantity,
            PenaltyAmount   = l.PenaltyAmount,
            Description     = l.Description,
            ImageUrl        = l.ImageUrl,
            IsPaid          = l.IsPaid,
            CreatedAt       = l.CreatedAt,
            UpdatedAt       = l.UpdatedAt,
        };
    }

    public async Task<LossAndDamageDto> CreateAsync(CreateLossAndDamageDto dto)
    {
        var entity = new LossAndDamage
        {
            BookingDetailId = dto.BookingDetailId,
            RoomInventoryId = dto.RoomInventoryId,
            Quantity        = dto.Quantity,
            PenaltyAmount   = dto.PenaltyAmount,
            Description     = dto.Description,
            ImageUrl        = dto.ImageUrl,
            CreatedAt       = DateTime.Now,
        };
        _db.LossAndDamages.Add(entity);
        await _db.SaveChangesAsync();
        return (await GetByIdAsync(entity.Id))!;
    }

    public async Task<bool> UpdateAsync(int id, UpdateLossAndDamageDto dto)
    {
        var entity = await _db.LossAndDamages.FindAsync(id);
        if (entity == null) return false;

        entity.Quantity      = dto.Quantity;
        entity.PenaltyAmount = dto.PenaltyAmount;
        entity.Description   = dto.Description;
        entity.ImageUrl      = dto.ImageUrl;
        entity.UpdatedAt     = DateTime.Now;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ToggleStatusAsync(int id)
    {
        var entity = await _db.LossAndDamages.FindAsync(id);
        if (entity == null) return false;

        entity.IsPaid = !entity.IsPaid;
        entity.UpdatedAt = DateTime.Now;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _db.LossAndDamages.FindAsync(id);
        if (entity == null) return false;

        _db.LossAndDamages.Remove(entity);
        await _db.SaveChangesAsync();
        return true;
    }
}
