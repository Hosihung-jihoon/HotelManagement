using HotelManagement.API.DTOs;

namespace HotelManagement.API.Services;

public interface IRoomInventoryService
{
    Task<IEnumerable<RoomInventoryDto>> GetAllAsync();
    Task<RoomInventoryDto?> GetByIdAsync(int id);
    Task<IEnumerable<RoomInventoryDto>> GetByRoomIdAsync(int roomId);
    Task<RoomInventoryDto> CreateAsync(CreateRoomInventoryDto dto);
    Task<bool> UpdateAsync(int id, UpdateRoomInventoryDto dto);
    Task<bool> DeleteAsync(int id);
    Task<bool> CloneAsync(int fromRoomId, int toRoomId);
}
