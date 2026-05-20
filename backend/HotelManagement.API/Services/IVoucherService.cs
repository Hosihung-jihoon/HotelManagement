using HotelManagement.API.DTOs;

namespace HotelManagement.API.Services;

public interface IVoucherService
{
    Task<IEnumerable<VoucherDto>> GetAllAsync();
    Task<VoucherDto?> GetByIdAsync(int id);
    Task<ValidatedVoucherDto?> ValidateAsync(string code);
    Task<VoucherDto?> CreateAsync(CreateVoucherDto dto);
    Task<bool> UpdateAsync(int id, UpdateVoucherDto dto);
    Task<bool> DeleteAsync(int id);
    Task<bool> ToggleActiveAsync(int id);
}
