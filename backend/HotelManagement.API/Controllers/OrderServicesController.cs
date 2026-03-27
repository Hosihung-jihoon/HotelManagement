using HotelManagement.API.DTOs;
using HotelManagement.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrderServicesController : ControllerBase
{
    private readonly IOrderServiceService _service;

    public OrderServicesController(IOrderServiceService service)
    {
        _service = service;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderServiceDto>> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null)
            return NotFound(new { message = $"Không tìm thấy OrderService với ID = {id}" });

        return Ok(result);
    }

    [HttpGet("booking-detail/{bookingDetailId}")]
    public async Task<ActionResult<IEnumerable<OrderServiceDto>>> GetByBookingDetailId(int bookingDetailId)
    {
        var result = await _service.GetByBookingDetailIdAsync(bookingDetailId);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<OrderServiceDto>> Create([FromBody] CreateOrderServiceDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var result = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
