using HotelManagement.API.Models;

namespace HotelManagement.API.Repositories;

public interface INotificationRepository : IGenericRepository<Notification>
{
    Task<IEnumerable<Notification>> GetByUserIdAsync(int userId);
    Task<IEnumerable<Notification>> GetAllOrderedAsync();
}
