using HotelManagement.API.DTOs;

namespace HotelManagement.API.Services;

/// <summary>
/// Interface Service cho Room.
/// Service chứa business logic, Controller chỉ gọi Service.
/// </summary>
public interface IRoomService
{
    Task<IEnumerable<RoomDto>> GetAllAsync();
    Task<RoomDetailDto?> GetByIdAsync(int id);
    Task<(RoomDto? result, string? error)> CreateAsync(CreateRoomDto dto);
    Task<(bool success, string? error)> UpdateAsync(int id, UpdateRoomDto dto);
    Task<bool> DeleteAsync(int id);
}
