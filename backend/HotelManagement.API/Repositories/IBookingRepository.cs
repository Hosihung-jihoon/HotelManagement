using HotelManagement.API.Models;

namespace HotelManagement.API.Repositories;

public interface IBookingRepository : IGenericRepository<Booking>
{
    Task<Booking?> GetByBookingCodeAsync(string bookingCode);
    Task<Booking?> GetFullDetailAsync(int id);
    Task<IEnumerable<AuditLog>> GetAuditLogsAsync(int bookingId);
    Task AddAuditLogAsync(int bookingId, string action, string? oldValue = null, string? newValue = null, int? userId = null);
    Task<IEnumerable<Room>> FindAvailableRoomsAsync(DateTime checkIn, DateTime checkOut, int? adults, int? children);
    Task<Booking> CreateWithLockAsync(Booking booking, IEnumerable<BookingDetail> details);
    Task<IEnumerable<Booking>> GetAllWithRoomsAsync();
}
