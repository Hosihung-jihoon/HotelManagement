using HotelManagement.API.Data;
using HotelManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Repositories;

/// <summary>
/// Room Repository - Kế thừa GenericRepository để có sẵn CRUD cơ bản.
/// Override hoặc thêm method riêng cho query phức tạp.
/// </summary>
public class RoomRepository : GenericRepository<Room>, IRoomRepository
{
    public RoomRepository(HotelDbContext context) : base(context) { }

    /// <summary>
    /// Lấy Room kèm thông tin RoomType
    /// </summary>
    public async Task<Room?> GetByIdWithDetailsAsync(int id)
    {
        return await _context.Rooms
            .Include(r => r.RoomType)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    /// <summary>
    /// Lấy tất cả Room kèm tên loại phòng
    /// </summary>
    public async Task<IEnumerable<Room>> GetAllWithRoomTypeAsync()
    {
        return await _context.Rooms
            .Include(r => r.RoomType)
            .OrderBy(r => r.Floor)
            .ThenBy(r => r.RoomNumber)
            .ToListAsync();
    }

    /// <summary>
    /// Kiểm tra số phòng đã tồn tại chưa (dùng khi tạo/cập nhật để validate)
    /// excludeId: bỏ qua chính record đang update
    /// </summary>
    public async Task<bool> RoomNumberExistsAsync(string roomNumber, int? excludeId = null)
    {
        return await _context.Rooms
            .AnyAsync(r => r.RoomNumber == roomNumber && r.Id != excludeId);
    }
}
