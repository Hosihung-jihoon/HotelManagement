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
        return vouchers.Select(v => new VoucherDto
        {
            Id = v.Id,
            Code = v.Code,
            DiscountType = v.DiscountType,
            DiscountValue = v.DiscountValue,
            MinBookingValue = v.MinBookingValue,
            ValidFrom = v.ValidFrom,
            ValidTo = v.ValidTo,
            UsageLimit = v.UsageLimit
        });
    }

    public async Task<VoucherDto?> GetByIdAsync(int id)
    {
        var voucher = await _repository.GetByIdAsync(id);
        if (voucher == null) return null;

        return new VoucherDto
        {
            Id = voucher.Id,
            Code = voucher.Code,
            DiscountType = voucher.DiscountType,
            DiscountValue = voucher.DiscountValue,
            MinBookingValue = voucher.MinBookingValue,
            ValidFrom = voucher.ValidFrom,
            ValidTo = voucher.ValidTo,
            UsageLimit = voucher.UsageLimit
        };
    }

    public async Task<VoucherDto?> CreateAsync(CreateVoucherDto dto)
    {
        var existingVoucher = await _repository.GetByCodeAsync(dto.Code);
        if (existingVoucher != null)
        {
            return null; // Code already exists
        }

        var entity = new Voucher
        {
            Code = dto.Code,
            DiscountType = dto.DiscountType,
            DiscountValue = dto.DiscountValue,
            MinBookingValue = dto.MinBookingValue,
            ValidFrom = dto.ValidFrom,
            ValidTo = dto.ValidTo,
            UsageLimit = dto.UsageLimit
        };

        var created = await _repository.CreateAsync(entity);

        return new VoucherDto
        {
            Id = created.Id,
            Code = created.Code,
            DiscountType = created.DiscountType,
            DiscountValue = created.DiscountValue,
            MinBookingValue = created.MinBookingValue,
            ValidFrom = created.ValidFrom,
            ValidTo = created.ValidTo,
            UsageLimit = created.UsageLimit
        };
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
