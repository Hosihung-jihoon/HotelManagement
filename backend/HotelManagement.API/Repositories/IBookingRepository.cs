using HotelManagement.API.Models;

namespace HotelManagement.API.Repositories;

public interface IBookingRepository : IGenericRepository<Booking>
{
    Task<Booking?> GetByBookingCodeAsync(string bookingCode);
}
