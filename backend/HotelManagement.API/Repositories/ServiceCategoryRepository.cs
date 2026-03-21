using HotelManagement.API.Data;
using HotelManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Repositories;

/// <summary>
/// ServiceCategory Repository.
/// Kế thừa GenericRepository để có sẵn CRUD cơ bản.
/// </summary>
public class ServiceCategoryRepository : GenericRepository<ServiceCategory>, IServiceCategoryRepository
{
    public ServiceCategoryRepository(HotelDbContext context) : base(context) { }

    /// <summary>
    /// Lấy ServiceCategory kèm theo danh sách Services
    /// </summary>
    public async Task<ServiceCategory?> GetByIdWithServicesAsync(int id)
    {
        return await _context.ServiceCategories
            .Include(sc => sc.Services)
            .FirstOrDefaultAsync(sc => sc.Id == id);
    }
}
