using HotelManagement.API.Data;
using HotelManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Repositories;

public class OrderServiceRepository : GenericRepository<OrderService>, IOrderServiceRepository
{
    public OrderServiceRepository(HotelDbContext context) : base(context)
    {
    }

    public async Task<OrderService?> GetByIdWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(o => o.OrderServiceDetails)
            .ThenInclude(d => d.Service)
            .FirstOrDefaultAsync(o => o.Id == id);
    }
    
    public async Task<OrderService> CreateWithDetailsAsync(OrderService orderService)
    {
        await _dbSet.AddAsync(orderService);
        await _context.SaveChangesAsync();
        return orderService;
    }
}
