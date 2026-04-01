using HotelManagement.API.Data;
using HotelManagement.API.Middleware;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly HotelDbContext _context;

    public BookingsController(HotelDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyBookings()
    {
        var userIdClaim = User.FindFirst("userId")?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
            return Unauthorized();

        var userId = int.Parse(userIdClaim);

        var bookings = await _context.Bookings
            .Include(b => b.BookingDetails)
                .ThenInclude(bd => bd.RoomType)
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.Id)
            .Select(b => new
            {
                b.Id,
                b.BookingCode,
                b.GuestName,
                b.Status,
                Details = b.BookingDetails.Select(bd => new
                {
                    bd.RoomId,
                    bd.RoomTypeId,
                    RoomTypeName = bd.RoomType != null ? bd.RoomType.Name : "",
                    bd.CheckInDate,
                    bd.CheckOutDate,
                    bd.PricePerNight
                })
            })
            .ToListAsync();

        return Ok(bookings);
    }
}
