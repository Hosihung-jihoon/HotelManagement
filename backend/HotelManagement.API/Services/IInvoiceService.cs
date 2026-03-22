using HotelManagement.API.DTOs;

namespace HotelManagement.API.Services;

/// <summary>
/// Interface Service cho Invoice.
/// Service chứa business logic, Controller chỉ gọi Service.
/// </summary>
public interface IInvoiceService
{
    Task<IEnumerable<InvoiceDto>> GetAllAsync();
    Task<InvoiceDetailDto?> GetByIdAsync(int id);
    Task<InvoiceDto> CreateAsync(CreateInvoiceDto dto);
    Task<bool> UpdateAsync(int id, UpdateInvoiceDto dto);
    Task<bool> DeleteAsync(int id);
}
