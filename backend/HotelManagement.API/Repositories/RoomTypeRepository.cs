using HotelManagement.API.Data;
using HotelManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Repositories;

/// <summary>
/// RoomType Repository - Mẫu cho team copy.
/// Kế thừa GenericRepository để có sẵn CRUD cơ bản.
/// Override hoặc thêm method riêng cho query phức tạp.
/// </summary>
public class RoomTypeRepository : GenericRepository<RoomType>, IRoomTypeRepository
{
    public RoomTypeRepository(HotelDbContext context) : base(context) { }

    /// <summary>
    /// Lấy RoomType kèm theo danh sách ảnh và tiện nghi
    /// </summary>
    public async Task<RoomType?> GetByIdWithDetailsAsync(int id)
    {
        return await _context.RoomTypes
            .Include(rt => rt.RoomImages)
            .Include(rt => rt.RoomTypeAmenities)
                .ThenInclude(rta => rta.Amenity)
            .Include(rt => rt.Rooms)
            .FirstOrDefaultAsync(rt => rt.Id == id);
    }

    /// <summary>
    /// Lấy tất cả RoomType kèm ảnh chính
    /// </summary>
    public async Task<IEnumerable<RoomType>> GetAllWithImagesAsync()
    {
        return await _context.RoomTypes
            .Include(rt => rt.RoomImages)
            .ToListAsync();
    }
}
