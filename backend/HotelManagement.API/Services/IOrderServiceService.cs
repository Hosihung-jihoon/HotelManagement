using HotelManagement.API.DTOs;

namespace HotelManagement.API.Services;

public interface IOrderServiceService
{
    Task<OrderServiceDto> CreateAsync(CreateOrderServiceDto dto);
    Task<IEnumerable<OrderServiceDto>> GetByBookingDetailIdAsync(int bookingDetailId);
    Task<OrderServiceDto?> GetByIdAsync(int id);
}
