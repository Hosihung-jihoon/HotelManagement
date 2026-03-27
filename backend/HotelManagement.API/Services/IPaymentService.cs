using HotelManagement.API.DTOs;

namespace HotelManagement.API.Services;

/// <summary>
/// Interface Service cho Payment.
/// Service chứa business logic, Controller chỉ gọi Service.
/// </summary>
public interface IPaymentService
{
    Task<IEnumerable<PaymentDto>> GetAllAsync();
    Task<PaymentDto?> GetByIdAsync(int id);
    Task<IEnumerable<PaymentDto>> GetByInvoiceIdAsync(int invoiceId);
    Task<PaymentDto> CreateAsync(CreatePaymentDto dto);
    Task<bool> UpdateAsync(int id, UpdatePaymentDto dto);
    Task<bool> DeleteAsync(int id);
}
