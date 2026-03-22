using HotelManagement.API.Models;

namespace HotelManagement.API.Repositories;

public interface IBookingRepository : IGenericRepository<Booking>
{
    Task<Booking?> GetByBookingCodeAsync(string bookingCode);
    Task<IEnumerable<Room>> FindAvailableRoomsAsync(DateTime checkIn, DateTime checkOut, int? adults, int? children);
    Task<Booking> CreateWithLockAsync(Booking booking, IEnumerable<BookingDetail> details);
}
