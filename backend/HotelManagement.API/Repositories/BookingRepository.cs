using HotelManagement.API.Data;
using HotelManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Repositories;

public class BookingRepository : GenericRepository<Booking>, IBookingRepository
{
    public BookingRepository(HotelDbContext context) : base(context)
    {
    }

    public async Task<Booking?> GetByBookingCodeAsync(string bookingCode)
    {
        return await _dbSet.FirstOrDefaultAsync(b => b.BookingCode == bookingCode);
    }
}
