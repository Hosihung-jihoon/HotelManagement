using HotelManagement.API.Models;

namespace HotelManagement.API.Repositories;

/// <summary>
/// Interface cho RoomType Repository - Mẫu cho team copy.
/// Kế thừa IGenericRepository để có sẵn CRUD.
/// Thêm các method riêng nếu cần query đặc biệt.
/// </summary>
public interface IRoomTypeRepository : IGenericRepository<RoomType>
{
    Task<RoomType?> GetByIdWithDetailsAsync(int id);
    Task<IEnumerable<RoomType>> GetAllWithImagesAsync();
    
    Task<RoomImage> AddImageAsync(RoomImage image);
    Task<RoomImage?> GetImageByIdAsync(int imageId);
    Task<List<RoomImage>> GetImagesByRoomTypeIdAsync(int roomTypeId);
    Task UpdateImageAsync(RoomImage image);
}
