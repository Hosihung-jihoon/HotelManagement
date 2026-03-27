using HotelManagement.API.Models;

namespace HotelManagement.API.Repositories;

/// <summary>
/// Interface cho Payment Repository.
/// Kế thừa IGenericRepository để có sẵn CRUD.
/// Thêm method riêng để query theo InvoiceId.
/// </summary>
public interface IPaymentRepository : IGenericRepository<Payment>
{
    Task<IEnumerable<Payment>> GetByInvoiceIdAsync(int invoiceId);
}
