using HotelManagement.API.Data;
using HotelManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Repositories;

public class RoomInventoryRepository : GenericRepository<RoomInventory>, IRoomInventoryRepository
{
    public RoomInventoryRepository(HotelDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<RoomInventory>> GetByRoomIdAsync(int roomId)
    {
        return await _dbSet
            .Where(ri => ri.RoomId == roomId)
            .ToListAsync();
    }

    public async Task CreateRangeAsync(IEnumerable<RoomInventory> items)
    {
        await _dbSet.AddRangeAsync(items);
        await _context.SaveChangesAsync();
    }
}
