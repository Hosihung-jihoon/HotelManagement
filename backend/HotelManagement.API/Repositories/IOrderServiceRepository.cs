using HotelManagement.API.Models;

namespace HotelManagement.API.Repositories;

public interface IOrderServiceRepository : IGenericRepository<OrderService>
{
    Task<OrderService?> GetByIdWithDetailsAsync(int id);
    Task<OrderService> CreateWithDetailsAsync(OrderService orderService);
}
