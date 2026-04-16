using HotelManagement.API.DTOs;
using HotelManagement.API.Models;
using HotelManagement.API.Repositories;

namespace HotelManagement.API.Services;

public class VoucherService : IVoucherService
{
    private readonly IVoucherRepository _repository;

    public VoucherService(IVoucherRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<VoucherDto>> GetAllAsync()
    {
        var vouchers = await _repository.GetAllAsync();
        return vouchers.Select(MapToDto);
    }

    public async Task<VoucherDto?> GetByIdAsync(int id)
    {
        var voucher = await _repository.GetByIdAsync(id);
        return voucher == null ? null : MapToDto(voucher);
    }

    public async Task<VoucherDto?> CreateAsync(CreateVoucherDto dto)
    {
        var existingVoucher = await _repository.GetByCodeAsync(dto.Code);
        if (existingVoucher != null)
            return null; // Code already exists

        var entity = new Voucher
        {
            Code = dto.Code,
            DiscountType = dto.DiscountType,
            DiscountValue = dto.DiscountValue,
            MinBookingValue = dto.MinBookingValue,
            ValidFrom = dto.ValidFrom,
            ValidTo = dto.ValidTo,
            UsageLimit = dto.UsageLimit,
            IsActive = dto.IsActive,
            VoucherType = dto.VoucherType ?? "General",
            HolidayName = dto.HolidayName,
            MembershipTier = dto.MembershipTier,
        };

        var created = await _repository.CreateAsync(entity);
        return MapToDto(created);
    }

    public async Task<bool> UpdateAsync(int id, UpdateVoucherDto dto)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return false;

        entity.DiscountType = dto.DiscountType;
        entity.DiscountValue = dto.DiscountValue;
        entity.MinBookingValue = dto.MinBookingValue;
        entity.ValidFrom = dto.ValidFrom;
        entity.ValidTo = dto.ValidTo;
        entity.UsageLimit = dto.UsageLimit;
        entity.IsActive = dto.IsActive;
        entity.VoucherType = dto.VoucherType ?? "General";
        entity.HolidayName = dto.HolidayName;
        entity.MembershipTier = dto.MembershipTier;

        await _repository.UpdateAsync(entity);
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        if (!await _repository.ExistsAsync(id)) return false;
        await _repository.DeleteAsync(id);
        return true;
    }

    public async Task<bool> ToggleActiveAsync(int id)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return false;

        entity.IsActive = !entity.IsActive;
        await _repository.UpdateAsync(entity);
        return true;
    }

    private static VoucherDto MapToDto(Voucher v) => new()
    {
        Id = v.Id,
        Code = v.Code,
        DiscountType = v.DiscountType,
        DiscountValue = v.DiscountValue,
        MinBookingValue = v.MinBookingValue,
        ValidFrom = v.ValidFrom,
        ValidTo = v.ValidTo,
        UsageLimit = v.UsageLimit,
        IsActive = v.IsActive,
        VoucherType = v.VoucherType,
        HolidayName = v.HolidayName,
        MembershipTier = v.MembershipTier,
    };
}
