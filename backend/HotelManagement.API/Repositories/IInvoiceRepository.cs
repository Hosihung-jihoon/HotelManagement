using HotelManagement.API.Models;

namespace HotelManagement.API.Repositories;

/// <summary>
/// Interface cho Invoice Repository.
/// Kế thừa IGenericRepository để có sẵn CRUD.
/// Thêm method riêng để query kèm Payments.
/// </summary>
public interface IInvoiceRepository : IGenericRepository<Invoice>
{
    Task<Invoice?> GetByIdWithPaymentsAsync(int id);
    Task<IEnumerable<Invoice>> GetAllWithBookingAsync();
}
