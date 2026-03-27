using HotelManagement.API.DTOs;

namespace HotelManagement.API.Services;

public interface IVoucherService
{
    Task<IEnumerable<VoucherDto>> GetAllAsync();
    Task<VoucherDto?> GetByIdAsync(int id);
    Task<VoucherDto?> CreateAsync(CreateVoucherDto dto);
    Task<bool> UpdateAsync(int id, UpdateVoucherDto dto);
    Task<bool> DeleteAsync(int id);
}
