using HotelManagement.API.DTOs;
using HotelManagement.API.Services;
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

    [HttpGet("{id}")]
    public async Task<ActionResult<BookingDto>> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null)
            return NotFound(new { message = $"Không tìm thấy đơn đặt phòng với ID = {id}" });

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
        var success = await _service.UpdateAsync(id, dto);
        if (!success)
            return NotFound(new { message = $"Không tìm thấy đơn đặt phòng với ID = {id}" });

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _service.DeleteAsync(id);
        if (!success)
            return NotFound(new { message = $"Không tìm thấy đơn đặt phòng với ID = {id}" });

        return NoContent();
    }

    [HttpPost("search")]
    public async Task<ActionResult<IEnumerable<RoomAvailabilityResponseDto>>> SearchAvailableRooms([FromBody] BookingSearchRequestDto request)
    {
        if (request.CheckInDate >= request.CheckOutDate)
            return BadRequest(new { message = "Ngay CheckOut phải lớn hơn CheckIn" });

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
}
