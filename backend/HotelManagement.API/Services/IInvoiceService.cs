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

    /// <summary>
    /// Preview bill — tự động gom tiền phòng + dịch vụ + phạt, tính voucher + thuế.
    /// Không lưu DB.
    /// </summary>
    Task<BillDto> GetBillAsync(int bookingId);

    /// <summary>
    /// Gom bill + lưu/cập nhật Invoice vào DB.
    /// </summary>
    Task<BillDto> GenerateBillAsync(int bookingId);

    /// <summary>
    /// Xuất hóa đơn PDF theo InvoiceId.
    /// </summary>
    Task<byte[]> ExportPdfAsync(int invoiceId);
}
