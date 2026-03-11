using HotelManagement.API.DTOs;

namespace HotelManagement.API.Services;

/// <summary>
/// Interface Service cho RoomType - Mẫu cho team copy.
/// Service chứa business logic, Controller chỉ gọi Service.
/// </summary>
public interface IRoomTypeService
{
    Task<IEnumerable<RoomTypeDto>> GetAllAsync();
    Task<RoomTypeDetailDto?> GetByIdAsync(int id);
    Task<RoomTypeDto> CreateAsync(CreateRoomTypeDto dto);
    Task<bool> UpdateAsync(int id, UpdateRoomTypeDto dto);
    Task<bool> DeleteAsync(int id);
}
