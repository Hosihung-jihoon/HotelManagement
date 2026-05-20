using HotelManagement.API.DTOs;

namespace HotelManagement.API.Services;

public interface IBookingService
{
    Task<IEnumerable<BookingDto>> GetAllAsync();
    Task<IEnumerable<BookingDto>> GetMyBookingsAsync(int userId);
    Task<BookingDto?> GetByIdAsync(int id);
    Task<BookingFullDetailDto?> GetFullDetailAsync(int id);
    Task<BookingDto> CreateAsync(CreateBookingDto dto);
    Task<bool> UpdateAsync(int id, UpdateBookingDto dto);
    Task<(bool success, string? error)> CancelAsync(int id, int userId);
    Task<bool> DeleteAsync(int id);
    Task<IEnumerable<RoomAvailabilityResponseDto>> SearchAvailableRoomsAsync(BookingSearchRequestDto request);
    Task<BookingDto> CreateAdvancedAsync(CreateAdvancedBookingDto dto);
    Task<bool> AddPaymentAsync(int bookingId, AddBookingPaymentDto dto);
}
