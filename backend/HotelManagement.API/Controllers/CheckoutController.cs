using HotelManagement.API.Data;
using HotelManagement.API.DTOs;
using HotelManagement.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CheckoutController : ControllerBase
{
    private readonly HotelDbContext _context;

    public CheckoutController(HotelDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Tạo booking và trả về mã booking, số tiền
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Checkout([FromBody] CheckoutRequestDto dto)
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            int? userId = null;
            if (!string.IsNullOrEmpty(userIdClaim))
            {
                userId = int.Parse(userIdClaim);
            }

            // Generate BookingCode
            var bCode = "BK" + DateTime.Now.ToString("yyMMddHHmmss") + new Random().Next(100, 999);

            var booking = new Booking
            {
                UserId = userId,
                GuestName = dto.GuestName,
                GuestPhone = dto.GuestPhone,
                GuestEmail = dto.GuestEmail,
                BookingCode = bCode,
                Status = "Pending"
            };

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            // Create BookingDetail
            var bookingDetail = new BookingDetail
            {
                BookingId = booking.Id,
                RoomId = dto.RoomId,
                RoomTypeId = dto.RoomTypeId,
                CheckInDate = dto.CheckInDate,
                CheckOutDate = dto.CheckOutDate,
                PricePerNight = dto.PricePerNight
            };

            _context.BookingDetails.Add(bookingDetail);
            await _context.SaveChangesAsync();

            // Tính tiền
            var nights = (dto.CheckOutDate - dto.CheckInDate).Days;
            if (nights <= 0) nights = 1;

            var totalAmount = nights * dto.PricePerNight;

            return Ok(new {
                BookingId = booking.Id,
                BookingCode = booking.BookingCode,
                TotalAmount = totalAmount,
                Message = "Tạo booking thành công. Vui lòng thanh toán."
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = $"Lỗi tạo booking: {ex.Message}" });
        }
    }
}
