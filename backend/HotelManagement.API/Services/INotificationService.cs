using HotelManagement.API.DTOs;

namespace HotelManagement.API.Services;

public interface INotificationService
{
    Task<IEnumerable<NotificationDto>> GetAllAsync();
    Task<NotificationDto?> GetByIdAsync(int id);
    Task<IEnumerable<NotificationDto>> GetByUserIdAsync(int userId);
    Task<NotificationDto> CreateAsync(CreateNotificationDto dto);
    Task<bool> MarkAsReadAsync(int id, UpdateNotificationDto dto);
    Task<bool> DeleteAsync(int id);
}
