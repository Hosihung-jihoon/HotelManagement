using HotelManagement.API.Data;
using HotelManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Repositories;

/// <summary>
/// Payment Repository - Kế thừa GenericRepository để có sẵn CRUD cơ bản.
/// Thêm method riêng để query theo InvoiceId.
/// </summary>
public class PaymentRepository : GenericRepository<Payment>, IPaymentRepository
{
    public PaymentRepository(HotelDbContext context) : base(context) { }

    /// <summary>
    /// Lấy tất cả Payment theo InvoiceId
    /// </summary>
    public async Task<IEnumerable<Payment>> GetByInvoiceIdAsync(int invoiceId)
    {
        return await _context.Payments
            .Where(p => p.InvoiceId == invoiceId)
            .ToListAsync();
    }
}
