using HotelManagement.API.DTOs;

namespace HotelManagement.API.Services;

public interface IBookingService
{
    Task<IEnumerable<BookingDto>> GetAllAsync();
    Task<BookingDto?> GetByIdAsync(int id);
    Task<BookingDto> CreateAsync(CreateBookingDto dto);
    Task<bool> UpdateAsync(int id, UpdateBookingDto dto);
    Task<bool> DeleteAsync(int id);
}
