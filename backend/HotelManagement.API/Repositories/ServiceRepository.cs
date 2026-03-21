using HotelManagement.API.Data;
using HotelManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Repositories;

/// <summary>
/// Service Repository.
/// Kế thừa GenericRepository để có sẵn CRUD cơ bản.
/// </summary>
public class ServiceRepository : GenericRepository<Service>, IServiceRepository
{
    public ServiceRepository(HotelDbContext context) : base(context) { }

    /// <summary>
    /// Lấy Service kèm theo thông tin Category
    /// </summary>
    public async Task<Service?> GetByIdWithCategoryAsync(int id)
    {
        return await _context.Services
            .Include(s => s.Category)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    /// <summary>
    /// Lấy tất cả Services kèm theo thông tin Category
    /// </summary>
    public async Task<IEnumerable<Service>> GetAllWithCategoryAsync()
    {
        return await _context.Services
            .Include(s => s.Category)
            .ToListAsync();
    }
}
