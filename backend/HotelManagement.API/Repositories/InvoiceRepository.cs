using HotelManagement.API.Data;
using HotelManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Repositories;

/// <summary>
/// Invoice Repository - Kế thừa GenericRepository để có sẵn CRUD cơ bản.
/// Override hoặc thêm method riêng cho query phức tạp.
/// </summary>
public class InvoiceRepository : GenericRepository<Invoice>, IInvoiceRepository
{
    public InvoiceRepository(HotelDbContext context) : base(context) { }

    /// <summary>
    /// Lấy Invoice kèm theo danh sách Payments
    /// </summary>
    public async Task<Invoice?> GetByIdWithPaymentsAsync(int id)
    {
        return await _context.Invoices
            .Include(i => i.Payments)
            .Include(i => i.Booking)
            .FirstOrDefaultAsync(i => i.Id == id);
    }

    /// <summary>
    /// Lấy tất cả Invoice kèm Booking
    /// </summary>
    public async Task<IEnumerable<Invoice>> GetAllWithBookingAsync()
    {
        return await _context.Invoices
            .Include(i => i.Booking)
            .ToListAsync();
    }
}
