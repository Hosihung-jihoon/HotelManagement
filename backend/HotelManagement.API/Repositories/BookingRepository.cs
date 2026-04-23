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

    public async Task<Booking?> GetFullDetailAsync(int id)
    {
        return await _dbSet
            .Include(b => b.User)
            .Include(b => b.Voucher)
            .Include(b => b.BookingDetails)
                .ThenInclude(bd => bd.Room)
                    .ThenInclude(r => r!.RoomType)
            .Include(b => b.BookingDetails)
                .ThenInclude(bd => bd.RoomType)
            .Include(b => b.Invoice)
                .ThenInclude(inv => inv!.Payments)
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    public async Task<IEnumerable<AuditLog>> GetAuditLogsAsync(int bookingId)
    {
        return await _context.AuditLogs
            .Include(al => al.User)
            .Where(al => al.TableName == "Bookings" && al.RecordId == bookingId)
            .OrderByDescending(al => al.CreatedAt)
            .ToListAsync();
    }

    public async Task AddAuditLogAsync(int bookingId, string action, string? oldValue = null, string? newValue = null, int? userId = null)
    {
        var log = new AuditLog
        {
            RecordId = bookingId,
            TableName = "Bookings",
            Action = action,
            OldValue = oldValue,
            NewValue = newValue,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };
        await _context.AuditLogs.AddAsync(log);
        await _context.SaveChangesAsync();
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

            // RACE CONDITION HANDLING: 
            // SQL Server: Lock these specific rooms using WITH (UPDLOCK)
            // SQLite: Doesn't support row-level hints like UPDLOCK.
            var dbProvider = _context.Database.ProviderName;
            List<Room> lockedRooms;

            if (dbProvider != null && dbProvider.Contains("SqlServer"))
            {
                var roomIdsString = string.Join(",", roomIdsToBook);
                lockedRooms = await _context.Rooms
                    .FromSqlRaw($"SELECT * FROM Rooms WITH (UPDLOCK) WHERE id IN ({roomIdsString})")
                    .ToListAsync();
            }
            else
            {
                // SQLite or others: just select the rooms. SQLite locks the DB file during transaction anyway.
                lockedRooms = await _context.Rooms
                    .Where(r => roomIdsToBook.Contains(r.Id))
                    .ToListAsync();
            }

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

    public async Task<IEnumerable<Booking>> GetAllWithRoomsAsync()
    {
        return await _dbSet
            .Include(b => b.BookingDetails)
                .ThenInclude(bd => bd.Room)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }
}
