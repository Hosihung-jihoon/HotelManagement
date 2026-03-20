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

    public async Task<IEnumerable<Room>> FindAvailableRoomsAsync(DateTime checkIn, DateTime checkOut, int? adults, int? children)
    {
        // 1. Get Room IDs that are currently booked and overlap with the requested dates
        var overlappingRoomIds = await _context.BookingDetails
            .Where(bd => bd.Booking != null && bd.Booking.Status != "Cancelled" &&
                         bd.CheckInDate < checkOut && bd.CheckOutDate > checkIn)
            .Select(bd => bd.RoomId)
            .Distinct()
            .ToListAsync();

        // 2. Query available rooms
        var query = _context.Rooms
            .Include(r => r.RoomType)
            .Where(r => r.Status == "Available" && !overlappingRoomIds.Contains(r.Id));

        if (adults.HasValue)
        {
            query = query.Where(r => r.RoomType != null && r.RoomType.CapacityAdults >= adults.Value);
        }
        if (children.HasValue)
        {
            query = query.Where(r => r.RoomType != null && r.RoomType.CapacityChildren >= children.Value);
        }

        return await query.ToListAsync();
    }

    public async Task<Booking> CreateWithLockAsync(Booking booking, IEnumerable<BookingDetail> details)
    {
        using var transaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
        try
        {
            var roomIdsToBook = details.Select(d => d.RoomId).Distinct().ToList();
            if (!roomIdsToBook.Any())
                throw new Exception("No rooms to book.");

            // RACE CONDITION HANDLING: Lock these specific rooms using WITH (UPDLOCK)
            // Note: Since we use FromSqlRaw, we must ensure we are materializing the entities here to hold the lock
            var lockedRooms = await _context.Rooms
                .FromSqlRaw($"SELECT * FROM Rooms WITH (UPDLOCK) WHERE id IN ({string.Join(",", roomIdsToBook)})")
                .ToListAsync();

            if (lockedRooms.Count != roomIdsToBook.Count)
                throw new Exception("One or more rooms are invalid or do not exist.");

            // Check overlap again after acquiring the lock to ensure no one else booked them right before us
            var minCheckIn = details.Min(d => d.CheckInDate);
            var maxCheckOut = details.Max(d => d.CheckOutDate);

            var overlappingRooms = await _context.BookingDetails
                .Where(bd => bd.Booking != null && bd.Booking.Status != "Cancelled" &&
                             roomIdsToBook.Contains(bd.RoomId) &&
                             bd.CheckInDate < maxCheckOut && bd.CheckOutDate > minCheckIn)
                .AnyAsync();

            if (overlappingRooms)
            {
                throw new Exception("One or more requested rooms are no longer available for the selected dates.");
            }

            // Save the Booking
            await _dbSet.AddAsync(booking);
            await _context.SaveChangesAsync();

            // Link and save BookingDetails
            foreach (var detail in details)
            {
                detail.BookingId = booking.Id;
                await _context.BookingDetails.AddAsync(detail);
            }
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();
            return booking;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}
