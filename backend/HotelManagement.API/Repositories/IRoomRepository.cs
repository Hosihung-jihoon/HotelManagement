using HotelManagement.API.Models;

namespace HotelManagement.API.Repositories;

/// <summary>
/// Interface cho Room Repository.
/// Kế thừa IGenericRepository để có sẵn CRUD.
/// Thêm method riêng cho query kèm RoomType.
/// </summary>
public interface IRoomRepository : IGenericRepository<Room>
{
    Task<Room?> GetByIdWithDetailsAsync(int id);
    Task<IEnumerable<Room>> GetAllWithRoomTypeAsync();
    Task<bool> RoomNumberExistsAsync(string roomNumber, int? excludeId = null);
}
