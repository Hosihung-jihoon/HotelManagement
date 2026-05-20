using HotelManagement.API.DTOs;
using HotelManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _service;

    public BookingsController(IBookingService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BookingDto>>> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    [Authorize]
    [HttpGet("my-bookings")]
    public async Task<ActionResult<IEnumerable<BookingDto>>> GetMyBookings()
    {
        var result = await _service.GetMyBookingsAsync(GetCurrentUserId());
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BookingDto>> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null)
            return NotFound(new { message = $"Khong tim thay don dat phong voi ID = {id}" });

        return Ok(result);
    }

    [HttpGet("{id}/detail")]
    public async Task<ActionResult<BookingFullDetailDto>> GetFullDetail(int id)
    {
        var result = await _service.GetFullDetailAsync(id);
        if (result == null)
            return NotFound(new { message = $"Khong tim thay don dat phong voi ID = {id}" });

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<BookingDto>> Create([FromBody] CreateBookingDto dto)
    {
        var result = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateBookingDto dto)
    {
        try
        {
            var success = await _service.UpdateAsync(id, dto);
            if (!success)
                return NotFound(new { message = $"Khong tim thay don dat phong voi ID = {id}" });

            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpPut("{id}/cancel")]
    public async Task<IActionResult> Cancel(int id)
    {
        var (success, error) = await _service.CancelAsync(id, GetCurrentUserId());
        if (error != null)
            return BadRequest(new { message = error });
        if (!success)
            return NotFound(new { message = $"Khong tim thay don dat phong voi ID = {id}" });

        return Ok(new { message = "Huy booking thanh cong." });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _service.DeleteAsync(id);
        if (!success)
            return NotFound(new { message = $"Khong tim thay don dat phong voi ID = {id}" });

        return NoContent();
    }

    [HttpPost("search")]
    public async Task<ActionResult<IEnumerable<RoomAvailabilityResponseDto>>> SearchAvailableRooms([FromBody] BookingSearchRequestDto request)
    {
        if (request.CheckInDate >= request.CheckOutDate)
            return BadRequest(new { message = "Ngay CheckOut phai lon hon CheckIn" });

        var result = await _service.SearchAvailableRoomsAsync(request);
        return Ok(result);
    }

    [HttpPost("advanced-create")]
    public async Task<ActionResult<BookingDto>> CreateAdvanced([FromBody] CreateAdvancedBookingDto dto)
    {
        try
        {
            var result = await _service.CreateAdvancedAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id}/payments")]
    public async Task<IActionResult> AddPayment(int id, [FromBody] AddBookingPaymentDto dto)
    {
        var success = await _service.AddPaymentAsync(id, dto);
        if (!success)
            return NotFound(new { message = $"Khong tim thay don dat phong voi ID = {id}" });

        return Ok(new { message = "Ghi nhan thanh toan thanh cong" });
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst("userId")?.Value;
        return int.Parse(userIdClaim!);
    }
}
