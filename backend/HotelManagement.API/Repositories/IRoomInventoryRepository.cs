using HotelManagement.API.Models;

namespace HotelManagement.API.Repositories;

public interface IRoomInventoryRepository : IGenericRepository<RoomInventory>
{
    Task<IEnumerable<RoomInventory>> GetByRoomIdAsync(int roomId);
    Task CreateRangeAsync(IEnumerable<RoomInventory> items);
}
