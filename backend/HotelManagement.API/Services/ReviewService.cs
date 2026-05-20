using HotelManagement.API.Data;
using HotelManagement.API.DTOs;
using HotelManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Services;

public class ReviewService : IReviewService
{
    private readonly HotelDbContext _context;

    public ReviewService(HotelDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ReviewDto>> GetByRoomAsync(int roomId)
    {
        var room = await _context.Rooms
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == roomId);

        if (room?.RoomTypeId == null)
        {
            return Enumerable.Empty<ReviewDto>();
        }

        var reviews = await _context.Reviews
            .AsNoTracking()
            .Include(r => r.User)
            .Include(r => r.RoomType)
            .Where(r => r.RoomTypeId == room.RoomTypeId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return reviews.Select(r => new ReviewDto
        {
            Id = r.Id,
            UserId = r.UserId,
            RoomTypeId = r.RoomTypeId,
            RoomTypeName = r.RoomType?.Name,
            GuestName = r.User?.FullName ?? "Guest",
            Rating = r.Rating ?? 0,
            Comment = r.Comment,
            CreatedAt = r.CreatedAt ?? DateTime.UtcNow
        });
    }

    public async Task<IEnumerable<ReviewDto>> GetByUserAsync(int userId)
    {
        var reviews = await _context.Reviews
            .AsNoTracking()
            .Include(r => r.User)
            .Include(r => r.RoomType)
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        var roomIdsByRoomType = await _context.Rooms
            .AsNoTracking()
            .Where(r => r.RoomTypeId != null)
            .GroupBy(r => r.RoomTypeId!.Value)
            .ToDictionaryAsync(g => g.Key, g => g.Select(r => r.Id).FirstOrDefault());

        return reviews.Select(r => new ReviewDto
        {
            Id = r.Id,
            UserId = r.UserId,
            RoomTypeId = r.RoomTypeId,
            RoomId = r.RoomTypeId != null && roomIdsByRoomType.TryGetValue(r.RoomTypeId.Value, out var roomId) ? roomId : null,
            RoomTypeName = r.RoomType?.Name,
            GuestName = r.User?.FullName ?? "Guest",
            Rating = r.Rating ?? 0,
            Comment = r.Comment,
            CreatedAt = r.CreatedAt ?? DateTime.UtcNow
        });
    }

    public async Task<ReviewDto> CreateAsync(int userId, CreateReviewDto dto)
    {
        var room = await _context.Rooms
            .AsNoTracking()
            .Include(r => r.RoomType)
            .FirstOrDefaultAsync(r => r.Id == dto.RoomId);

        if (room?.RoomTypeId == null)
        {
            throw new ArgumentException("Room is invalid.");
        }

        var hasCompletedBooking = await _context.BookingDetails
            .Include(bd => bd.Booking)
            .AnyAsync(bd =>
                bd.RoomId == dto.RoomId &&
                bd.Booking != null &&
                bd.Booking.UserId == userId &&
                bd.Booking.Status == "CheckedOut");

        if (!hasCompletedBooking)
        {
            throw new ArgumentException("Bạn chỉ có thể đánh giá sau khi hoàn tất lưu trú.");
        }

        var existingReview = await _context.Reviews
            .FirstOrDefaultAsync(r => r.UserId == userId && r.RoomTypeId == room.RoomTypeId);

        if (existingReview != null)
        {
            existingReview.Rating = dto.Rating;
            existingReview.Comment = dto.Comment;
            existingReview.CreatedAt = DateTime.UtcNow;
        }
        else
        {
            existingReview = new Review
            {
                UserId = userId,
                RoomTypeId = room.RoomTypeId,
                Rating = dto.Rating,
                Comment = dto.Comment,
                CreatedAt = DateTime.UtcNow
            };
            _context.Reviews.Add(existingReview);
        }

        await _context.SaveChangesAsync();

        var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);

        return new ReviewDto
        {
            Id = existingReview.Id,
            UserId = existingReview.UserId,
            RoomTypeId = existingReview.RoomTypeId,
            RoomId = dto.RoomId,
            RoomTypeName = room.RoomType?.Name,
            GuestName = user?.FullName ?? "Guest",
            Rating = existingReview.Rating ?? 0,
            Comment = existingReview.Comment,
            CreatedAt = existingReview.CreatedAt ?? DateTime.UtcNow
        };
    }
}
